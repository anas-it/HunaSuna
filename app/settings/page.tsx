import { updateSettingsAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { requirePageUser } from "@/server/auth/session";
import { getUserProfile } from "@/server/services/user.service";

type SettingsPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const currentUser = await requirePageUser();
  const params = await searchParams;
  const user = await getUserProfile(currentUser.id);

  if (!user) {
    return null;
  }

  return (
    <PageShell
      title="Настройки"
      description="Здесь можно изменить личные данные, email, мобильный номер и пароль."
    >
      <Notice error={params.error} />

      <form action={updateSettingsAction} className="grid max-w-2xl gap-4 rounded-lg border border-[#d8dee8] bg-white p-6">
        <label className="grid gap-2 text-sm font-medium">
          Логин
          <input
            className="rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2"
            defaultValue={user.login}
            disabled
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Имя
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={user.firstName ?? ""}
            name="firstName"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Фамилия
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={user.lastName ?? ""}
            name="lastName"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={user.email ?? ""}
            name="email"
            type="email"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Мобильный номер
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={user.phone}
            name="phone"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Новый пароль
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            minLength={4}
            name="newPassword"
            placeholder="Оставьте пустым, если не меняете"
            type="password"
          />
        </label>

        <div className="text-sm text-[#64748b]">
          Номер подтвержден: {user.phoneVerified ? "да" : "нет"}
        </div>

        <Button>Сохранить изменения</Button>
      </form>
    </PageShell>
  );
}

