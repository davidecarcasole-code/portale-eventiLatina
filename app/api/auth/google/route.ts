import { NextRequest } from "next/server";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  let jsonResponse: any, errorResponse: any;
  try {
    const { prisma } = await import("@/lib/prisma");
    const { generateToken } = await import("@/lib/auth");
    const helpers = await import("@/lib/api-helpers");
    jsonResponse = helpers.jsonResponse;
    errorResponse = helpers.errorResponse;
    const { credential } = await req.json();
    if (!credential) return errorResponse("Token Google richiesto");
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return errorResponse("Token Google non valido", 401);
    let user = await prisma.user.findFirst({ where: { OR: [{ email: payload.email }, { googleId: payload.sub }] } });
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { googleId: user.googleId || payload.sub, avatar: user.avatar || payload.picture } });
    } else {
      user = await prisma.user.create({
        data: { email: payload.email, name: payload.name || payload.email!.split("@")[0], googleId: payload.sub, avatar: payload.picture },
      });
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return jsonResponse({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, theme: user.theme, accent_color: user.accentColor }, token });
  } catch { return errorResponse ? errorResponse("Errore login Google", 500) : Response.json({ error: "Errore login Google" }, { status: 500 }); }
}
