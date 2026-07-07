import { redirect } from "next/navigation";
import { redirectAuthenticatedUser } from "@/server/auth/session";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

function homeAuthPath(params: { error?: string; message?: string }) {
  const query = new URLSearchParams({ auth: "login" });

  if (params.error) {
    query.set("error", params.error);
  }

  if (params.message) {
    query.set("message", params.message);
  }

  return `/?${query.toString()}`;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectAuthenticatedUser();

  const params = await searchParams;

  redirect(homeAuthPath(params));
}
