import { getPendingTasks, updateTask } from "../db/idb";

async function sendToServer(task: { id?: number; title: string; notes?: string; createdAt: number }) {
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  console.log("[SYNC] Tarea enviada:", task);
}


export async function flushPendingTasks(onProgress?: (sent: number, total: number) => void) {
  const pending = await getPendingTasks();
  const total = pending.length;
  let sent = 0;

  for (const t of pending) {
    try {
      await sendToServer(t);
      t.synced = 1;           
      await updateTask(t);
      sent++;
      onProgress?.(sent, total);
    } catch (e) {
      console.error("Error al enviar tarea pendiente", e);
      break;
    }
  }

  return { sent, total };
}
