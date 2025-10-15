import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div style={{
      background: "#f44336",
      color: "white",
      padding: "8px 12px",
      textAlign: "center",
      fontWeight: 600
    }}>
      Estás offline — los datos se guardarán localmente y se mostrarán al recargar.
    </div>
  );
}
