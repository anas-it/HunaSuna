import { NextResponse, type NextRequest } from "next/server";
import { archiveExpiredDeletedRecordsJob } from "@/server/jobs/archive-expired-deleted-records.job";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const deleted = await archiveExpiredDeletedRecordsJob();

  return NextResponse.json({
    ok: true,
    deleted
  });
}
