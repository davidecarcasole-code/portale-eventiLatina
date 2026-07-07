export async function GET() {
  let result: any = {};
  try {
    const mod = await import("@/lib/prisma");
    result.prismaImported = true;
  } catch (err: any) {
    result.prismaImportError = err.message;
  }
  try {
    const { PrismaClient } = await import("@/src/generated/prisma/client");
    result.clientImported = true;
  } catch (err: any) {
    result.clientImportError = err.message;
  }
  try {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    result.adapterImported = true;
  } catch (err: any) {
    result.adapterImportError = err.message;
  }
  try {
    const { Pool } = await import("pg");
    result.pgImported = true;
  } catch (err: any) {
    result.pgImportError = err.message;
  }
  return Response.json(result);
}
