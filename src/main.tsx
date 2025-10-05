import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import AppShell from "./app/AppShell";
import SplashScreen from "./app/SplashScreen";
import HomeScreen from "./app/HomeScreen";
import "./styles.css";

import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true, 
  onNeedRefresh() {
    console.log("Nueva versión disponible. Se actualizará automáticamente.");
  },
  onOfflineReady() {
    console.log("La aplicación está lista para usarse sin conexión.");
  },
});

function App() {
  const [ready, setReady] = useState(false);

  return (
    <AppShell>
      {!ready ? <SplashScreen onDone={() => setReady(true)} /> : <HomeScreen />}
    </AppShell>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
