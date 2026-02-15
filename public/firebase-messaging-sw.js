
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    apiKey: 'AIzaSyAHaRq5csdXspJ__F0aC3xK3SdQ0LWWqWU',
    authDomain: 'finzora-1ce5d.firebaseapp.com',
    projectId: 'finzora-1ce5d',
    storageBucket: 'finzora-1ce5d.firebasestorage.app',
    messagingSenderId: '337865929870',
    appId: '1:337865929870:web:29e807d3634485286dc5df',
    measurementId: 'G-YCK23VKJ83',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/placeholder.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
