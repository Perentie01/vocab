import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Loader2, ArrowRight, Volume2 } from 'lucide-react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { speakText } from '@/lib/tts';
import { VocabularyEntry } from '@/lib/db';
import VocabularyForm from '@/components/VocabularyForm';
import VocabularyUpload from '@/components/VocabularyUpload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [, setLocation] = useLocation();
  const { entries, loading, error, add } = useVocabulary();
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUploadEntries = async (batch: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    setIsUploading(true);
    try {
      for (const entry of batch) {
        await add(entry);
      }
    } finally {
      setIsUploading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
      {/* Header with Logo */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-orange-100 elevation-2">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Vox" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'oklch(0.55 0.2 25)' }}>Vox</h1>
              <p className="text-sm text-gray-600">Learn vocabulary with pronunciation guides</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg elevation-1">
            {error}
          </div>
        )}

        {/* Word of the Day Banner */}
        {wordOfTheDay && (
          <Card className="p-6 elevation-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold opacity-90 mb-2">Word of the Day</p>
              <h2 className="text-3xl font-bold mb-2">{wordOfTheDay.english}</h2>
              <p className="text-lg opacity-90 mb-4">{wordOfTheDay.chinese}</p>
              {wordOfTheDay.pinyin && (
                <p className="text-sm opacity-75 mb-4">{wordOfTheDay.pinyin}</p>
              )}
              <Button
                onClick={() => speakText(wordOfTheDay.english, 'en')}
                className="bg-white text-orange-600 hover:bg-orange-50 elevation-2"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Hear Pronunciation
              </Button>
            </div>
          </Card>
        )}

        {/* Add New Word Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Add New Word</h2>
          <VocabularyForm onSubmit={handleAddEntry} isLoading={isAdding} />
          <VocabularyUpload onUpload={handleUploadEntries} />
          {isUploading && (
            <p className="text-sm text-gray-500">Processing uploaded entries...</p>
          )}
        </div>

        {/* Stats and Navigation */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 elevation-2 text-center hover:elevation-3 transition-all">
            <p className="text-3xl font-bold text-orange-600">{entries.length}</p>
            <p className="text-sm text-gray-600 mt-2">Words Learned</p>
          </Card>
          <Card
            className="p-6 elevation-2 text-center hover:elevation-3 transition-all cursor-pointer"
            onClick={() => setLocation('/vocabulary')}
          >
            <p className="text-3xl font-bold text-teal-600">→</p>
            <p className="text-sm text-gray-600 mt-2">View All</p>
          </Card>
        </div>

        {/* Call to Action */}
        {entries.length > 0 && (
          <Button
            onClick={() => setLocation('/vocabulary')}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold elevation-2"
          >
            View Your Vocabulary
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
