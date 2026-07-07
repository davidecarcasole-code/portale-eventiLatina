export async function GET() {
  let result: any = {};
  try {
    const { prisma } = await import("@/lib/prisma");
    result.importOk = true;
    const count = await prisma.event.count();
    result.count = count;
    const events = await prisma.event.findMany({ take: 1 });
    result.findManyOk = true;
    result.event = events[0] ? "found" : "empty";
  } catch (err: any) {
    result.error = err.message;
    result.code = err.code;
  }
  return Response.json(result);
}
