import { cookies } from "next/headers";
import {
  deleteAccountAction,
  revealSensitiveSettingsAction,
  updateEmailAction,
  updatePasswordAction,
  updateSettingsAction
} from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { PageShell } from "@/components/layout/page-shell";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { THEME_COOKIE, themeFromCookie } from "@/lib/theme";
import { requirePageUser } from "@/server/auth/session";
import { getUserProfile } from "@/server/services/user.service";

type SettingsPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const currentUser = await requirePageUser();
  const params = await searchParams;
  const cookieStore = await cookies();
  const theme = themeFromCookie(cookieStore.get(THEME_COOKIE)?.value);
  const user = await getUserProfile(currentUser.id);

  if (!user) {
    return null;
  }

  return (
    <PageShell title="Настройки">
      <Notice error={params.error} />
      <SettingsPanel
        deleteAccountAction={deleteAccountAction}
        hasEmail={Boolean(user.email)}
        initialTheme={theme}
        revealSensitiveDataAction={revealSensitiveSettingsAction}
        updateEmailAction={updateEmailAction}
        updatePasswordAction={updatePasswordAction}
        updateProfileAction={updateSettingsAction}
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          secretQuestion: user.secretQuestion
        }}
      />
    </PageShell>
  );
}
