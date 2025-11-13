import { VocabularyEntry } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';

interface VocabularyListProps {
  entries: VocabularyEntry[];
  onDelete?: (id: string) => Promise<void>;
  onSpeak?: (entry: VocabularyEntry) => Promise<void>;
  isLoading?: boolean;
}

export default function VocabularyList({
  entries,
  isLoading = false,
}: VocabularyListProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No entries yet. Add your first word!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {entries.slice(0, 5).map(entry => (
        <Card key={entry.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{entry.english}</p>
              <p className="text-sm text-gray-600">{entry.chinese}</p>
            </div>
          </div>
        </Card>
      ))}
      {entries.length > 5 && (
        <p className="text-sm text-center text-gray-500">
          +{entries.length - 5} more words
        </p>
      )}
    </div>
  );
}
