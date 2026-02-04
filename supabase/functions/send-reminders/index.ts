import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Configuração do Firebase Cloud Messaging (precisa de Service Account)
// Para simplificar, vamos usar a API REST do FCM com a chave de servidor se disponível, 
// ou instruir o usuário a configurar as variáveis.
// NOTA: O envio seguro requer a chave privada do Service Account do Firebase, 
// que deve estar nas variáveis de ambiente da Edge Function.

interface Reminder {
  id: string
  user_id: string
  product_id: string
  reminder_time: string // HH:MM
  days_of_week: number[]
  products: {
    name: string
    instructions: string
  }
}

interface Profile {
  id: string
  fcm_token: string
}

serve(async (req: Request) => {
  // Criar cliente Supabase com chave de serviço (Service Role) para acessar todos os dados
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Pegar hora atual (Brasília - UTC-3)
  // Edge Functions rodam em UTC.
  const now = new Date()
  // Ajustar para horário local se necessário, ou assumir que reminder_time é UTC?
  // O app salva HH:MM local. Vamos assumir UTC-3 para o Brasil.
  const brTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  
  const currentHour = brTime.getUTCHours().toString().padStart(2, '0')
  const currentMinute = brTime.getUTCMinutes().toString().padStart(2, '0')
  const currentTime = `${currentHour}:${currentMinute}`
  const currentDayOfWeek = brTime.getUTCDay() // 0 = Domingo

  console.log(`Checking reminders for ${currentTime} (Day ${currentDayOfWeek})`)

  try {
    // 1. Buscar lembretes ativos para agora
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select(`
        *,
        products (
          name,
          instructions
        )
      `)
      .eq('is_active', true)
      .eq('reminder_time', currentTime)
      // .contains('days_of_week', [currentDayOfWeek]) // Array contains check
      
    if (remindersError) throw remindersError

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders for now' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Filtrar dias da semana manualmente se o filtro do banco falhar ou para garantir
    const activeReminders = reminders.filter((r: Reminder) => 
      r.days_of_week.includes(currentDayOfWeek)
    )

    if (activeReminders.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders for today' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Para cada lembrete, buscar o token do usuário e enviar notificação
    const results = []
    
    for (const reminder of activeReminders) {
      // Buscar token do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('id', reminder.user_id)
        .single()

      if (profile && profile.fcm_token) {
        // Enviar notificação via FCM
        const notification = {
          title: `Hora de usar ${reminder.products?.name || 'seu produto'}`,
          body: reminder.products?.instructions || 'Lembrete de saúde Equilibrium Vida',
          token: profile.fcm_token
        }
        
        // Aqui chamamos a API do FCM.
        // Como não temos o SDK Admin configurado totalmente (requer arquivo JSON de credenciais),
        // vamos tentar usar a API REST legada ou V1 se a chave estiver disponível.
        // SE o usuário forneceu a chave de servidor nas variáveis de ambiente.
        
        const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')
        
        if (fcmServerKey) {
          const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `key=${fcmServerKey}`
            },
            body: JSON.stringify({
              to: profile.fcm_token,
              notification: {
                title: notification.title,
                body: notification.body,
                icon: '/placeholder.svg'
              },
              data: {
                reminder_id: reminder.id,
                title: notification.title, // Backup para data-only
                body: notification.body,   // Backup para data-only
                url: '/dashboard'          // Para abrir ao clicar
              }
            })
          })
          
          const fcmResult = await fcmResponse.json()
          results.push({ reminder_id: reminder.id, success: true, fcm_result: fcmResult })
        } else {
          results.push({ reminder_id: reminder.id, success: false, error: 'FCM_SERVER_KEY not configured' })
          console.error('FCM_SERVER_KEY environment variable is missing')
        }
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
