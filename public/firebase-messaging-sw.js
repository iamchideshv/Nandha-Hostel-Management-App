// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId
firebase.initializeApp({
    apiKey: "AIzaSyAr7R22If2_bEZYMmnVAkL-jAz8DEv_hsA",
    authDomain: "nandhablog-d4681.firebaseapp.com",
    projectId: "nandhablog-d4681",
    storageBucket: "nandhablog-d4681.firebasestorage.app",
    messagingSenderId: "570554601646",
    appId: "1:570554601646:web:586201fe923e240e515d3f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
