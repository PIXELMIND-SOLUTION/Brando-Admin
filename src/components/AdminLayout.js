import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]">
      {/* Sidebar — fixed, never scrolls */}
      <Sidebar />

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar — pinned top */}
        <div className="flex-shrink-0">
          <Navbar />
        </div>

        {/* Outlet — only this scrolls */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;