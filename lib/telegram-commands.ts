import { supabaseAdmin } from './supabase';
import { TelegramAPI } from './telegram-api';
import type { TelegramMessage, TelegramUser } from '../types/telegram';

export class TelegramBotCommands {
  private telegramApi: TelegramAPI;

  constructor(botToken: string) {
    this.telegramApi = new TelegramAPI(botToken);
  }

  async handleCommand(message: TelegramMessage): Promise<void> {
    if (!message.text) return;

    const chatId = message.chat.id;
    const text = message.text.trim();
    const command = text.split(' ')[0].toLowerCase();

    try {
      // Ensure user exists in database
      if (message.from) {
        await this.getOrCreateUser(message.from);
      }

      // Store the message
      await this.storeMessage(message);

      switch (command) {
        case '/start':
          await this.handleStartCommand(chatId, message.from);
          break;
        case '/help':
          await this.handleHelpCommand(chatId);
          break;
        case '/save':
          await this.handleSaveCommand(chatId, text, message.from);
          break;
        case '/list':
          await this.handleListCommand(chatId, message.from);
          break;
        case '/delete':
          await this.handleDeleteCommand(chatId, text, message.from);
          break;
        default:
          if (!text.startsWith('/')) {
            await this.handleTextMessage(chatId, text, message.from);
          } else {
            await this.telegramApi.sendMessage(
              chatId,
              'Unknown command. Use /help to see available commands.'
            );
          }
      }
    } catch (error) {
      console.error('Error handling command:', error);
      await this.telegramApi.sendMessage(
        chatId,
        'Sorry, something went wrong. Please try again later.'
      );
    }
  }

  private async getOrCreateUser(telegramUser: TelegramUser): Promise<string> {
    const { data, error } = await supabaseAdmin.rpc('get_or_create_telegram_user', {
      p_telegram_id: telegramUser.id,
      p_username: telegramUser.username || null,
      p_first_name: telegramUser.first_name,
      p_last_name: telegramUser.last_name || null,
      p_is_bot: telegramUser.is_bot,
      p_language_code: telegramUser.language_code || 'en',
    });

    if (error) {
      throw new Error(`Failed to create/get user: ${error.message}`);
    }

    return data;
  }

  private async storeMessage(message: TelegramMessage): Promise<void> {
    if (!message.from) return;

    // Get user ID from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('telegram_users')
      .select('id')
      .eq('telegram_id', message.from.id)
      .single();

    if (userError || !user) {
      console.error('Failed to find user for message storage:', userError);
      return;
    }

    const { error } = await supabaseAdmin.from('user_messages').insert({
      telegram_user_id: user.id,
      message_text: message.text || message.caption || null,
      message_type: message.photo ? 'photo' : message.document ? 'document' : 'text',
      telegram_message_id: message.message_id,
    });

    if (error) {
      console.error('Failed to store message:', error);
    }
  }

  private async handleStartCommand(chatId: number, user?: TelegramUser): Promise<void> {
    const welcomeMessage = `
🎉 Welcome to the Data Storage Bot!

Hello ${user?.first_name || 'there'}! I'm here to help you store and manage your data.

Available commands:
• /help - Show this help message
• /save <key> <value> - Save data with a key
• /list - View all your saved data
• /delete <key> - Delete specific data

You can also just send me any text and I'll store it as a note!

Let's get started! 🚀
    `.trim();

    await this.telegramApi.sendMessage(chatId, welcomeMessage);
  }

  private async handleHelpCommand(chatId: number): Promise<void> {
    const helpMessage = `
📖 **Available Commands:**

• **/start** - Get welcome message and setup
• **/help** - Show this help message
• **/save <key> <value>** - Save data with a specific key
  Example: \`/save email john@example.com\`
• **/list** - View all your saved data
• **/delete <key>** - Delete specific data by key

You can also send me any text message and I'll save it as a note automatically!

💡 **Tips:**
- Keys should be single words (no spaces)
- Use descriptive keys like 'email', 'phone', 'address'
- Data is private to your account only
    `.trim();

    await this.telegramApi.sendMessage(chatId, helpMessage, {
      parse_mode: 'Markdown',
    });
  }

