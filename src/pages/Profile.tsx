import AppLayout from "@/components/AppLayout";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CalendarDays, Flame, Download, Sparkles } from "lucide-react";

export default function Profile() {
  const { entries } = useVocabulary();
  const { theme, toggleTheme } = useTheme();

  const totalWords = entries.length;
  const streak = Math.min(60, Math.max(1, Math.floor(totalWords / 3) || 1));
  const learningGoal = Math.max(5, Math.min(30, Math.round(totalWords * 0.1)) || 10);

  const badges = [
    { label: "Consistency", description: "Daily practice", achieved: streak >= 7 },
    { label: "Explorer", description: "50+ words added", achieved: totalWords >= 50 },
    { label: "Archivist", description: "Bulk upload used", achieved: totalWords >= 100 },
  ];

  return (
    <AppLayout
      title="Profile"
      subtitle="学习者档案"
      description="Personalize your Vox experience"
    >
      <section className="rounded-[2rem] border border-white/80 bg-white/95 p-6 text-slate-900 shadow dark:border-white/10 dark:bg-slate-900/70 dark:text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[oklch(0.58_0.18_25)] to-[oklch(0.53_0.18_35)] text-center text-2xl font-semibold text-white">
            <div className="flex h-full items-center justify-center">VX</div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600/80">Learner</p>
            <h2 className="text-2xl font-semibold">Vox Explorer</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">{totalWords} words saved</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-700/70 dark:text-amber-200/80">Streak</p>
            <p className="text-2xl font-semibold">{streak}d</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-700/70 dark:text-amber-200/80">Goal</p>
            <p className="text-2xl font-semibold">{learningGoal}/day</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-700/70 dark:text-amber-200/80">Words</p>
            <p className="text-2xl font-semibold">{totalWords}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 text-[oklch(0.55_0.2_25)]" />
          <div>
            <p className="text-sm font-semibold">Daily reminders</p>
            <p className="text-xs text-slate-500 dark:text-slate-300">Stay on track with gentle nudges.</p>
          </div>
          <Switch className="ml-auto" checked disabled />
        </div>
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-[oklch(0.55_0.2_25)]" />
          <div>
            <p className="text-sm font-semibold">Dark mode</p>
            <p className="text-xs text-slate-500 dark:text-slate-300">Toggle the Vox night interface.</p>
          </div>
          <Switch className="ml-auto" checked={theme === "dark"} onCheckedChange={() => toggleTheme?.()} />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 p-4 text-sm dark:border-slate-700/60 dark:bg-slate-900/40">
          <p className="font-semibold">Export your data</p>
          <p className="text-slate-500 dark:text-slate-300">Download your vocabulary list as TSV for safe keeping.</p>
          <Button variant="ghost" className="w-full justify-center rounded-xl text-[oklch(0.48_0.19_25)]">
            <Download className="mr-2 h-4 w-4" /> Export words
          </Button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-600/80">
          <Sparkles className="h-4 w-4" /> Achievements
        </div>
        <div className="space-y-3">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-sm shadow dark:border-white/10 dark:bg-slate-900/70"
            >
              <div>
                <p className="font-semibold">{badge.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{badge.description}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  badge.achieved
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {badge.achieved ? "Unlocked" : "In progress"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
