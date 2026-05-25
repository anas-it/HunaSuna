import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "SMS-подтверждение временно отключено"
    },
    { status: 410 }
  );
}
