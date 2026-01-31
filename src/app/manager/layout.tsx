"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ClipboardList, History, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  workerId: string;
  workerName: string;
  role: string;
}

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session and role on mount
  useEffect(() => {
    const stored = localStorage.getItem("rome_session");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      
      // Check if user is a manager
      if (parsed.role !== "manager" && parsed.role !== "supervisor") {
        // Not a manager, redirect to regular dashboard
        router.push("/dashboard");
        return;
      }
      
      if (parsed.expiresAt < Date.now()) {
        localStorage.removeItem("rome_session");
        router.push("/login");
        return;
      }
      
      setSession({
        workerId: parsed.workerId,
        workerName: parsed.workerName,
        role: parsed.role,
      });
    } catch {
      localStorage.removeItem("rome_session");
      router.push("/login");
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("rome_session");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-warehouse-black flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-warehouse-gray-600 border-t-warehouse-orange rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: "/manager", icon: ClipboardList, label: "Pending" },
    { href: "/manager/history", icon: History, label: "History" },
  ];

  return (
    <div className="min-h-dvh bg-warehouse-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-warehouse-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-warehouse-orange flex items-center justify-center">
            <span className="text-warehouse-black font-bold text-sm">R</span>
          </div>
          <div>
            <span className="text-lg font-bold text-warehouse-white">ROME</span>
            <span className="ml-2 text-xs bg-warehouse-orange/20 text-warehouse-orange px-2 py-0.5 rounded">
              Manager
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-warehouse-gray-400">
            {session?.workerName}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 text-warehouse-gray-400 hover:text-warehouse-white transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-warehouse-gray-900 border-t border-warehouse-gray-800 safe-area-inset">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-warehouse-orange"
                    : "text-warehouse-gray-500 hover:text-warehouse-gray-300"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
