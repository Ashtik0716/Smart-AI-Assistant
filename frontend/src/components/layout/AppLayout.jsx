import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import Sidebar, { MobileNav } from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <MobileNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}