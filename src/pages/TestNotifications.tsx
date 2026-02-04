import { useState, useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/integrations/firebase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MessagePayload } from 'firebase/messaging';

const TestNotifications = () => {
  const [token, setToken] = useState<string>('');
  const [lastMessage, setLastMessage] = useState<MessagePayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Configurar listener para mensagens em foreground
    const unsubscribe = onMessageListener((payload) => {
      setLastMessage(payload);
      toast('Notificação Recebida!', {
        description: payload.notification?.body,
      });
    });

    return () => {
      unsubscribe(); // O onMessageListener retorna uma função que chama o unsubscribe do firebase
    };
  }, []);

  const handleGetToken = async () => {
    setLoading(true);
    try {
      const currentToken = await requestForToken();
      if (currentToken) {
        setToken(currentToken);
        toast.success('Token recuperado com sucesso!');
      } else {
        toast.error('Não foi possível obter o token. Verifique as permissões.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao recuperar token.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    toast.success('Token copiado para a área de transferência!');
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Notificações FCM</CardTitle>
          <CardDescription>
            Use esta página para obter seu token FCM e testar o recebimento de notificações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">1. Obter Token do Dispositivo</h3>
            <div className="flex gap-2">
              <Input 
                value={token} 
                readOnly 
                placeholder="Clique em 'Gerar Token' para ver seu FCM Token" 
                className="font-mono text-sm"
              />
              <Button onClick={copyToClipboard} disabled={!token} variant="outline">
                Copiar
              </Button>
            </div>
            <Button onClick={handleGetToken} disabled={loading} className="w-full">
              {loading ? 'Obtendo Token...' : 'Gerar/Atualizar Token'}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">2. Como Testar</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Copie o token acima.</li>
              <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Console do Firebase</a>.</li>
              <li>Vá em <strong>Engajamento {'>'} Messaging</strong>.</li>
              <li>Crie uma nova campanha de notificação.</li>
              <li>Preencha o título e texto.</li>
              <li>No passo de segmentação, escolha <strong>Enviar mensagem de teste</strong>.</li>
              <li>Cole o token copiado e clique em <strong>Testar</strong>.</li>
            </ol>
          </div>

          {lastMessage && (
            <div className="p-4 bg-muted rounded-lg border">
              <h3 className="font-medium mb-2">Última Mensagem Recebida (Foreground):</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(lastMessage, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestNotifications;
