import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { sendPushNotification } from '@/lib/webpush';
import { getNotificationPreferences } from '@/services/notification-service';

// Rota para enviar notificações push
export async function POST(request: NextRequest) {
  try {
    // Verificar autorização (em produção, use um token de API ou autenticação adequada)
    const authHeader = request.headers.get('authorization');
    if (!process.env.API_SECRET_KEY || !authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      parishId, 
      title, 
      body, 
      type = 'announcement', 
      image, 
      url, 
      userIds = [] 
    } = await request.json();

    if (!parishId || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Se userIds estiver vazio, enviar para todos os usuários da paróquia
    let targetUserIds: string[] = userIds;
    
    if (targetUserIds.length === 0) {
      // Buscar todos os usuários da paróquia
      const parishUsersRef = ref(database, 'parishUsers');
      const parishUsersSnapshot = await get(parishUsersRef);
      
      if (parishUsersSnapshot.exists()) {
        const parishUsers = parishUsersSnapshot.val();
        targetUserIds = Object.keys(parishUsers).filter(
          userId => parishUsers[userId].parishId === parishId
        );
      }
    }

    // Contador de notificações enviadas
    let sentCount = 0;
    let failedCount = 0;
    
    // Enviar notificações para cada usuário
    const sendPromises = targetUserIds.map(async (userId) => {
      try {
        // Verificar preferências do usuário
        const preferences = await getNotificationPreferences(userId);
        
        // Verificar se o usuário quer receber este tipo de notificação
        if (!preferences?.pushEnabled || 
            (type === 'announcement' && !preferences.notificationTypes.announcements) ||
            (type === 'event' && !preferences.notificationTypes.events) ||
            (type === 'alert' && !preferences.notificationTypes.alerts) ||
            (type === 'update' && !preferences.notificationTypes.updates)) {
          return;
        }
        
        // Buscar inscrições de push do usuário
        const subscriptionsRef = ref(database, `pushSubscriptions/${userId}`);
        const subscriptionsSnapshot = await get(subscriptionsRef);
        
        if (!subscriptionsSnapshot.exists()) {
          return;
        }
        
        const subscriptions = subscriptionsSnapshot.val();
        
        // Enviar para cada dispositivo inscrito
        const devicePromises = Object.values(subscriptions).map(async (sub: { subscription: PushSubscription }) => {
          try {
            await sendPushNotification(sub.subscription, {
              title,
              body,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/badge-72x72.png',
              image,
              data: {
                url,
                type,
                parishId,
              },
            });
            sentCount++;
          } catch (error) {
            console.error(`Error sending to device for user ${userId}:`, error);
            failedCount++;
          }
        });
        
        await Promise.all(devicePromises);
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        failedCount++;
      }
    });
    
    await Promise.all(sendPromises);
    
    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: targetUserIds.length,
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
