import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resendVerificationCodeAction, verifyPhoneAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { Button } from "@/components/ui/button";
import { requirePageSessionUser } from "@/server/auth/session";

type VerifyPhonePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function VerifyPhonePage({ searchParams }: VerifyPhonePageProps) {
  const user = await requirePageSessionUser();

  if (user.phoneVerified) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const cookieStore = await cookies();
  const developmentCode =
    process.env.NODE_ENV === "development"
      ? cookieStore.get("hunasuna_dev_sms_code")?.value
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
      <section className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Подтверждение номера</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          Введите код, отправленный на номер {user.phone}.
        </p>

        <Notice error={params.error} />

        {developmentCode ? (
          <div className="mb-5 rounded-md border border-[#b6dfcb] bg-[#eefaf4] px-4 py-3 text-sm text-[#1f6b45]">
            Код для локальной разработки: <strong>{developmentCode}</strong>
          </div>
        ) : null}

        <form action={verifyPhoneAction} className="grid gap-4">
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            name="code"
            placeholder="SMS-код"
            required
          />
          <Button>Подтвердить</Button>
        </form>

        <form action={resendVerificationCodeAction} className="mt-4">
          <button className="text-sm font-medium text-[#256f6c]">
            Отправить код еще раз
          </button>
        </form>
      </section>
    </main>
  );
}
