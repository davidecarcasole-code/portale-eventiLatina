import { NextResponse } from "next/server";
import { extractToken, getAuthUser, type AuthUser } from "./auth";

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function authenticateRequest(req: Request): Promise<AuthUser | null> {
  const token = extractToken(req);
  if (!token) return null;
  return getAuthUser(token);
}

export async function requireAuth(req: Request): Promise<{ user: AuthUser }> {
  const user = await authenticateRequest(req);
  if (!user) throw new AuthError("Non autorizzato", 401);
  return { user };
}

export async function requireAdmin(req: Request): Promise<{ user: AuthUser }> {
  const { user } = await requireAuth(req);
  if (user.role !== "admin" && user.role !== "super_admin") throw new AuthError("Accesso negato", 403);
  return { user };
}

export async function requireSuperAdmin(req: Request): Promise<{ user: AuthUser }> {
  const { user } = await requireAuth(req);
  if (user.role !== "super_admin") throw new AuthError("Accesso negato", 403);
  return { user };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function handleApiError(err: unknown) {
  if (err instanceof AuthError) {
    return errorResponse(err.message, err.status);
  }
  const msg = err instanceof Error ? err.message : "Errore sconosciuto";
  console.error("API Error:", msg, err);
  return errorResponse(msg, 500);
}
