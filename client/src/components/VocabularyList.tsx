import { useState, useMemo } from 'react';
import { VocabularyEntry } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Volume2 } from 'lucide-react';

interface VocabularyListProps {
  entries: VocabularyEntry[];
  onDelete: (id: string) => Promise<void>;
  onSpeak: (entry: VocabularyEntry) => Promise<void>;
  isLoading?: boolean;
}

export default function VocabularyList({
  entries,
  onDelete,
  onSpeak,
  isLoading = false,
}: VocabularyListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;

    const query = searchQuery.toLowerCase();
    return entries.filter(
      entry =>
        entry.word.toLowerCase().includes(query) ||
        entry.translation.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSpeak = async (entry: VocabularyEntry) => {
    setSpeakingId(entry.id);
    try {
      await onSpeak(entry);
    } finally {
      setSpeakingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="search" className="block text-sm font-medium">
          Search
        </label>
        <Input
          id="search"
          placeholder="Search by word or translation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {entries.length === 0 ? 'No entries yet. Add your first word!' : 'No results found.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredEntries.map(entry => (
            <Card key={entry.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg break-words">{entry.word}</h3>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {entry.language === 'en' ? 'English' : '中文'}
                      </span>
                    </div>
                    <p className="text-muted-foreground break-words">{entry.translation}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSpeak(entry)}
                      disabled={isLoading || speakingId === entry.id}
                      title="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      disabled={isLoading || deletingId === entry.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredEntries.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredEntries.length} of {entries.length} entries
        </p>
      )}
    </div>
  );
}
