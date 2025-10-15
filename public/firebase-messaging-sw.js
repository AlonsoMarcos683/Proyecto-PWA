
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCXZF_-a96KdiLsYD-M3zw_aumy_TjbwdI",
  authDomain: "mypwama.firebaseapp.com",
  projectId: "mypwama",
  storageBucket: "mypwama.firebasestorage.app",
  messagingSenderId: "1050277525227",
  appId: "1:1050277525227:web:f41cd0f8d31ba2553970ae"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Mensaje";
  const body  = payload.notification?.body  || "";
  const icon  = payload.notification?.icon  || "/icons/android-chrome-192x192.png";
  self.registration.showNotification(title, { body, icon, data: payload.data || {} });
});

self.addEventListener("notificationclick", (event) => {
  const url = event.notification?.data?.url || "/";
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((arr) => {
        const win = arr.find(w => w.url.startsWith(self.location.origin));
        return win ? win.focus() : clients.openWindow(url);
      })
  );
});
