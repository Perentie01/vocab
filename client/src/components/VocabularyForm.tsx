import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { VocabularyEntry } from '@/lib/db';
import { detectLanguage, translateText, getTranslationLanguagePair } from '@/lib/translation';

interface VocabularyFormProps {
  onSubmit: (entry: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

type LanguageMode = 'en-to-zh' | 'zh-to-en';

export default function VocabularyForm({ onSubmit, isLoading = false }: VocabularyFormProps) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('en-to-zh');
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
      const from = languageMode === 'en-to-zh' ? 'en' : 'zh-CN';
      const to = languageMode === 'en-to-zh' ? 'zh-CN' : 'en';
      const translatedText = await translateText(word, from, to);
      setTranslation(translatedText);
    } catch (err) {
      setError('Failed to translate. Please try again.');
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReverseDirection = () => {
    // Swap word and translation
    const temp = word;
    setWord(translation);
    setTranslation(temp);
    
    // Swap language mode
    setLanguageMode(languageMode === 'en-to-zh' ? 'zh-to-en' : 'en-to-zh');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!word.trim() || !translation.trim()) {
      setError('Please enter both word and translation');
      return;
    }

    try {
      const language = languageMode === 'en-to-zh' ? 'en' : 'zh';
      await onSubmit({
        word: word.trim(),
        translation: translation.trim(),
        language,
      });
      setWord('');
      setTranslation('');
      setLanguageMode('en-to-zh');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry');
    }
  };

  const isEnglishFirst = languageMode === 'en-to-zh';
  const sourceLabel = isEnglishFirst ? 'English' : 'Chinese (中文)';
  const targetLabel = isEnglishFirst ? 'Chinese (中文)' : 'English';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Word</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Language Mode Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={isEnglishFirst ? 'default' : 'outline'}
              onClick={() => {
                setLanguageMode('en-to-zh');
                setWord('');
                setTranslation('');
              }}
              disabled={isLoading || isTranslating}
              className="flex-1"
            >
              English → 中文
            </Button>
            <Button
              type="button"
              variant={!isEnglishFirst ? 'default' : 'outline'}
              onClick={() => {
                setLanguageMode('zh-to-en');
                setWord('');
                setTranslation('');
              }}
              disabled={isLoading || isTranslating}
              className="flex-1"
            >
              中文 → English
            </Button>
          </div>

          {/* Source Language Input */}
          <div className="space-y-2">
            <label htmlFor="word" className="block text-sm font-medium">
              {sourceLabel}
            </label>
            <Input
              id="word"
              placeholder={isEnglishFirst ? 'Enter an English word...' : 'Enter a Chinese word or phrase...'}
              value={word}
              onChange={(e) => setWord(e.target.value)}
              disabled={isLoading || isTranslating}
            />
          </div>

          {/* Reverse Direction Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReverseDirection}
              disabled={isLoading || isTranslating || !word.trim() || !translation.trim()}
              title="Reverse direction"
              className="rounded-full"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Target Language Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="translation" className="block text-sm font-medium">
                {targetLabel}
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={isLoading || isTranslating || !word.trim()}
              >
                {isTranslating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Translate
              </Button>
            </div>
            <Input
              id="translation"
              placeholder={isEnglishFirst ? 'Chinese translation will appear here...' : 'English translation will appear here...'}
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
