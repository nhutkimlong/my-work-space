import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import Tasks from "@/pages/Tasks";
import Events from "@/pages/Events";
import DocumentDetail from "@/pages/DocumentDetail";
import TaskDetail from "@/pages/TaskDetail";
import EventDetail from "@/pages/EventDetail";
import NotFound from "@/pages/NotFound";
import SQLEditorPage from "@/pages/SQLEditorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="government-assistant-theme">
      <TooltipProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="documents/:id" element={<DocumentDetail />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="tasks/:id" element={<TaskDetail />} />
                  <Route path="events" element={<Events />} />
                  <Route path="events/:id" element={<EventDetail />} />
                  <Route path="sql-editor" element={<SQLEditorPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
