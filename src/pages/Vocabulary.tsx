import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useVocabulary } from "@/hooks/useVocabulary";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Volume2, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { speakText } from "@/lib/tts";

export default function Vocabulary() {
  const [, setLocation] = useLocation();
  const { entries, deleteEntry, restoreEntry } = useVocabulary();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletedEntry, setDeletedEntry] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

  const filteredEntries = entries.filter(
    (entry) =>
      entry.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.chinese.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (entry: any) => {
    deleteEntry(entry.id);
    setDeletedEntry(entry);
    
    toast.success("Word deleted", {
      description: `"${entry.english}" has been removed`,
      action: {
        label: "Undo",
        onClick: () => {
          restoreEntry(entry);
          setDeletedEntry(null);
          toast.dismiss();
        },
      },
      duration: 5000,
    });
  };

  const handleSpeak = (text: string, lang: "en" | "zh") => {
    speakText(text, lang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-orange-100 dark:border-slate-700 elevation-2">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-orange-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{entries.length}</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-700" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="container py-6">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="elevation-1"
        />
      </div>

      {/* Vocabulary List */}
      <div className="container pb-12">
        {filteredEntries.length === 0 ? (
          <Card className="p-8 text-center elevation-1 dark:bg-slate-800 dark:border-slate-700">
            <p className="text-gray-500 dark:text-gray-400">
              {entries.length === 0
                ? "No words yet. Add your first word on the home page!"
                : "No matching words found."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="p-6 elevation-2 hover:elevation-3 transition-all hover:shadow-lg dark:bg-slate-800 dark:border-slate-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {entry.english}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSpeak(entry.english, "en")}
                        className="hover:bg-orange-100 dark:hover:bg-slate-700"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {entry.chinese}
                      </p>
                      {entry.pinyin && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{entry.pinyin}</p>
                      )}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={`${entry.id}-${tag}`}
                              className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(entry.chinese, "zh")}
                      className="hover:bg-orange-100 dark:hover:bg-slate-700"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry)}
                      className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
