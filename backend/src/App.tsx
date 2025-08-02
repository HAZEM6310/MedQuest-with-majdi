import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/hooks/useLanguage";
import { LoadingProvider } from "@/contexts/loading-context";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/Sidebar";
import Index from "./pages/Index";
import YearSubjects from "./pages/YearSubjects";
import SubjectCourses from "./pages/SubjectCourses";
import CourseDetail from "./pages/CourseDetail";
import Quiz from "./pages/Quiz";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Courses from "./pages/Courses";
import Progress from "./pages/Progress";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import EnterEmail from "./pages/EnterEmail";
import ResetPassword from "./pages/ResetPassword";
import FacultyPage from '@/pages/Faculty';

const queryClient = new QueryClient();

function QuizProtectedRoute() {
  const { courseId } = useParams();
  return (
    <ProtectedRoute courseId={courseId}>
      <Quiz />
    </ProtectedRoute>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Get sidebar collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsSidebarCollapsed(savedState === 'true');
    }
  }, []);

  // Listen for storage events to update state when sidebar is toggled
  useEffect(() => {
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState) {
        setIsSidebarCollapsed(savedState === 'true');
      }
    };

    // Create a custom event for local updates (within same window)
    window.addEventListener('sidebarStateChange', handleStorageChange as EventListener);
    // Standard storage event for cross-window updates
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('sidebarStateChange', handleStorageChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Hide Navbar/Sidebar on these routes
  const hideNav = [
    "/auth",
    "/register",
    "/enter-email",
    "/reset-password",
  ].some((path) => location.pathname.startsWith(path));
  
  // No extra padding for home and courses
  const noPad = ["/", "/courses"].includes(location.pathname);
  
  return (
    <div className={hideNav 
      ? "min-h-screen bg-background flex items-center justify-center" 
      : `min-h-screen bg-background transition-all duration-300 ${isSidebarCollapsed ? "md:pl-20" : "md:pl-60"}`
    }>
      {!hideNav && <Sidebar />}
      {!hideNav && <Navbar isSidebarCollapsed={isSidebarCollapsed} />}
      <main className={
        hideNav
          ? ""
          : `pt-14 ${noPad ? "" : "px-4 md:px-8"}`
      }>
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <BrowserRouter>
                <LoadingProvider>
                  <MainRouter />
                  <Toaster />
                </LoadingProvider>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function MainRouter() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/enter-email" element={<EnterEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/faculties" element={<FacultyPage />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute requireSubscription={false}>
              <Subscription />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/year/:yearId/subjects" 
          element={<YearSubjects />} 
        />
        <Route 
          path="/subjects/:subjectId" 
          element={<SubjectCourses />} 
        />
        <Route 
          path="/courses/:courseId" 
          element={<CourseDetail />} 
        />
        <Route 
          path="/courses/:courseId/quiz" 
          element={<QuizProtectedRoute />} 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requireSubscription={false}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireSubscription={false}>
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

export default App;