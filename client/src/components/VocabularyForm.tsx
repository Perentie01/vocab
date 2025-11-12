import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { VocabularyEntry } from '@/lib/db';
import { detectLanguage, translateText, getTranslationLanguagePair } from '@/lib/translation';

interface VocabularyFormProps {
  onSubmit: (entry: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

export default function VocabularyForm({ onSubmit, isLoading = false }: VocabularyFormProps) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!word.trim()) {
      setError('Please enter a word first');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const detectedLang = await detectLanguage(word);
      const { from, to } = getTranslationLanguagePair(detectedLang);
      const translatedText = await translateText(word, from, to);
      setTranslation(translatedText);
    } catch (err) {
      setError('Failed to translate. Please try again.');
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!word.trim() || !translation.trim()) {
      setError('Please enter both word and translation');
      return;
    }

    try {
      const language = await detectLanguage(word);
      await onSubmit({
        word: word.trim(),
        translation: translation.trim(),
        language,
      });
      setWord('');
      setTranslation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Word</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="word" className="block text-sm font-medium">
              Word or Phrase
            </label>
            <div className="flex gap-2">
              <Input
                id="word"
                placeholder="Enter a word in English or Chinese..."
                value={word}
                onChange={(e) => setWord(e.target.value)}
                disabled={isLoading || isTranslating}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTranslate}
                disabled={isLoading || isTranslating || !word.trim()}
              >
                {isTranslating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Translate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="translation" className="block text-sm font-medium">
              Translation
            </label>
            <Input
              id="translation"
              placeholder="Translation will appear here..."
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !word.trim() || !translation.trim()}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Add Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
