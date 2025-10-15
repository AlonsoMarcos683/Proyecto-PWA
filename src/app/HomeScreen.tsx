import { useState } from "react";
import OfflineBanner from "./OfflineBanner";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import SyncStatus from "./SyncStatus";

export default function HomeScreen() {
  const [refresh, setRefresh] = useState(0);
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <SyncStatus />        {}
      <OfflineBanner />
      <h2>Registro de actividades </h2>
      <TaskForm onSaved={() => setRefresh((n) => n + 1)} />
      <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />
      <TaskList refreshFlag={refresh} />
    </section>
  );
}
