import { useMemo, useState } from "react";
import { Volume2, Trash2, Search, SlidersHorizontal } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useVocabulary } from "@/hooks/useVocabulary";
import { speakText } from "@/lib/tts";
import { toast } from "sonner";

const LEVEL_FILTERS = [
  { label: "All", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
] as const;

type LevelFilter = (typeof LEVEL_FILTERS)[number]["value"];

type SortMode = "alphabetical" | "date";

export default function Vocabulary() {
  const { entries, deleteEntry, restoreEntry } = useVocabulary();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("alphabetical");

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchTerm.toLowerCase();

    return entries
      .filter((entry) => {
        const matchesSearch =
          entry.english.toLowerCase().includes(normalizedQuery) ||
          entry.chinese.toLowerCase().includes(normalizedQuery);

        if (levelFilter === "all") return matchesSearch;
        const tags = entry.tags?.map((tag) => tag.toLowerCase()) ?? [];
        return matchesSearch && tags.includes(levelFilter);
      })
      .sort((a, b) => {
        if (sortMode === "alphabetical") {
          return a.english.localeCompare(b.english);
        }
        return b.createdAt - a.createdAt;
      });
  }, [entries, levelFilter, searchTerm, sortMode]);

  const handleDelete = (entryId: string) => {
    const entry = entries.find((item) => item.id === entryId);
    if (!entry) return;

    deleteEntry(entryId);
    toast.success("Word deleted", {
      description: `"${entry.english}" has been removed`,
      action: {
        label: "Undo",
        onClick: () => restoreEntry(entry),
      },
      duration: 5000,
    });
  };

  const computeMastery = (entryId: string) => {
    let hash = 0;
    for (let i = 0; i < entryId.length; i += 1) {
      hash = (hash + entryId.charCodeAt(i) * 13) % 1000;
    }
    return 40 + (hash % 55);
  };

  return (
    <AppLayout
      title="Vocabulary List"
      subtitle="Vocabulary"
      description={`${entries.length} words saved`}
    >
      <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search vocabulary"
            className="h-12 rounded-2xl border-none bg-slate-100 pl-12 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.2_25)] dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {LEVEL_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setLevelFilter(value)}
              className={`rounded-full px-4 py-1 text-sm font-medium transition ${
                levelFilter === value
                  ? "bg-[oklch(0.55_0.2_25)] text-white shadow"
                  : "bg-white text-slate-500 hover:text-slate-900 dark:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500 dark:text-slate-300">{filteredEntries.length} words</div>
        <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-medium dark:border-white/10 dark:bg-slate-900/60">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <button
            className={`rounded-full px-2 py-1 transition ${sortMode === "alphabetical" ? "bg-slate-900/90 text-white" : "text-slate-500"}`}
            onClick={() => setSortMode("alphabetical")}
          >
            A-Z
          </button>
          <button
            className={`rounded-full px-2 py-1 transition ${sortMode === "date" ? "bg-slate-900/90 text-white" : "text-slate-500"}`}
            onClick={() => setSortMode("date")}
          >
            Date
          </button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/80 p-8 text-center text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/40">
          No vocabulary matches your search just yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const mastery = computeMastery(entry.id);
            return (
              <div
                key={entry.id}
                className="rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow dark:border-white/10 dark:bg-slate-900/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-amber-600/80">{new Date(entry.createdAt).toLocaleDateString()}</p>
                    <p className="text-3xl font-semibold text-slate-900 dark:text-white">{entry.chinese}</p>
                    {entry.pinyin && <p className="text-sm text-slate-500 dark:text-slate-300">{entry.pinyin}</p>}
                    <p className="text-base text-slate-500">{entry.english}</p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <Badge key={`${entry.id}-${tag}`} variant="secondary" className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speakText(entry.chinese)}
                    className="rounded-2xl border border-slate-200/70 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Mastery</span>
                    <span>{mastery}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-[oklch(0.55_0.2_25)]" style={{ width: `${mastery}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1 rounded-2xl bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
                    onClick={() => speakText(entry.chinese)}
                  >
                    Practice
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
