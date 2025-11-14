import { useReducer, useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VocabularyEntryMutation } from '@/lib/db';
import { toast } from 'sonner';

const EXPECTED_HEADERS = ['chinese', 'pinyin', 'english', 'tags'] as const;

type UploadableEntry = VocabularyEntryMutation<'create'>;

type UploadState = {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string | null;
  lastFileName: string | null;
  processedCount: number;
};

type UploadAction =
  | { type: 'START'; fileName: string }
  | { type: 'SUCCESS'; fileName: string; count: number }
  | { type: 'ERROR'; fileName: string; message: string };

const initialState: UploadState = {
  status: 'idle',
  message: null,
  lastFileName: null,
  processedCount: 0,
};

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case 'START':
      return {
        status: 'processing',
        message: null,
        lastFileName: action.fileName,
        processedCount: 0,
      };
    case 'SUCCESS':
      return {
        status: 'success',
        message: `Imported ${action.count} entr${action.count === 1 ? 'y' : 'ies'} from "${action.fileName}".`,
        lastFileName: action.fileName,
        processedCount: action.count,
      };
    case 'ERROR':
      return {
        status: 'error',
        message: action.message,
        lastFileName: action.fileName,
        processedCount: 0,
      };
    default:
      return state;
  }
}

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
  const [state, dispatch] = useReducer(uploadReducer, initialState);
  const [tsvText, setTsvText] = useState('');

  const isProcessing = state.status === 'processing';
  const statusMessage = state.message;
  const showStatus = state.status === 'success' || state.status === 'error';
  const statusType: 'idle' | 'success' | 'error' = showStatus
    ? state.status === 'success'
      ? 'success'
      : 'error'
    : 'idle';

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    dispatch({ type: 'START', fileName: file.name });

    try {
      const text = await file.text();
      const entries = parseTsvFile(text);
      if (!entries.length) {
        throw new Error('No valid rows were found in the file.');
      }

      await onUpload(entries);
      dispatch({ type: 'SUCCESS', fileName: file.name, count: entries.length });
      toast.success('Upload complete', {
        description: `Imported ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} from "${file.name}".`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process the uploaded file.';
      dispatch({ type: 'ERROR', fileName: file.name, message });
      toast.error('Upload failed', { description: message });
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleTextSubmit = async () => {
    const trimmed = tsvText.trim();
    const sourceName = 'Pasted TSV';

    if (!trimmed) {
      toast.error('Upload failed', {
        description: 'Please paste TSV data before importing.',
      });
      return;
    }

    dispatch({ type: 'START', fileName: sourceName });

    try {
      const entries = parseTsvFile(trimmed);
      if (!entries.length) {
        throw new Error('No valid rows were found in the pasted text.');
      }

      await onUpload(entries);
      dispatch({ type: 'SUCCESS', fileName: sourceName, count: entries.length });
      toast.success('Upload complete', {
        description: `Imported ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} from pasted text.`,
      });
      setTsvText('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process the pasted data.';
      dispatch({ type: 'ERROR', fileName: sourceName, message });
      toast.error('Upload failed', { description: message });
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

        <div className="flex flex-col gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">Or paste TSV data</p>
            <p className="text-xs text-gray-600">Paste rows directly below and import without uploading a file.</p>
          </div>
          <Textarea
            value={tsvText}
            onChange={event => setTsvText(event.target.value)}
            placeholder={`chinese\tpinyin\tenglish\ttags\n你好\tnǐ hǎo\thello\tgreeting`}
            rows={6}
            disabled={isProcessing}
            className="font-mono"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleTextSubmit}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Import pasted TSV
            </Button>
          </div>
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
