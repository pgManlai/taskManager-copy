import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Team from "@/pages/team";
import Inbox from "@/pages/inbox";
import Trash from "@/pages/trash";
import Profile from "@/pages/profile";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { NotificationPanel } from "@/components/layout/notification-panel";


function MainLayout({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-16 md:ml-60">
        <Header />
        <div className="flex flex-1">
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 custom-scrollbar">
            {children}
          </main>
          {isDesktop && <NotificationPanel />}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/team" component={Team} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/trash" component={Trash} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MainLayout>
          <Router />
        </MainLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
