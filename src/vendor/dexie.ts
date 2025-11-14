/**
 * Minimal Dexie-compatible wrapper for IndexedDB used to provide a familiar API
 * in constrained environments where external packages cannot be fetched.
 *
 * The goal of this shim is to keep the calling code aligned with Dexie's
 * ergonomics (versioned schema declaration, typed Table helpers, etc.) while
 * still delivering reliable IndexedDB operations.
 */

export type TableIdentifier = string;

export type StoreSchemaMap = Record<TableIdentifier, string>;

type StoreMetadata = {
  keyPath: string;
  autoIncrement: boolean;
  indexes: string[];
};

const DEFAULT_KEY_PATH = 'id';

function normalizeIndexToken(token: string): string {
  const stripped = token
    .replace(/^\+\+/, '')
    .replace(/^&/, '')
    .replace(/^\*/, '')
    .replace(/\[/g, '')
    .replace(/\]/g, '')
    .replace(/\+/g, '')
    .trim();
  return stripped || DEFAULT_KEY_PATH;
}

function parseStoreDefinition(definition: string): StoreMetadata {
  const tokens = definition
    .split(',')
    .map(token => token.trim())
    .filter(Boolean);

  if (!tokens.length) {
    return {
      keyPath: DEFAULT_KEY_PATH,
      autoIncrement: false,
      indexes: [],
    } satisfies StoreMetadata;
  }

  const keyToken = tokens[0];
  const autoIncrement = keyToken.startsWith('++');
  const keyPath = normalizeIndexToken(keyToken);
  const indexes = tokens.slice(1).map(normalizeIndexToken);

  return {
    keyPath,
    autoIncrement,
    indexes,
  } satisfies StoreMetadata;
}

export class Table<TRecord, TKey = IDBValidKey> {
  constructor(
    private readonly getDB: () => Promise<IDBDatabase>,
    private readonly storeName: string
  ) {}

  private async transact<TResult>(
    mode: IDBTransactionMode,
    executor: (store: IDBObjectStore) => IDBRequest<TResult>
  ): Promise<TResult> {
    const db = await this.getDB();
    return new Promise<TResult>((resolve, reject) => {
      try {
        const tx = db.transaction(this.storeName, mode);
        const store = tx.objectStore(this.storeName);
        const request = executor(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB transaction failed'));
      } catch (error) {
        reject(error);
      }
    });
  }

  add(record: TRecord): Promise<TKey> {
    return this.transact('readwrite', store => store.add(record as any)) as Promise<TKey>;
  }

  bulkAdd(records: TRecord[]): Promise<TKey[]> {
    if (!records.length) {
      return Promise.resolve([]);
    }

    return this.getDB().then(
      db =>
        new Promise<TKey[]>((resolve, reject) => {
          const tx = db.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const keys: TKey[] = [];

          tx.oncomplete = () => resolve(keys);
          tx.onerror = () => reject(tx.error ?? new Error('Bulk add failed'));
          tx.onabort = () => reject(tx.error ?? new Error('Bulk add aborted'));

          records.forEach(record => {
            const request = store.add(record as any);
            request.onsuccess = () => {
              keys.push(request.result as TKey);
            };
            request.onerror = () => {
              tx.abort();
              reject(request.error ?? new Error('Bulk add request failed'));
            };
          });
        })
    );
  }

  put(record: TRecord): Promise<TKey> {
    return this.transact('readwrite', store => store.put(record as any)) as Promise<TKey>;
  }

  delete(key: TKey): Promise<void> {
    return this.transact('readwrite', store => store.delete(key as IDBValidKey)).then(() => undefined);
  }

  get(key: TKey): Promise<TRecord | undefined> {
    return this.transact('readonly', store => store.get(key as IDBValidKey)) as Promise<TRecord | undefined>;
  }

  async toArray(): Promise<TRecord[]> {
    const result = await this.transact('readonly', store => store.getAll());
    return (result as TRecord[]) ?? [];
  }
}

export default class Dexie {
  private schemaVersion = 1;
  private readonly stores: Record<TableIdentifier, StoreMetadata> = {};
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(private readonly dbName: string) {}

  version(versionNumber: number) {
    this.schemaVersion = versionNumber;

    return {
      stores: (definition: StoreSchemaMap) => {
        Object.entries(definition).forEach(([storeName, schema]) => {
          this.stores[storeName] = parseStoreDefinition(schema);
        });
        return this;
      },
    };
  }

  protected table<TRecord, TKey = IDBValidKey>(name: TableIdentifier): Table<TRecord, TKey> {
    if (!this.stores[name]) {
      throw new Error(`Store "${name}" has not been configured.`);
    }
    return new Table<TRecord, TKey>(() => this.getDatabase(), name);
  }

  open(): Promise<IDBDatabase> {
    return this.getDatabase();
  }

  private getDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.schemaVersion);

        request.onerror = () => {
          reject(request.error ?? new Error('Failed to open IndexedDB database'));
        };

        request.onupgradeneeded = () => {
          const db = request.result;
          Object.entries(this.stores).forEach(([storeName, metadata]) => {
            let store: IDBObjectStore;
            if (db.objectStoreNames.contains(storeName)) {
              store = request.transaction!.objectStore(storeName);
            } else {
              store = db.createObjectStore(storeName, {
                keyPath: metadata.keyPath,
                autoIncrement: metadata.autoIncrement,
              });
            }

            metadata.indexes.forEach(indexName => {
              if (!store.indexNames.contains(indexName)) {
                store.createIndex(indexName, indexName, { unique: false });
              }
            });
          });
        };

        request.onsuccess = () => {
          const db = request.result;
          db.onclose = () => {
            this.dbPromise = null;
          };
          resolve(db);
        };
      } catch (error) {
        reject(error);
      }
    });

    return this.dbPromise;
  }
}
