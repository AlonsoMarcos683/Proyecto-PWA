import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import AppShell from "./app/AppShell";
import SplashScreen from "./app/SplashScreen";
import HomeScreen from "./app/HomeScreen";
import "./styles.css";

import { registerSW } from "virtual:pwa-register";
import { getMessagingSafe, getToken, onMessage } from "./libs/firebase";

const updateSW =
  (import.meta.env.PROD && "serviceWorker" in navigator)
    ? registerSW({
        immediate: true,
        onNeedRefresh() { updateSW(); },
        onOfflineReady() { console.log("[PWA] Offline listo"); },
      })
    : () => {};

let refreshing = false;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

let fcmInitialized = false;
async function setupFirebaseMessaging() {
  if (fcmInitialized) return;
  fcmInitialized = true;

  if (!("Notification" in window)) return;

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return;

  const messaging = getMessagingSafe();
  if (!messaging) return;

  try {

    const token = await getToken(messaging, {
      vapidKey: "BG8ImWvoQYL1vnqyK915FQuESZS0cfTRWkittXWK8Zp0QNjPTms3kwnyA-Xje7IfsQxqDjdR25pqz7hFAWKkeYE",
    });
    console.log("[FCM] Token del dispositivo:", token);
  } catch (e) {
    console.error("[FCM] Error getToken:", e);
  }

  onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground:", payload);
    if (payload.notification && Notification.permission === "granted") {
      new Notification(payload.notification.title ?? "Mensaje", {
        body: payload.notification.body,
        icon: payload.notification.icon || "/icons/android-chrome-192x192.png",
        data: payload.data,
      });
    }
  });
}

function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setupFirebaseMessaging(); }, []);
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
