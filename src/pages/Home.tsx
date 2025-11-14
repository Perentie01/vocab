import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Loader2, Volume2, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useVocabulary } from '@/hooks/useVocabulary';
import { speakText } from '@/lib/tts';
import { VocabularyEntry, VocabularyEntryMutation } from '@/lib/db';
import VocabularyForm from '@/components/VocabularyForm';
import VocabularyUpload from '@/components/VocabularyUpload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import voxLogo from '@/assets/logo';

export default function Home() {
  const [, setLocation] = useLocation();
  const { entries, loading, error, add, addMany } = useVocabulary();
  const [isAdding, setIsAdding] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Select a random word of the day
  const wordOfTheDay = useMemo(() => {
    if (entries.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * entries.length);
    return entries[randomIndex];
  }, [entries.length]);

  const handleAddEntry = async (entry: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsAdding(true);
    try {
      await add(entry);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpload = async (batch: VocabularyEntryMutation<'create'>[]) => {
    if (!batch.length) return;
    await addMany(batch);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <p className="text-gray-600">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header with Logo */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-orange-100 dark:border-slate-700 elevation-2">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={voxLogo} alt="Vox" className="w-12 h-12" />
              <h1 className="text-3xl font-bold" style={{ color: 'oklch(0.55 0.2 25)' }}>Vox</h1>
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
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg elevation-1">
            {error}
          </div>
        )}

        {/* Word of the Day Banner */}
        {wordOfTheDay && (
          <Card className="p-5 elevation-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold opacity-90 mb-2">Word of the Day</p>
              <h2 className="text-2xl font-semibold mb-1">{wordOfTheDay.english}</h2>
              <p className="text-lg font-semibold opacity-90 mb-2">{wordOfTheDay.chinese}</p>
              {wordOfTheDay.pinyin && (
                <p className="text-sm opacity-80 mb-4">{wordOfTheDay.pinyin}</p>
              )}
              <Button
                onClick={() => speakText(wordOfTheDay.chinese)}
                className="bg-white text-orange-600 hover:bg-orange-50 elevation-2"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                听中文发音
              </Button>
            </div>
          </Card>
        )}

        {/* Add New Word Section */}
        <div className="space-y-4">
          <VocabularyForm onSubmit={handleAddEntry} isLoading={isAdding} />
          <VocabularyUpload onUpload={handleUpload} />
        </div>

        {/* Stats and Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6 elevation-2 text-center hover:elevation-3 transition-all dark:bg-slate-800 dark:border-slate-700">
            <p className="text-3xl font-bold text-orange-600">{entries.length}</p>
          </Card>
          <Card
            className="p-6 elevation-2 text-center hover:elevation-3 transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700"
            onClick={() => setLocation('/vocabulary')}
          >
            <p className="text-3xl font-bold text-teal-600">→</p>
          </Card>
          <Card
            className="p-6 elevation-2 text-center hover:elevation-3 transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700"
            onClick={() => setLocation('/spaced-repetition')}
          >
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Practice</p>
              <p className="text-xl font-semibold text-orange-600">Spaced Repetition</p>
            </div>
          </Card>
        </div>


      </div>
    </div>
  );
}
