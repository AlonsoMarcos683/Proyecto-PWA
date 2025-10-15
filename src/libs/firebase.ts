import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, onMessage, getToken, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCXZF_-a96KdiLsYD-M3zw_aumy_TjbwdI",
  authDomain: "mypwama.firebaseapp.com",
  projectId: "mypwama",
  storageBucket: "mypwama.firebasestorage.app",
  messagingSenderId: "1050277525227",
  appId: "1:1050277525227:web:f41cd0f8d31ba2553970ae"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export function getMessagingSafe(): Messaging | null {
  try {
    if (!("serviceWorker" in navigator)) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
}

export { onMessage, getToken };
