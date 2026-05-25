import { NextResponse } from "next/server";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Используйте /api/auth для регистрации, входа, выхода и восстановления пароля."
  });
}

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "Используйте /api/auth с полем action."
  });
}
