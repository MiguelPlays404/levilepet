import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'lvp-media-cache';
const STORE_NAME = 'pending-uploads';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  }
  return dbPromise;
}

export async function storeFileForResume(id: string, file: File) {
  const db = await getDB();
  await db.put(STORE_NAME, file, id);
}

export async function getStoredFile(id: string): Promise<File | null> {
  const db = await getDB();
  return (await db.get(STORE_NAME)) as File || null;
}

export async function removeStoredFile(id: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
