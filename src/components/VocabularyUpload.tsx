import { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VocabularyEntry } from '@/lib/db';
import { toast } from 'sonner';

const EXPECTED_HEADERS = ['chinese', 'pinyin', 'english', 'tags'] as const;

type UploadableEntry = Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>;

function parseTsvFile(contents: string): UploadableEntry[] {
  const sanitized = contents.replace(/\uFEFF/g, '').trim();
  if (!sanitized) {
    throw new Error('The uploaded file is empty.');
  }

  const rows = sanitized.split(/\r?\n/).filter(row => row.trim().length > 0);
  if (!rows.length) {
    throw new Error('No rows were found in the file.');
  }

  const headers = rows[0]
    .split('\t')
    .map(header => header.trim().toLowerCase());

  const missingHeaders = EXPECTED_HEADERS.filter(header => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing header${missingHeaders.length > 1 ? 's' : ''}: ${missingHeaders.join(', ')}`);
  }

  const headerIndex = Object.fromEntries(
    EXPECTED_HEADERS.map(header => [header, headers.indexOf(header)])
  ) as Record<(typeof EXPECTED_HEADERS)[number], number>;

  return rows.slice(1).map((row, rowIndex) => {
    const cells = row.split('\t');
    const english = cells[headerIndex.english]?.trim() ?? '';
    const chinese = cells[headerIndex.chinese]?.trim() ?? '';
    const pinyin = cells[headerIndex.pinyin]?.trim();
    const rawTags = cells[headerIndex.tags]?.trim();

    if (!english || !chinese) {
      throw new Error(`Row ${rowIndex + 2} is missing English or Chinese values.`);
    }

    const tags = rawTags
      ? rawTags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean)
      : undefined;

    return {
      english,
      chinese,
      pinyin: pinyin || undefined,
      tags,
    } satisfies UploadableEntry;
  });
}

interface VocabularyUploadProps {
  onUpload: (entries: UploadableEntry[]) => Promise<void>;
}

export default function VocabularyUpload({ onUpload }: VocabularyUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusType('idle');
    setStatusMessage(null);

    try {
      const text = await file.text();
      const entries = parseTsvFile(text);
      if (!entries.length) {
        throw new Error('No valid rows were found in the file.');
      }

      await onUpload(entries);
      const successMessage = `Imported ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} from "${file.name}".`;
      setStatusType('success');
      setStatusMessage(successMessage);
      toast.success('Upload complete', { description: successMessage });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process the uploaded file.';
      setStatusType('error');
      setStatusMessage(message);
      toast.error('Upload failed', { description: message });
    } finally {
      setIsProcessing(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="p-6 elevation-1 border-dashed border-2 border-orange-100 bg-orange-50/40">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-orange-100 p-2 text-orange-600">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bulk upload from TSV</h3>
            <p className="text-sm text-gray-600">
              Upload a tab-separated file with the following headers: chinese, pinyin, english, tags.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Input
            ref={inputRef}
            type="file"
            accept=".tsv,text/tab-separated-values"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="cursor-pointer"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
            className="w-full sm:w-auto gap-2"
          >
            <FileText className="w-4 h-4" />
            Choose TSV file
          </Button>
        </div>

        <div className="rounded-md bg-white/80 p-3 text-xs text-gray-600">
          <p className="font-semibold mb-1">Expected format</p>
          <pre className="whitespace-pre-wrap text-[11px]">
chinese    pinyin    english    tags
你好    nǐ hǎo    hello    greeting
谢谢    xièxie    thank you    gratitude
          </pre>
        </div>

        {statusMessage && (
          <div
            className={`rounded-md p-3 text-sm ${
              statusType === 'success'
                ? 'bg-green-50 text-green-700'
                : statusType === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-50 text-gray-700'
            }`}
          >
            {statusMessage}
          </div>
        )}
      </div>
    </Card>
  );
}
