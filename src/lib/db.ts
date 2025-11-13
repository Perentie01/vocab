/**
 * IndexedDB storage layer for vocabulary entries
 * Implements proper connection management to prevent "database connection is closing" errors
 */

export interface VocabularyEntry {
  id: string;
  english: string;
  chinese: string;
  pinyin?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = 'VocabDB';
const DB_VERSION = 1;
const STORE_NAME = 'vocabulary';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null; // Reset promise on error
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      const database = request.result;
      
      // Reset connection on close to allow reconnection
      database.onclose = () => {
        dbPromise = null;
      };
      
      resolve(database);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('language', 'language', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });

  return dbPromise;
}

export async function initDB(): Promise<void> {
  await openDB();
}

function executeTransaction<T>(
  callback: (store: IDBObjectStore) => IDBRequest<T>,
  mode: 'readonly' | 'readwrite' = 'readonly'
): Promise<T> {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = callback(store);

        request.onerror = () => {
          reject(new Error('Transaction failed'));
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        transaction.onerror = () => {
          reject(new Error('Transaction error'));
        };
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function addEntry(
  entry: Omit<VocabularyEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<VocabularyEntry> {
  const now = Date.now();
  const newEntry: VocabularyEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };

  await executeTransaction(
    (store) => store.add(newEntry),
    'readwrite'
  );

  return newEntry;
}

export async function updateEntry(
  id: string,
  updates: Partial<Omit<VocabularyEntry, 'id' | 'createdAt'>>
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

  await executeTransaction(
    (store) => store.put(updatedEntry),
    'readwrite'
  );

  return updatedEntry;
}

export async function deleteEntry(id: string): Promise<void> {
  await executeTransaction(
    (store) => store.delete(id),
    'readwrite'
  );
}

export async function getEntry(id: string): Promise<VocabularyEntry | null> {
  const result = await executeTransaction((store) => store.get(id));
  return result || null;
}

export async function getAllEntries(): Promise<VocabularyEntry[]> {
  const results = await executeTransaction((store) => store.getAll());
  const entries = (results as VocabularyEntry[]) || [];
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getEntriesByLanguage(language: 'en' | 'zh'): Promise<VocabularyEntry[]> {
  const results = await executeTransaction((store) => {
    const index = store.index('language');
    return index.getAll(language);
  });
  const entries = (results as VocabularyEntry[]) || [];
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function searchEntries(query: string): Promise<VocabularyEntry[]> {
  const allEntries = await getAllEntries();
  const lowerQuery = query.toLowerCase();

  return allEntries.filter(
    (entry) =>
      entry.english.toLowerCase().includes(lowerQuery) ||
      entry.chinese.toLowerCase().includes(lowerQuery)
  );
}
