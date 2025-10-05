import type { PropsWithChildren } from "react";

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app">
      <header className="app-header">
        <h1>MiPWA</h1>
      </header>

      <main className="app-content">{children}</main>

      <nav className="app-nav">
        <button>Inicio</button>
        <button>Perfil</button>
        <button>Ajustes</button>
      </nav>
    </div>
  );
}
