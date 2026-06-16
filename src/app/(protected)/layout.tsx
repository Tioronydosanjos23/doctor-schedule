import { DemoUserHandler } from "@/components/demo-user-handler";
import { TrialExpiredBanner } from "@/components/trial-expired-banner";
import { TrialNotification } from "@/components/trial-notification";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getSession } from "@/lib/get-session";

import { AppSidebar } from "./_components/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <SidebarProvider>
      <DemoUserHandler />
      <AppSidebar />
      <main className="w-full">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-primary focus:text-primary-foreground"
        >
          Saltar para o conteúdo principal
        </a>
        <SidebarTrigger />
        {session?.user && (
          <>
            <TrialExpiredBanner
              isDemoUser={session.user.isDemoUser}
              demoTrialEndsAt={session.user.demoTrialEndsAt || null}
              plan={session.user.plan || null}
            />
            <TrialNotification
              isDemoUser={session.user.isDemoUser}
              demoTrialEndsAt={session.user.demoTrialEndsAt || null}
              plan={session.user.plan || null}
            />
          </>
        )}
        <div id="main-content">{children}</div>
      </main>
    </SidebarProvider>
  );
}
