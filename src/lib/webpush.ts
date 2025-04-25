import webpush from 'web-push';

// Configuração das chaves VAPID para Web Push
// Estas chaves devem ser geradas uma vez e armazenadas como variáveis de ambiente
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

// Configurar o web-push com as chaves VAPID
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'agensoftwere@gmail.com', // Email de contato para o serviço Web Push
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Função para enviar notificação push para uma inscrição específica
export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    data?: Record<string, unknown>;
  }
) {
  try {
    // Formatar a payload para o formato esperado pelo navegador
    const notificationPayload = JSON.stringify({
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        image: payload.image,
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1,
          ...payload.data,
        },
      },
    });

    // Enviar a notificação push
    return await webpush.sendNotification(subscription, notificationPayload);
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error);
    throw error;
  }
}

// Função para gerar chaves VAPID (use apenas uma vez para gerar as chaves)
export function generateVAPIDKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  return {
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey,
  };
}

// Função para obter a chave pública VAPID (para o cliente)
export function getVAPIDPublicKey() {
  return vapidPublicKey;
}
