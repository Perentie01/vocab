import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, BookOpenCheck, Repeat2, UserRound, Moon, Sun } from "lucide-react";
import voxLogo from "@/assets/logo";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Vocabulary", href: "/vocabulary", icon: BookOpenCheck },
  { label: "Review", href: "/review", icon: Repeat2 },
  { label: "Profile", href: "/profile", icon: UserRound },
] as const;

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AppLayout({ title, subtitle, description, actions, children }: AppLayoutProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf5ef] via-white to-[#f2ede5] text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(204,182,166,0.3)_1px,transparent_0)] [background-size:22px_22px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-32 pt-8 sm:px-6">
          <header className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={voxLogo} alt="Vox" className="h-12 w-12" />
                <div>
                  {subtitle && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/70 dark:text-amber-200/70">{subtitle}</p>}
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
                  {description && <p className="text-sm text-slate-500 dark:text-slate-300">{description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {actions}
                <button
                  onClick={toggleTheme}
                  className="rounded-2xl border border-slate-200/70 bg-white/80 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-yellow-300" />}
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 py-6">
            <div className="space-y-6">{children}</div>
          </main>
        </div>

        <nav className="fixed bottom-4 left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-4">
          <div className="rounded-[2.2rem] border border-white/80 bg-white/90 p-2 shadow-2xl shadow-amber-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
            <div className="grid grid-cols-4 gap-1">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const normalizedLocation = location?.endsWith("/") && location.length > 1 ? location.slice(0, -1) : location;
                const normalizedHref = href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
                const isReviewNav = normalizedHref === "/review";
                const isActive = isReviewNav
                  ? normalizedLocation === "/review" || normalizedLocation?.startsWith("/spaced-repetition")
                  : normalizedLocation === normalizedHref || (normalizedHref !== "/" && normalizedLocation?.startsWith(normalizedHref));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition",
                      isActive
                        ? "bg-[oklch(0.95_0.03_25)] text-[oklch(0.48_0.19_25)] shadow-md dark:bg-white/10 dark:text-white"
                        : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
