
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

const AppLayout = () => {
  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <AppHeader />
        <div className="flex-1 p-6 bg-muted/50">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default AppLayout;
