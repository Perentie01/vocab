import Dexie, { Table } from 'dexie';

/**
 * IndexedDB storage layer for vocabulary entries powered by a Dexie-style API.
 */

type Timestamped<T> = T & {
  createdAt: number;
  updatedAt: number;
};

type WithIdentifier<T> = T & {
  id: string;
};

export type VocabularyEntryAttributes = {
  english: string;
  chinese: string;
  pinyin?: string;
  tags?: string[];
};

export type VocabularyEntry = WithIdentifier<Timestamped<VocabularyEntryAttributes>>;
export type VocabularyEntryDraft = VocabularyEntryAttributes;
export type VocabularyEntryUpdate = Partial<VocabularyEntryAttributes>;

export type VocabularyEntryMutation<T extends 'create' | 'update'> = T extends 'create'
  ? VocabularyEntryDraft
  : VocabularyEntryUpdate;

const DB_NAME = 'VocabDB';
const DB_VERSION = 2;
const STORE_NAME = 'vocabulary';

class VocabularyDatabase extends Dexie {
  vocabulary!: Table<VocabularyEntry, string>;

  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      [STORE_NAME]: '&id, english, chinese, pinyin, tags, createdAt, updatedAt',
    });

    this.vocabulary = this.table<VocabularyEntry, string>(STORE_NAME);
  }
}

const db = new VocabularyDatabase();

function generateEntryId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createEntryRecord(
  attributes: VocabularyEntryDraft,
  timestamp: number = Date.now()
): VocabularyEntry {
  const normalizedTags = attributes.tags?.map(tag => tag.trim()).filter(Boolean);

  return {
    ...attributes,
    ...(normalizedTags ? { tags: normalizedTags } : {}),
    id: generateEntryId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies VocabularyEntry;
}

export async function initDB(): Promise<void> {
  await db.open();
}

export async function addEntry(entry: VocabularyEntryDraft): Promise<VocabularyEntry> {
  const newEntry = createEntryRecord(entry);
  await db.vocabulary.add(newEntry);
  return newEntry;
}

export async function addEntries(entries: VocabularyEntryDraft[]): Promise<VocabularyEntry[]> {
  if (!entries.length) {
    return [];
  }

  const prepared = entries.map((entry, index) => createEntryRecord(entry, Date.now() + index));
  await db.vocabulary.bulkAdd(prepared);
  return prepared;
}

export async function updateEntry(
  id: string,
  updates: VocabularyEntryUpdate
): Promise<VocabularyEntry> {
  const entry = await getEntry(id);

  if (!entry) {
    throw new Error('Entry not found');
  }

  const updatedEntry: VocabularyEntry = {
    ...entry,
    ...updates,
    updatedAt: Date.now(),
  };

  await db.vocabulary.put(updatedEntry);
  return updatedEntry;
}

export async function deleteEntry(id: string): Promise<void> {
  await db.vocabulary.delete(id);
}

export async function getEntry(id: string): Promise<VocabularyEntry | null> {
  const result = await db.vocabulary.get(id);
  return result ?? null;
}

export async function getAllEntries(): Promise<VocabularyEntry[]> {
  const entries = await db.vocabulary.toArray();
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getEntriesByLanguage(language: 'en' | 'zh'): Promise<VocabularyEntry[]> {
  const entries = await db.vocabulary.toArray();
  return entries
    .filter(entry => (language === 'en' ? Boolean(entry.english) : Boolean(entry.chinese)))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function searchEntries(query: string): Promise<VocabularyEntry[]> {
  const allEntries = await db.vocabulary.toArray();
  const lowerQuery = query.toLowerCase();

  return allEntries.filter(
    entry =>
      entry.english.toLowerCase().includes(lowerQuery) ||
      entry.chinese.toLowerCase().includes(lowerQuery)
  );
}
