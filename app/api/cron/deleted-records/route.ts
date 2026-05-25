import { NextResponse, type NextRequest } from "next/server";
import { cleanupArchivedRecordsJob } from "@/server/jobs/cleanup-archived-records.job";
import { cleanupDeletedRecordsJob } from "@/server/jobs/cleanup-deleted-records.job";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const deleted = await cleanupDeletedRecordsJob();
  const archived = await cleanupArchivedRecordsJob();

  return NextResponse.json({
    ok: true,
    deleted,
    archived
  });
}
