importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCV9eE2gdrtH0R5xVTc6gIM6rqOEXCO_64",
  authDomain: "equilibriumvida-ecf03.firebaseapp.com",
  projectId: "equilibriumvida-ecf03",
  storageBucket: "equilibriumvida-ecf03.firebasestorage.app",
  messagingSenderId: "264460301321",
  appId: "1:264460301321:web:6e6f080dbc007520bff4d8",
  measurementId: "G-4BGSW1E42P"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Se o payload já tem uma notificação, o navegador geralmente exibe automaticamente.
  // No entanto, se quisermos forçar ou customizar, podemos fazer isso aqui.
  // IMPORTANTE: Se o payload tiver 'notification', o navegador exibe. Se tiver APENAS 'data', nós exibimos.
  
  if (payload.notification) {
    // O navegador já deve cuidar disso, mas logamos para debug.
    console.log('Background message has notification payload, browser should display it.');
    return; 
  }

  // Se for apenas dados, exibimos manualmente
  const notificationTitle = payload.data?.title || 'Nova Notificação';
  const notificationOptions = {
    body: payload.data?.body || 'Você tem uma nova mensagem.',
    icon: '/placeholder.svg', // Use um ícone que existe
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
