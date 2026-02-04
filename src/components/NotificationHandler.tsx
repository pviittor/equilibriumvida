import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/integrations/firebase/client';
import { toast } from 'sonner';
import { MessagePayload } from 'firebase/messaging';

export const NotificationHandler = () => {
  useEffect(() => {
    const initNotifications = async () => {
      const token = await requestForToken();
      if (token) {
        console.log('FCM Token:', token);
        // Aqui você pode enviar o token para o seu backend para salvar no perfil do usuário
      }
    };

    initNotifications();

    const unsubscribe = onMessageListener((payload: MessagePayload) => {
      console.log('Mensagem recebida em primeiro plano:', payload);
      toast(payload.notification?.title || 'Nova Notificação', {
        description: payload.notification?.body,
      });
    });


    return () => {
      // Cleanup subscription if needed (onMessage returns an unsubscribe function)
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return null;
};
