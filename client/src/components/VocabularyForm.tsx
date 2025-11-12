import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { VocabularyEntry } from '@/lib/db';

interface VocabularyFormProps {
  onSubmit: (entry: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
}

export default function VocabularyForm({ onSubmit, isLoading = false }: VocabularyFormProps) {
  const [english, setEnglish] = useState('');
  const [chinese, setChinese] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!english.trim() || !chinese.trim()) {
      setError('Please enter both English and Chinese');
      return;
    }

    try {
      await onSubmit({
        word: english.trim(),
        translation: chinese.trim(),
        language: 'en',
      });
      setEnglish('');
      setChinese('');
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
            <label htmlFor="english" className="block text-sm font-medium">
              English
            </label>
            <Input
              id="english"
              placeholder="Paste English word or phrase..."
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="chinese" className="block text-sm font-medium">
              Chinese (中文)
            </label>
            <Input
              id="chinese"
              placeholder="Paste Chinese word or phrase..."
              value={chinese}
              onChange={(e) => setChinese(e.target.value)}
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
            disabled={isLoading || !english.trim() || !chinese.trim()}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Add Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
