import { NextResponse } from "next/server";
import { requireApiUser } from "@/server/auth/api";
import { listDeletedRecords } from "@/server/services/deleted-record.service";

export async function GET() {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  const records = await listDeletedRecords(user.id);
  return NextResponse.json({ ok: true, records });
}

