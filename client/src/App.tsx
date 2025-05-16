import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "@/pages/login"; // Login хуудсыг оруулж ирнэ
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

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

// MainLayout өөрчлөлтгүй, хүсвэл хуучин кодыг ашиглаж болно

function MainLayout({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div className="bg-gray-50 flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 ">
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

// **Нэвтрэлтийн шалгалттай PrivateRoute**

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const user = useSelector((state: RootState) => state.auth.user);
  return user ? children : <Navigate to="/login" replace />;
}

function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* Эндээс доошхи бүх маршрут нь Private буюу нэвтэрсэн хэрэглэгчдэд зориулагдсан */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <MainLayout>
              <Tasks />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/team"
        element={
          <PrivateRoute>
            <MainLayout>
              <Team />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <PrivateRoute>
            <MainLayout>
              <Inbox />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/trash"
        element={
          <PrivateRoute>
            <MainLayout>
              <Trash />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Олдсонгүй хуудас */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
