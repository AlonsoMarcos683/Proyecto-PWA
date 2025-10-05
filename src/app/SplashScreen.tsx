import { useEffect } from "react";

type Props = { onDone: () => void };

export default function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800); // 1.8s
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="splash">
      <div className="splash-logo">💡</div>
      <p>Cargando…</p>
    </div>
  );
}
