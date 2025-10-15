import { useEffect, useState } from "react";
import { getAllTasks, type Task } from "../db/idb";

export default function TaskList({ refreshFlag }: { refreshFlag: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  async function load() {
    const items = await getAllTasks();
    items.sort((a, b) => b.createdAt - a.createdAt);
    setTasks(items);
  }

  useEffect(() => {
    load();
  }, [refreshFlag]);

  if (!tasks.length) return <p>No hay registros aún.</p>;

  return (
    <ul style={{ display: "grid", gap: 8, padding: 0, listStyle: "none" }}>
      {tasks.map((t) => (
        <li key={t.id} style={{
          border: "1px solid #2a3348",
          borderRadius: 12,
          padding: "10px 12px",
          background: "rgba(255,255,255,0.04)"
        }}>
          <strong>{t.title}</strong>
          {t.notes ? <div style={{ opacity: 0.9 }}>{t.notes}</div> : null}
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {new Date(t.createdAt).toLocaleString()}
            {" · "}{t.synced === 1 ? "sincronizado" : "local"}
          </div>
        </li>
      ))}
    </ul>
  );
}
