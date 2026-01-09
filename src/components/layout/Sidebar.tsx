import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  FolderOpen, 
  Upload, 
  FileSearch, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  Blocks
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/' },
  { icon: FolderOpen, label: 'Cases', path: '/cases' },
  { icon: Upload, label: 'Upload', path: '/upload' },
  { icon: FileSearch, label: 'Analysis', path: '/analysis' },
  { icon: Fingerprint, label: 'Reports', path: '/reports' },
  { icon: Blocks, label: 'Blockchain', path: '/blockchain' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary" />
            <div className="absolute inset-0 animate-pulse-ring">
              <Shield className="h-8 w-8 text-primary/30" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-foreground tracking-tight">TrustCheck</span>
              <span className="text-[10px] text-primary font-mono tracking-widest">AI FORENSICS</span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Status Indicator */}
      {!collapsed && (
        <div className="absolute bottom-4 left-3 right-3">
          <div className="rounded-lg bg-sidebar-accent p-3 border border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-trust animate-pulse" />
              <span className="text-xs text-muted-foreground">System Online</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground font-mono">
              v1.0.0 • Blockchain Synced
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
