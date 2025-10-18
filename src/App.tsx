import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Index from "./pages/Index";
import KahveFali from "./pages/fortune/KahveFali";
import FotoYukle from "./pages/fortune/FotoYukle";
import ComingSoon from "./components/ComingSoon";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFortunes from "./pages/admin/AdminFortunes";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Fortune Routes */}
          <Route 
            path="/fortune" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Index />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fortune/kahve" 
            element={
              <ProtectedRoute>
                <Layout>
                  <KahveFali />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fortune/kahve/upload/:tellerId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <FotoYukle />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fortune/tarot" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ComingSoon type="Tarot Falı" emoji="🎴" />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fortune/el" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ComingSoon type="El Falı" emoji="🤚" />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fortune/katina" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ComingSoon type="Katina Falı" emoji="🕯️" />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fortune/yuz" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ComingSoon type="Yüz Falı" emoji="👤" />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fortune/melek" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ComingSoon type="Melek Kartları" emoji="😇" />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Profile */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes with Sidebar Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="fortunes" element={<AdminFortunes />} />
            <Route path="statistics" element={<AdminStatistics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
