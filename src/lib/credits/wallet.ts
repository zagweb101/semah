import { prisma } from "@/lib/prisma";
import type { CreditTransactionType, CreditOperationType } from "@/generated/prisma/client";

export interface WalletOperationInput {
  organizationId: string; userId: string; brandProjectId?: string; aiJobId?: string;
  operationType?: CreditOperationType; reason?: string; adminId?: string; idempotencyKey: string;
}

export async function reserveCredits(input: WalletOperationInput & { amount: number }) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.creditTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) {
      const w = await tx.creditWallet.findUniqueOrThrow({ where: { organizationId: input.organizationId } });
      return { success: true, reservedAmount: existing.amount, newBalance: w.balance, newReserved: w.reserved, reason: "Already processed" };
    }
    const wallet = await tx.creditWallet.findUnique({ where: { organizationId: input.organizationId } });
    if (!wallet) return { success: false, reservedAmount: 0, newBalance: 0, newReserved: 0, reason: "Wallet not found" };
    const available = wallet.balance - wallet.reserved;
    if (available < input.amount) return { success: false, reservedAmount: 0, newBalance: wallet.balance, newReserved: wallet.reserved, reason: "Insufficient balance" };
    const newReserved = wallet.reserved + input.amount;
    await tx.creditWallet.update({ where: { id: wallet.id }, data: { reserved: newReserved } });
    await tx.creditTransaction.create({
      data: {
        organizationId: input.organizationId, walletId: wallet.id, userId: input.userId,
        brandProjectId: input.brandProjectId, aiJobId: input.aiJobId,
        type: "RESERVATION", operationType: input.operationType, amount: -input.amount,
        balanceBefore: wallet.balance, balanceAfter: wallet.balance,
        idempotencyKey: input.idempotencyKey, reason: input.reason ?? "Reservation", adminId: input.adminId,
      },
    });
    return { success: true, reservedAmount: input.amount, newBalance: wallet.balance, newReserved };
  });
}

export async function captureCredits(input: WalletOperationInput & { reservedAmount: number; actualAmount: number }) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.creditTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return;
    const wallet = await tx.creditWallet.findUniqueOrThrow({ where: { organizationId: input.organizationId } });
    const refund = input.reservedAmount - input.actualAmount;
    const newBalance = wallet.balance - input.actualAmount;
    const newReserved = wallet.reserved - input.reservedAmount;
    await tx.creditWallet.update({ where: { id: wallet.id }, data: { balance: newBalance, reserved: newReserved, totalSpent: { increment: input.actualAmount } } });
    await tx.creditTransaction.create({
      data: {
        organizationId: input.organizationId, walletId: wallet.id, userId: input.userId,
        brandProjectId: input.brandProjectId, aiJobId: input.aiJobId,
        type: "CAPTURE", operationType: input.operationType, amount: -input.actualAmount,
        balanceBefore: wallet.balance, balanceAfter: newBalance,
        idempotencyKey: input.idempotencyKey, reason: `Captured ${input.actualAmount}`, adminId: input.adminId,
      },
    });
    if (refund > 0) {
      await tx.creditTransaction.create({
        data: {
          organizationId: input.organizationId, walletId: wallet.id, userId: input.userId,
          brandProjectId: input.brandProjectId, aiJobId: input.aiJobId,
          type: "REFUND", operationType: input.operationType, amount: refund,
          balanceBefore: newBalance, balanceAfter: newBalance,
          idempotencyKey: `${input.idempotencyKey}:refund`, reason: `Refunded ${refund}`, adminId: input.adminId,
        },
      });
    }
  });
}

export async function refundCredits(input: WalletOperationInput & { reservedAmount: number }) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.creditTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return;
    const wallet = await tx.creditWallet.findUniqueOrThrow({ where: { organizationId: input.organizationId } });
    const newReserved = Math.max(0, wallet.reserved - input.reservedAmount);
    await tx.creditWallet.update({ where: { id: wallet.id }, data: { reserved: newReserved } });
    await tx.creditTransaction.create({
      data: {
        organizationId: input.organizationId, walletId: wallet.id, userId: input.userId,
        brandProjectId: input.brandProjectId, aiJobId: input.aiJobId,
        type: "REFUND", operationType: input.operationType, amount: input.reservedAmount,
        balanceBefore: wallet.balance, balanceAfter: wallet.balance,
        idempotencyKey: input.idempotencyKey, reason: input.reason ?? "Refund on failure", adminId: input.adminId,
      },
    });
  });
}

export async function grantCredits(input: WalletOperationInput & { amount: number; type?: CreditTransactionType }) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.creditTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return;
    const wallet = await tx.creditWallet.upsert({
      where: { organizationId: input.organizationId },
      update: { balance: { increment: input.amount }, totalGranted: { increment: input.amount } },
      create: { organizationId: input.organizationId, balance: input.amount, totalGranted: input.amount },
    });
    await tx.creditTransaction.create({
      data: {
        organizationId: input.organizationId, walletId: wallet.id, userId: input.userId,
        brandProjectId: input.brandProjectId, aiJobId: input.aiJobId,
        type: input.type ?? "BONUS", operationType: input.operationType, amount: input.amount,
        balanceBefore: wallet.balance - input.amount, balanceAfter: wallet.balance,
        idempotencyKey: input.idempotencyKey, reason: input.reason ?? "Credit grant", adminId: input.adminId,
      },
    });
  });
}
