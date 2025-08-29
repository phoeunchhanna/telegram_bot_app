const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

export class TelegramAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getApiUrl(method: string): string {
    return `${TELEGRAM_API_URL}${this.token}/${method}`;
  }

  async sendMessage(
    chatId: number,
    text: string,
    options: {
      parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      reply_markup?: any;
    } = {}
  ) {
    const response = await fetch(this.getApiUrl('sendMessage'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telegram API error: ${error}`);
    }

    return response.json();
  }

  async setWebhook(webhookUrl: string) {
    const response = await fetch(this.getApiUrl('setWebhook'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to set webhook: ${error}`);
    }

    return response.json();
  }

  async getMe() {
    const response = await fetch(this.getApiUrl('getMe'));
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get bot info: ${error}`);
    }

    return response.json();
  }

  async deleteWebhook() {
    const response = await fetch(this.getApiUrl('deleteWebhook'), {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete webhook: ${error}`);
    }

    return response.json();
  }
}