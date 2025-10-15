import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface Task {
  id?: number;
  title: string;
  notes?: string;
  createdAt: number;
  synced?: 0 | 1; 
}

interface MyDB extends DBSchema {
  tasks: {
    key: IDBValidKey;
    value: Task;
    indexes: {
      "by_synced": number;
      "by_createdAt": number;
    };
  };
}

let _db: IDBPDatabase<MyDB> | undefined;

export async function getDB() {
  if (_db) return _db;
  _db = await openDB<MyDB>("pwa-db", 1, {
    upgrade(db) {
      const store = db.createObjectStore("tasks", {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("by_synced", "synced");
      store.createIndex("by_createdAt", "createdAt");
    },
  });
  return _db;
}

export async function addTask(task: Omit<Task, "id">) {
  const db = await getDB();
  await db.add("tasks", task);
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll("tasks");
}

export async function getPendingTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex("tasks", "by_synced", 0);
}

export async function updateTask(t: Task) {
  const db = await getDB();
  await db.put("tasks", t);
}
