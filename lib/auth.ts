import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  publisherStatus: string | null;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getAuthUser(token: string): Promise<AuthUser | null> {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name || "", role: user.role, avatar: user.avatar, publisherStatus: user.publisherStatus };
}

export function extractToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL || "admin@eventinlatina.it";
  const password = process.env.SUPER_ADMIN_PASSWORD || "Admin123!";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "super_admin", passwordHash: await hashPassword(password) },
    });
  } else {
    await prisma.user.create({
      data: { email, name: "Admin", role: "super_admin", passwordHash: await hashPassword(password) },
    });
  }
}
