import { NextResponse } from "next/server";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "SMS-подтверждение временно отключено"
    },
    { status: 410 }
  );
}
