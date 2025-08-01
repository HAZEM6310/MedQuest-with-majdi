import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  User, 
  Settings, 
  GraduationCap,
  Trophy,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  Building2 // Added Building2 icon for Faculties
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.courses'), href: '/courses', icon: BookOpen },
    { name: t('nav.faculties'), href: '/faculties', icon: Building2 }, // Added Faculties navigation
    { name: t('nav.progress'), href: '/progress', icon: BarChart3 },
    { name: t('nav.achievements'), href: '/achievements', icon: Trophy },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 bg-background/80 backdrop-blur-lg border-border/20 shadow-xl hover:bg-background/90 transition-all duration-300 md:hidden"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-56 bg-background/95 backdrop-blur-xl border-r border-border/20 shadow-2xl z-50 transition-all duration-300 ease-out",
        isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
        "md:translate-x-0 md:opacity-100 md:block"
      )}>
        
        {/* Header */}
        <div className="p-6 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Med<span className="text-primary">Quest</span>
              </h1>
              <p className="text-sm text-muted-foreground">Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link key={item.name} to={item.href} onClick={() => setIsOpen(false)}>
                  <div className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "hover:bg-accent/50 hover:scale-[1.02] hover:shadow-sm",
                    active && "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  )}>
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      active ? "bg-primary/20" : "bg-accent/30 group-hover:bg-accent/50"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                    </div>
                    
                    {active && (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Separator */}
          <div className="my-6 border-t border-border/20" />

          {/* User Section */}
          <div className="space-y-2">
            <Link to="/profile" onClick={() => setIsOpen(false)}>
              <div className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "hover:bg-accent/50 hover:scale-[1.02] hover:shadow-sm",
                isActive('/profile') && "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              )}>
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  isActive('/profile') ? "bg-primary/20" : "bg-accent/30 group-hover:bg-accent/50"
                )}>
                  <User className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <span className="font-medium">{t('nav.profile')}</span>
                </div>
                
                {isActive('/profile') && (
                  <ChevronRight className="h-4 w-4 text-primary" />
                )}
              </div>
            </Link>

            {profile?.is_admin && (
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <div className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  "hover:bg-accent/50 hover:scale-[1.02] hover:shadow-sm",
                  isActive('/admin') && "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                )}>
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive('/admin') ? "bg-primary/20" : "bg-accent/30 group-hover:bg-accent/50"
                  )}>
                    <Settings className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <span className="font-medium">{t('nav.admin')}</span>
                  </div>
                  
                  {isActive('/admin') && (
                    <ChevronRight className="h-4 w-4 text-primary" />
                  )}
                </div>
              </Link>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border/20">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 MedQuest</p>
            <p>Learn • Practice • Excel</p>
          </div>
        </div>
      </div>
    </>
  );
}