  private async handleSaveCommand(chatId: number, text: string, user?: TelegramUser): Promise<void> {
    if (!user) {
      await this.telegramApi.sendMessage(chatId, 'User information not available.');
      return;
    }

    const parts = text.split(' ');
    if (parts.length < 3) {
      await this.telegramApi.sendMessage(
        chatId,
        'Please provide both a key and value.\nExample: `/save email john@example.com`',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const key = parts[1].toLowerCase();
    const value = parts.slice(2).join(' ');

    try {
      // Get user ID
      const { data: dbUser, error: userError } = await supabaseAdmin
        .from('telegram_users')
        .select('id')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !dbUser) {
        throw new Error('User not found in database');
      }

      // Check if key already exists
      const { data: existingData } = await supabaseAdmin
        .from('user_data')
        .select('id')
        .eq('telegram_user_id', dbUser.id)
        .eq('data_key', key)
        .single();

      if (existingData) {
        // Update existing data
        const { error: updateError } = await supabaseAdmin
          .from('user_data')
          .update({ data_value: value, updated_at: new Date().toISOString() })
          .eq('id', existingData.id);

        if (updateError) throw updateError;

        await this.telegramApi.sendMessage(
          chatId,
          `✅ Updated **${key}** with new value!`,
          { parse_mode: 'Markdown' }
        );
      } else {
        // Insert new data
        const { error: insertError } = await supabaseAdmin.from('user_data').insert({
          telegram_user_id: dbUser.id,
          data_key: key,
          data_value: value,
          data_type: 'custom',
        });

        if (insertError) throw insertError;

        await this.telegramApi.sendMessage(
          chatId,
          `✅ Saved **${key}**: ${value}`,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (error) {
      console.error('Error saving data:', error);
      await this.telegramApi.sendMessage(
        chatId,
        'Failed to save data. Please try again.'
      );
    }
  }

  private async handleListCommand(chatId: number, user?: TelegramUser): Promise<void> {
    if (!user) {
      await this.telegramApi.sendMessage(chatId, 'User information not available.');
      return;
    }

    try {
      // Get user ID
      const { data: dbUser, error: userError } = await supabaseAdmin
        .from('telegram_users')
        .select('id')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !dbUser) {
        throw new Error('User not found in database');
      }

      // Get all user data
      const { data: userData, error: dataError } = await supabaseAdmin
        .from('user_data')
        .select('data_key, data_value, data_type, created_at')
        .eq('telegram_user_id', dbUser.id)
        .order('created_at', { ascending: false });

      if (dataError) throw dataError;

      if (!userData || userData.length === 0) {
        await this.telegramApi.sendMessage(
          chatId,
          '📝 You have no saved data yet.\n\nUse `/save <key> <value>` to store some data!',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      let message = '📋 **Your Saved Data:**\n\n';
      userData.forEach((item, index) => {
        message += `${index + 1}. **${item.data_key}**: ${item.data_value}\n`;
      });

      message += `\n💾 Total items: ${userData.length}`;

      await this.telegramApi.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Error listing data:', error);
      await this.telegramApi.sendMessage(
        chatId,
        'Failed to retrieve data. Please try again.'
      );
    }
  }

  private async handleDeleteCommand(chatId: number, text: string, user?: TelegramUser): Promise<void> {
    if (!user) {
      await this.telegramApi.sendMessage(chatId, 'User information not available.');
      return;
    }

    const parts = text.split(' ');
    if (parts.length < 2) {
      await this.telegramApi.sendMessage(
        chatId,
        'Please specify the key to delete.\nExample: `/delete email`',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const key = parts[1].toLowerCase();

    try {
      // Get user ID
      const { data: dbUser, error: userError } = await supabaseAdmin
        .from('telegram_users')
        .select('id')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !dbUser) {
        throw new Error('User not found in database');
      }

      // Delete the data
      const { error: deleteError, count } = await supabaseAdmin
        .from('user_data')
        .delete()
        .eq('telegram_user_id', dbUser.id)
        .eq('data_key', key);

      if (deleteError) throw deleteError;

      if (count && count > 0) {
        await this.telegramApi.sendMessage(
          chatId,
          `🗑️ Deleted **${key}** successfully!`,
          { parse_mode: 'Markdown' }
        );
      } else {
        await this.telegramApi.sendMessage(
          chatId,
          `❌ No data found with key **${key}**`,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      await this.telegramApi.sendMessage(
        chatId,
        'Failed to delete data. Please try again.'
      );
    }
  }

  private async handleTextMessage(chatId: number, text: string, user?: TelegramUser): Promise<void> {
    if (!user) {
      await this.telegramApi.sendMessage(chatId, 'User information not available.');
      return;
    }

    try {
      // Get user ID
      const { data: dbUser, error: userError } = await supabaseAdmin
        .from('telegram_users')
        .select('id')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !dbUser) {
        throw new Error('User not found in database');
      }

      // Store as a note with timestamp key
      const timestamp = new Date().getTime();
      const key = `note_${timestamp}`;

      const { error: insertError } = await supabaseAdmin.from('user_data').insert({
        telegram_user_id: dbUser.id,
        data_key: key,
        data_value: text,
        data_type: 'note',
      });

      if (insertError) throw insertError;

      await this.telegramApi.sendMessage(
        chatId,
        `📝 Saved your note!\n\nUse /list to view all saved data.`
      );
    } catch (error) {
      console.error('Error saving text message:', error);
      await this.telegramApi.sendMessage(
        chatId,
        'Failed to save your message. Please try again.'
      );
    }
  }
}