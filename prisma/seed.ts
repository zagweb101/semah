import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import brandStrategyFixture from "../src/lib/ai/providers/mock/fixtures/brand-strategy.json";
import { getPlan } from "../src/lib/plans";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function interpolateProjectName<T>(value: T, projectName: string): T {
  if (typeof value === "string") {
    return value.replace(/\{\{projectName\}\}/g, projectName) as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => interpolateProjectName(v, projectName)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, interpolateProjectName(v, projectName)]),
    ) as T;
  }
  return value;
}

async function main() {
  const email = "admin@example.com";
  const password = "password123";
  const projectNameAr = "علامة تجريبية";
  const projectNameEn = "Demo Brand";

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const hashed = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: { name: "مدير المنصة", email, password: hashed },
    });
    console.log("✅ Created user:", email, "/", password);
  } else {
    console.log("ℹ️ User already exists:", email);
  }

  let org = await prisma.organization.findFirst({ where: { ownerId: user.id } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "فريق سِمَة",
        slug: "semah-team",
        ownerId: user.id,
        memberships: { create: { userId: user.id, role: "OWNER" } },
      },
    });
    console.log("✅ Created organization:", org.name);
  }

  const planId = "agency";
  const plan = getPlan(planId);
  const existingSub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        stripeCustomerId: `cus_seed_${user.id}`,
        stripeSubscriptionId: `sub_seed_${user.id}`,
        status: "ACTIVE",
        plan: planId,
      },
    });
    console.log("✅ Created subscription (", plan.nameAr, ")");
  }

  const existingWallet = await prisma.creditWallet.findUnique({ where: { organizationId: org.id } });
  if (!existingWallet) {
    await prisma.creditWallet.create({
      data: {
        organizationId: org.id,
        balance: plan.monthlyCredits,
        totalGranted: plan.monthlyCredits,
      },
    });
    console.log("✅ Created credit wallet with", plan.monthlyCredits, "credits");
  }

  const workspaceSettings = await prisma.workspaceSettings.findUnique({
    where: { organizationId: org.id },
  });
  if (!workspaceSettings) {
    await prisma.workspaceSettings.create({
      data: { organizationId: org.id, defaultLocale: "ar", defaultDirection: "rtl" },
    });
    console.log("✅ Created workspace settings");
  }

  let project = await prisma.brandProject.findFirst({
    where: { organizationId: org.id, nameAr: projectNameAr },
  });
  if (!project) {
    project = await prisma.brandProject.create({
      data: {
        organizationId: org.id,
        nameAr: projectNameAr,
        nameEn: projectNameEn,
        slug: "demo-brand",
        status: "STRATEGY_READY",
        createdBy: user.id,
        brief: {
          create: {
            data: {
              nameAr: projectNameAr,
              nameEn: projectNameEn,
              description: "مشروع تجريبي لاختبار منصة سِمَة وبناء هوية مؤسسية متكاملة.",
              sector: "تقنية",
              market: "السوق الخليجي",
              country: "السعودية",
              products: ["خدمة تصميم الهوية", "استشارات العلامة التجارية"],
              problem: "صعوبة بناء هوية مؤسسية متكاملة بسرعة وبجودة عالية.",
              usps: ["سرعة", "ذكاء اصطناعي", "عربي RTL"],
              audienceAgeRange: "25-45",
              audienceLocation: "السعودية والإمارات",
              audienceInterests: ["التصميم", "ريادة الأعمال", "التقنية"],
              audienceNeeds: ["هوية احترافية", "توفير الوقت", "تكلفة مناسبة"],
              personality: { modern: 4, innovative: 5, friendly: 4, simple: 3, trustworthy: 5 },
              visualPreferences: ["Modern", "Minimal"],
              preferredColors: ["بنفسجي", "كoral"],
              forbiddenColors: ["أحمر صريح"],
            },
            status: "COMPLETED",
          },
        },
        projectMembers: { create: { userId: user.id, role: "PROJECT_OWNER" } },
        activities: {
          create: [
            { type: "CREATED", userId: user.id, metadata: { nameAr: projectNameAr } },
            { type: "BRIEF_UPDATED", userId: user.id, metadata: { action: "completed" } },
          ],
        },
      },
    });
    console.log("✅ Created demo project:", project.nameAr);

    await prisma.brandStrategy.create({
      data: {
        brandProjectId: project.id,
        version: 1,
        data: interpolateProjectName(brandStrategyFixture, projectNameAr) as never,
        promptVersion: "1.0.0",
        provider: "mock",
        model: "mock-text-v1",
        isCurrent: true,
        createdBy: user.id,
      },
    });
    console.log("✅ Created demo brand strategy");
  } else {
    console.log("ℹ️ Demo project already exists:", project.nameAr);
  }

  console.log("\n🚀 Seed complete. Login with admin@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
