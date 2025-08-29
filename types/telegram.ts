export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  caption?: string;
  photo?: any[];
  document?: any;
  voice?: any;
  video?: any;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: any;
}

export interface TelegramWebhookResponse {
  method: string;
  chat_id: number;
  text?: string;
  reply_markup?: any;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

// Database types
export interface DatabaseTelegramUser {
  id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_bot: boolean;
  language_code?: string;
  created_at: string;
  updated_at: string;
}

export interface UserMessage {
  id: string;
  telegram_user_id: string;
  message_text?: string;
  message_type: string;
  telegram_message_id: number;
  created_at: string;
}

export interface UserData {
  id: string;
  telegram_user_id: string;
  data_key: string;
  data_value: string;
  data_type: string;
  created_at: string;
  updated_at: string;
}