import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Volume2, ArrowRight, UploadCloud, BookOpenCheck, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import VocabularyForm from "@/components/VocabularyForm";
import VocabularyUpload from "@/components/VocabularyUpload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVocabulary } from "@/hooks/useVocabulary";
import { speakText } from "@/lib/tts";
import { VocabularyEntry, VocabularyEntryMutation } from "@/lib/db";

export default function Home() {
  const [, setLocation] = useLocation();
  const { entries, loading, error, add, addMany } = useVocabulary();
  const [isAdding, setIsAdding] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const wordOfTheDay = useMemo(() => {
    if (entries.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * entries.length);
    return entries[randomIndex];
  }, [entries]);

  const totalWords = entries.length;
  const dueToday = Math.min(totalWords, Math.max(8, Math.round(totalWords * 0.2)) || 8);
  const dayStreak = Math.min(30, Math.max(1, Math.floor(totalWords / 4) || 1));
  const reviewQueue = Math.min(30, Math.max(12, Math.round(totalWords * 0.35)) || 12);

  const recentEntries = entries.slice(0, 4);

  const handleAddEntry = async (
    entry: Omit<VocabularyEntry, "id" | "createdAt" | "updatedAt">
  ) => {
    setIsAdding(true);
    try {
      await add(entry);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpload = async (batch: VocabularyEntryMutation<"create">[]) => {
    if (!batch.length) return;
    await addMany(batch);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdf5ef] via-white to-[#f2ede5] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.55_0.2_25)]" />
          Loading your vocabulary
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      title="Home"
      subtitle="词汇学习"
      description="Track your progress and keep the streak alive"
    >
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Words", value: totalWords },
          { label: "Due Today", value: dueToday },
          { label: "Day Streak", value: dayStreak },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/80 bg-white/90 p-3 text-center shadow-sm dark:border-white/5 dark:bg-slate-900/70"
          >
            <p className="text-xs uppercase tracking-widest text-amber-700/80 dark:text-amber-200/80">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      {wordOfTheDay && (
        <div className="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-[oklch(0.63_0.18_25)] to-[oklch(0.58_0.17_35)] p-5 text-white shadow-xl dark:from-[oklch(0.48_0.12_25)] dark:to-[oklch(0.45_0.1_35)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/80">Word of the Day</p>
              <h2 className="text-3xl font-semibold tracking-tight">{wordOfTheDay.chinese}</h2>
              {wordOfTheDay.pinyin && <p className="text-lg text-white/80">{wordOfTheDay.pinyin}</p>}
              <p className="text-sm text-white/80">{wordOfTheDay.english}</p>
            </div>
            <button
              onClick={() => speakText(wordOfTheDay.chinese)}
              className="rounded-full bg-white/20 p-3 text-white transition hover:bg-white/30"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-600/80">Daily Review</p>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Start Review Session</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">{reviewQueue} words waiting</p>
            </div>
            <div className="rounded-full bg-amber-100/80 p-3 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <Button
            onClick={() => setLocation("/review")}
            className="mt-6 w-full justify-between rounded-2xl bg-[oklch(0.55_0.2_25)] px-6 py-6 text-lg font-semibold shadow-lg shadow-amber-900/10 hover:bg-[oklch(0.5_0.18_25)]"
          >
            Start Session
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setLocation("/vocabulary")}
            className="rounded-3xl border border-white/80 bg-white/90 p-4 text-left shadow dark:border-white/10 dark:bg-slate-900/70"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-600/80">
              <BookOpenCheck className="h-4 w-4" /> Browse Vocabulary
            </div>
            <p className="text-lg font-medium text-slate-900 dark:text-white">View all learned words</p>
            <p className="text-sm text-slate-500 dark:text-slate-300">Jump into your vocabulary list</p>
          </button>

          <button
            onClick={() => setShowUploader((prev) => !prev)}
            className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-left text-amber-900 shadow-sm dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em]">
              <UploadCloud className="h-4 w-4" /> Upload File
            </div>
            <p className="text-lg font-medium">Add new vocabulary</p>
            <p className="text-sm text-amber-800/70 dark:text-amber-100/80">
              {showUploader ? "Hide bulk uploader" : "Import TSV or paste rows"}
            </p>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-600/80">Add Words</p>
              <h3 className="text-lg font-semibold">Quick entry</h3>
            </div>
          </div>
          <VocabularyForm onSubmit={handleAddEntry} isLoading={isAdding} />
        </div>

        {showUploader && (
          <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/60 p-3 shadow-sm dark:border-amber-400/40 dark:bg-amber-400/10">
            <VocabularyUpload onUpload={handleUpload} />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-600/80">Recent Activity</p>
            <h3 className="text-lg font-semibold">Latest additions</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/vocabulary")} className="text-[oklch(0.48_0.19_25)]">
            See all
          </Button>
        </div>
        {recentEntries.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-slate-200 bg-white/90 p-5 text-center shadow-none dark:border-slate-700/50 dark:bg-slate-900/40">
            <p className="text-sm text-slate-500 dark:text-slate-300">Add your first word to start tracking progress.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm dark:border-white/5 dark:bg-slate-900/60"
              >
                <div>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">{entry.chinese}</p>
                  {entry.pinyin && <p className="text-sm text-slate-500 dark:text-slate-300">{entry.pinyin}</p>}
                  <p className="text-sm text-slate-400">{entry.english}</p>
                </div>
                <button
                  onClick={() => speakText(entry.chinese)}
                  className="rounded-full border border-slate-200/80 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
