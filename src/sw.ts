/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

declare let self: ServiceWorkerGlobalScope;
declare global {

  interface SyncEvent extends ExtendableEvent {
    tag: string;
  }

  interface ServiceWorkerGlobalScopeEventMap {
    sync: SyncEvent;
  }
}


precacheAndRoute(self.__WB_MANIFEST || []);


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
      by_synced: number;
      by_createdAt: number;
    };
  };
}

let _db: IDBPDatabase<MyDB> | undefined;

async function getDB() {
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

async function getPendingTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex("tasks", "by_synced", 0);
}

async function deleteTask(id: number) {
  const db = await getDB();
  await db.delete("tasks", id);
}

const ENDPOINT = "/api/entries";

async function sendToServer(task: Task) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Server error");
}

async function flushPending() {
  const pending = await getPendingTasks();
  for (const t of pending) {
    try {
      await sendToServer(t);
      if (typeof t.id === "number") {
        await deleteTask(t.id);
      }
    } catch (err) {
      console.error("[SW] Sync error:", err);
      break;
    }
  }
}

self.addEventListener("install", (event: ExtendableEvent) => {

  self.skipWaiting();

  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", (event: ExtendableEvent) => {

  event.waitUntil(self.clients.claim());
});

self.addEventListener("sync", (event: ExtendableEvent & { tag?: string }) => {
  if ((event as any).tag === "sync-entries") {
    event.waitUntil(flushPending());
  }
});

self.addEventListener("message", (event: ExtendableEvent & { data?: any }) => {
  if (event.data === "flush-pending") {

    event.waitUntil(flushPending());
  }
});
