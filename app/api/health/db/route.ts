import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const client = await clientPromise;
    const adminDb = client.db().admin();
    const pingResult = await adminDb.ping();

    return Response.json({
      ok: true,
      message: "MongoDB connection successful.",
      ping: pingResult,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database connection error.";

    return Response.json(
      {
        ok: false,
        message: "MongoDB connection failed.",
        error: message,
      },
      { status: 500 },
    );
  }
}
