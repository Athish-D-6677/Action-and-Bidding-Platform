importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyC20MmTitMfZEwW81__niRE8dfgj6gz3us',
  authDomain:        'action-and-bidding-platform.firebaseapp.com',
  projectId:         'action-and-bidding-platform',
  storageBucket:     'action-and-bidding-platform.firebasestorage.app',
  messagingSenderId: '896119664289',
  appId:             '1:896119664289:web:4421cf129d35cedacf8ae0',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title = 'Paddle & Post', body = '' } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data,
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
