import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { apiError, requireApiUser } from "@/server/auth/api";
import { createContact, listContacts } from "@/server/services/contact.service";

export async function GET() {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  const contacts = await listContacts(user.id);
  return NextResponse.json({ ok: true, contacts });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const body = await request.json();
    const meta = await getRequestMeta();
    const contact = await createContact(user.id, body, meta);

    return NextResponse.json({ ok: true, contact }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

