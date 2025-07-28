
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'purple' | 'blue' | 'caramel' | 'pinky' | 'lollipop' | 'aesthetic' | 'noir';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeConfig = {
  purple: {
    primary: '250 45% 60%',
    secondary: '250 30% 45%',
    accent: '250 46% 96%',
    sidebar: '250 46% 97%',
    sidebarAccent: '250 46% 94%',
  },
  blue: {
    primary: '200 45% 70%',
    secondary: '200 30% 55%',
    accent: '200 45% 95%',
    sidebar: '200 46% 97%',
    sidebarAccent: '200 46% 94%',
  },
  caramel: {
    primary: '30 45% 50%',
    secondary: '30 30% 35%',
    accent: '30 45% 95%',
    sidebar: '30 46% 97%',
    sidebarAccent: '30 46% 94%',
  },
  pinky: {
    primary: '340 45% 70%',
    secondary: '340 30% 55%',
    accent: '340 20% 94%',
    sidebar: '340 20% 97%',
    sidebarAccent: '340 20% 91%',
  },
  lollipop: {
    primary: '174 50% 50%',
    secondary: '174 35% 35%',
    accent: '174 50% 96%',
    sidebar: '174 50% 97%',
    sidebarAccent: '174 50% 94%',
  },
  aesthetic: {
    primary: '220 70% 60%',
    secondary: '250 90% 70%',
    accent: '230 40% 95%',
    sidebar: '230 40% 97%',
    sidebarAccent: '230 40% 91%',
  },
  noir: {
    primary: '196 34% 24%', // #2B4951 (Teal blue)
    secondary: '205 14% 48%', // #677E8A (Slate blue)
    accent: '220 6% 69%', // #ABAFB5 (Muted gray)
    sidebar: '188 48% 14%', // #122E34 (Teal-black)
    sidebarAccent: '196 40% 8%', // #0E1D21 (Charcoal black)
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('purple');

  useEffect(() => {
    const savedTheme = localStorage.getItem('medquest-theme') as Theme;
    if (savedTheme && themeConfig[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('medquest-theme', theme);
    
    const root = document.documentElement;
    const colors = themeConfig[theme];
    
    if (colors) {
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--secondary', colors.secondary);
      root.style.setProperty('--accent', colors.accent);
      root.style.setProperty('--sidebar-background', colors.sidebar);
      root.style.setProperty('--sidebar-accent', colors.sidebarAccent);
      root.style.setProperty('--sidebar-primary', colors.primary);
    }

    // Apply aesthetic theme styles
    if (theme === 'aesthetic') {
      root.style.setProperty('--aesthetic-bg', 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)');
      root.style.setProperty('--aesthetic-card', 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)');
      root.style.setProperty('--aesthetic-sidebar', 'linear-gradient(180deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)');
      root.setAttribute('data-theme', 'aesthetic');
    } else {
      root.style.removeProperty('--aesthetic-bg');
      root.style.removeProperty('--aesthetic-card');
      root.style.removeProperty('--aesthetic-sidebar');
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
