import { logoutAction } from "@/app/actions";
import { AppNavigation } from "@/components/layout/app-navigation";

type PageShellProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#1f2937] lg:flex">
      <AppNavigation logoutAction={logoutAction} />

      <section className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-3xl text-base leading-7 text-[#64748b]">
                {description}
              </p>
            ) : null}
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
