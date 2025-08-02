import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  User, 
  Settings, 
  GraduationCap,
  Trophy,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Store collapse state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setCollapsed(savedState === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
    
    // Dispatch custom event to notify App.tsx
    window.dispatchEvent(new Event('sidebarStateChange'));
  };

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.courses'), href: '/courses', icon: BookOpen },
    { name: t('nav.faculties'), href: '/faculties', icon: Building2 },
    { name: t('nav.progress'), href: '/progress', icon: BarChart3 },
    { name: t('nav.achievements'), href: '/achievements', icon: Trophy },
  ];

  const accountItems = [
    { name: t('nav.profile'), href: '/profile', icon: User },
    ...(profile?.is_admin ? [{ name: t('nav.admin'), href: '/admin', icon: Settings }] : []),
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 h-full bg-background/95 backdrop-blur-xl border-r border-border/20 shadow-lg z-40",
        "flex flex-col", // Use flexbox for better control
        "transition-[width] duration-300 ease-in-out", // Only transition the width
        collapsed ? "w-20" : "w-60"
      )}
    >
      {/* Collapse toggle button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-20 bg-background border border-border/20 rounded-full p-1.5 shadow-md hover:bg-accent/50 transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Logo - fixed height */}
      <div className={cn(
        "border-b border-border/20 h-16 shrink-0", // Fixed height
        "flex items-center",
        collapsed ? "justify-center" : "px-6"
      )}>
        <div className="bg-primary/10 rounded-full p-2">
          <GraduationCap className={cn(
            "text-primary transition-all",
            collapsed ? "h-6 w-6" : "h-7 w-7"
          )} />
        </div>
        
        {!collapsed && (
          <div className="ml-3 overflow-hidden whitespace-nowrap">
            <h1 className="text-xl font-bold">
              Med<span className="text-primary">Quest</span>
            </h1>
            <p className="text-xs text-muted-foreground">Learning Platform</p>
          </div>
        )}
      </div>

      {/* Navigation section - flex-grow to take available space */}
      <div className="flex-grow overflow-y-auto py-4">
        {/* Main Navigation */}
        <nav className={cn(
          "space-y-1 mb-6",
          collapsed ? "px-3" : "px-4"
        )}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return collapsed ? (
              <TooltipProvider key={item.name}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link 
                      to={item.href}
                      className={cn(
                        "h-10 w-10 mb-1 rounded-lg flex items-center justify-center", // Fixed height
                        "transition-colors duration-200",
                        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Link 
                key={item.name} 
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 h-10 rounded-lg", // Fixed height
                  "transition-colors duration-200",
                  "hover:bg-accent/50",
                  active && "bg-primary/10 text-primary"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-6 w-6", // Fixed icon size
                  active ? "text-primary" : ""
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <span className="text-sm font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.name}
                </span>
                
                {active && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Account Section */}
        <div className={cn(
          "space-y-1",
          collapsed ? "px-3" : "px-4"
        )}>
          {/* Label */}
          {!collapsed && (
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('nav.account')}
              </p>
            </div>
          )}
          
          {/* Account navigation items */}
          {accountItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return collapsed ? (
              <TooltipProvider key={item.name}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link 
                      to={item.href}
                      className={cn(
                        "h-10 w-10 mb-1 rounded-lg flex items-center justify-center", // Fixed height
                        "transition-colors duration-200",
                        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Link 
                key={item.name} 
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 h-10 rounded-lg", // Fixed height
                  "transition-colors duration-200",
                  "hover:bg-accent/50",
                  active && "bg-primary/10 text-primary"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-6 w-6", // Fixed icon size
                  active ? "text-primary" : ""
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <span className="text-sm font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.name}
                </span>
                
                {active && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer - fixed height */}
      <div className={cn(
        "border-t border-border/20 h-16 shrink-0", // Fixed height
        "flex items-center justify-center",
        "text-xs text-muted-foreground",
        collapsed ? "px-2" : "px-4"
      )}>
        {collapsed ? (
          <GraduationCap className="h-5 w-5 text-primary/60" />
        ) : (
          <div className="text-center">
            <p>© 2025 MedQuest</p>
            <p>Learn • Practice • Excel</p>
          </div>
        )}
      </div>
    </div>
  );
}