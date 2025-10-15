import { useEffect, useState } from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { flushPendingTasks } from "../sync/flush";

export default function SyncStatus() {
  const online = useOnlineStatus();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function runFlush() {
      setMsg(null);
      const res = await flushPendingTasks((sent, total) => {
        if (!active) return;
        setMsg(`Sincronizando pendientes… ${sent}/${total}`);
      });
      if (!active) return;
      if (res.total > 0) {
        setMsg(`Sincronización completa: ${res.sent}/${res.total}`);
        setTimeout(() => active && setMsg(null), 2500);
      } else {
        setMsg(null);
      }
    }

    if (online) {
      runFlush();
    }
    return () => { active = false; };
  }, [online]);

  if (!msg) return null;
  return (
    <div style={{
      position: "sticky",
      top: 0,
      padding: "6px 10px",
      background: "#1976d2",
      color: "white",
      fontSize: 13,
      zIndex: 10,
      textAlign: "center",
      borderBottom: "1px solid rgba(0,0,0,0.2)"
    }}>
      {msg}
    </div>
  );
}
