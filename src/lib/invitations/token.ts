import { SignJWT, jwtVerify } from "jose";

const secret = () => {
  const key = process.env.AUTH_SECRET;
  if (!key) throw new Error("AUTH_SECRET is required to sign invitations");
  return new TextEncoder().encode(key);
};

export interface InvitePayload {
  email: string;
  orgId: string;
  role: "ADMIN" | "MEMBER";
}

export async function createInviteToken(payload: InvitePayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyInviteToken(token: string): Promise<InvitePayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    const { email, orgId, role } = payload as unknown as InvitePayload;
    if (!email || !orgId || (role !== "ADMIN" && role !== "MEMBER")) return null;
    return { email, orgId, role };
  } catch {
    return null;
  }
}
