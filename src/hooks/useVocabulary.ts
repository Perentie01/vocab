import { useState, useEffect, useCallback } from 'react';
import {
  VocabularyEntry,
  VocabularyEntryMutation,
  addEntry,
  addEntries,
  updateEntry,
  deleteEntry,
  getAllEntries,
  searchEntries,
  initDB,
} from '@/lib/db';

export function useVocabulary() {
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database and load entries
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        const allEntries = await getAllEntries();
        setEntries(allEntries);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const add = useCallback(
    async (entry: VocabularyEntryMutation<'create'>) => {
      try {
        const newEntry = await addEntry(entry);
        setEntries(prev => [newEntry, ...prev]);
        return newEntry;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add entry';
        setError(message);
        throw err;
      }
    },
    []
  );

  const update = useCallback(
    async (id: string, updates: VocabularyEntryMutation<'update'>) => {
      try {
        const updated = await updateEntry(id, updates);
        setEntries(prev =>
          prev.map(entry => (entry.id === id ? updated : entry))
        );
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update entry';
        setError(message);
        throw err;
      }
    },
    []
  );

  const addMany = useCallback(
    async (batch: VocabularyEntryMutation<'create'>[]) => {
      if (!batch.length) return [];

      try {
        const created = await addEntries(batch);
        setEntries(prev => [...created, ...prev]);
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add entries';
        setError(message);
        throw err;
      }
    },
    []
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteEntry(id);
        setEntries(prev => prev.filter(entry => entry.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete entry';
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteEntry_ = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove]
  );

  const restoreEntry = useCallback(
    async (entry: VocabularyEntry) => {
      try {
        const newEntry = await addEntry({
          english: entry.english,
          chinese: entry.chinese,
          pinyin: entry.pinyin,
          tags: entry.tags,
        });
        setEntries(prev => [newEntry, ...prev]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to restore entry';
        setError(message);
        throw err;
      }
    },
    []
  );

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return entries;
      }
      try {
        const results = await searchEntries(query);
        return results;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search entries';
        setError(message);
        return [];
      }
    },
    [entries]
  );

  return {
    entries,
    loading,
    error,
    add,
    addMany,
    update,
    remove,
    deleteEntry: deleteEntry_,
    restoreEntry,
    search,
  };
}
