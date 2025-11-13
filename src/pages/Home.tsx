import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { speakSequence, stopSpeech } from '@/lib/tts';
import { VocabularyEntry } from '@/lib/db';
import VocabularyForm from '@/components/VocabularyForm';
import VocabularyList from '@/components/VocabularyList';

export default function Home() {
  const { entries, loading, error, add, remove } = useVocabulary();
  const [isAdding, setIsAdding] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const handleAddEntry = async (entry: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsAdding(true);
    try {
      await add(entry);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSpeak = async (entry: VocabularyEntry) => {
    setTtsError(null);
    try {
      // Determine the language of the word and translation
      const wordLang = entry.language === 'en' ? 'en-US' : 'zh-CN';
      const translationLang = entry.language === 'en' ? 'zh-CN' : 'en-US';

      // Speak: English -> Chinese -> Chinese (slow)
      const speechSequence = [
        { text: entry.word, language: wordLang, rate: 1 },
        { text: entry.translation, language: translationLang, rate: 1 },
        { text: entry.translation, language: translationLang, rate: 0.7 }, // Slow pronunciation
      ];

      await speakSequence(speechSequence);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to play audio';
      setTtsError(message);
      console.error('TTS Error:', err);
    }
  };

  const handleStopSpeech = () => {
    stopSpeech();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="mb-8 flex items-center gap-4">
          <img src={'./logo.png'} alt="Vox" className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-1" style={{ color: 'oklch(0.55 0.2 25)' }}>Vox</h1>
            <p className="text-muted-foreground">Learn vocabulary with pronunciation guides</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {ttsError && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {ttsError}
          </div>
        )}

        <div className="space-y-8">
          <VocabularyForm onSubmit={handleAddEntry} isLoading={isAdding} />

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Vocabulary</h2>
            <button
              onClick={handleStopSpeech}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Stop Audio
            </button>
          </div>

          <VocabularyList
            entries={entries}
            onDelete={remove}
            onSpeak={handleSpeak}
            isLoading={isAdding}
          />
        </div>
      </div>
    </div>
  );
}
