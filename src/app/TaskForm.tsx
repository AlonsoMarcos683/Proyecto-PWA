import { useState } from "react";
import { addTask } from "../db/idb";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function TaskForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const online = useOnlineStatus();
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setMsg("El título es requerido.");
      return;
    }
    await addTask({
      title: title.trim(),
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
      synced: online ? 1 : 0,
    });

if (!online && "serviceWorker" in navigator) {
  try {
    const reg = await navigator.serviceWorker.ready;

    if ("sync" in reg) {
      await (reg as any).sync.register("sync-entries");
      console.log("📡 Background Sync registrado: sync-entries");
    } else {
      console.warn("Background Sync no soportado en este navegador/entorno.");
    }
  } catch (err) {
    console.error("❌ No se pudo registrar Background Sync", err);
  }
}



    setTitle("");
    setNotes("");
    setMsg(
      online
        ? "✅ Guardado y sincronizado en el servidor."
        : "💾 Guardado local (se sincronizará al reconectar)."
    );

    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
      <label>
        Título
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Actividad de laboratorio"
          required
        />
      </label>

      <label>
        Notas
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Descripción breve…"
          rows={3}
        />
      </label>

      <button type="submit" style={{ padding: "10px", fontWeight: 600 }}>
        Guardar
      </button>

      {msg && <small style={{ color: "#8bc34a" }}>{msg}</small>}
    </form>
  );
}
