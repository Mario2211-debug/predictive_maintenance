import axios from 'axios';

export const sendTelegramAlert = async (message: string) => {
  const TOKEN = 'TOKEN';
  const CHAT_ID = 'CHAT_ID'; // ex. -4767925581
  const TELEGRAM_API_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  try {
    const response = await axios.post(TELEGRAM_API_URL, {
      chat_id: CHAT_ID,
      text: message,
    });

    if (response.data.ok) {
      console.log('Mensagem enviada com sucesso:', response.data.result);
    } else {
      console.error('Falha ao enviar mensagem:', response.data);
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
};
