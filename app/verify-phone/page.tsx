import { redirect } from "next/navigation";
import { requirePageSessionUser } from "@/server/auth/session";

export default async function VerifyPhonePage() {
  await requirePageSessionUser();
  redirect("/dashboard");
}
