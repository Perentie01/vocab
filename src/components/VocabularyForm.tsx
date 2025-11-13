import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import { VocabularyEntryMutation } from '@/lib/db';

interface VocabularyFormProps {
  onSubmit: (entry: VocabularyEntryMutation<'create'>) => Promise<void>;
  isLoading?: boolean;
}

export default function VocabularyForm({ onSubmit, isLoading = false }: VocabularyFormProps) {
  const [english, setEnglish] = useState('');
  const [chinese, setChinese] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const englishInputRef = useRef<HTMLInputElement>(null);
  const chineseInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus English input on mount
  useEffect(() => {
    englishInputRef.current?.focus();
  }, []);

  // Clear success message after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!english.trim() || !chinese.trim()) {
      setError('Please enter both English and Chinese');
      return;
    }

    try {
      await onSubmit({
        english: english.trim(),
        chinese: chinese.trim(),
      });
      setEnglish('');
      setChinese('');
      setSuccess(true);
      // Auto-focus back to English for next entry
      setTimeout(() => englishInputRef.current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab from English to Chinese
    if (e.key === 'Tab' && e.currentTarget === englishInputRef.current && !e.shiftKey) {
      e.preventDefault();
      chineseInputRef.current?.focus();
    }
    // Shift+Tab from Chinese to English
    if (e.key === 'Tab' && e.currentTarget === chineseInputRef.current && e.shiftKey) {
      e.preventDefault();
      englishInputRef.current?.focus();
    }
    // Enter from Chinese to submit
    if (e.key === 'Enter' && e.currentTarget === chineseInputRef.current && !e.shiftKey) {
      e.preventDefault();
      if (english.trim() && chinese.trim()) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Input
              ref={englishInputRef}
              id="english"
              placeholder="English"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="text-base"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1">
            <Input
              ref={chineseInputRef}
              id="chinese"
              placeholder="中文"
              value={chinese}
              onChange={(e) => setChinese(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="text-base"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">
              ✓ Word added successfully
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !english.trim() || !chinese.trim()}
            style={{
              backgroundColor: 'oklch(0.55 0.2 25)',
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
