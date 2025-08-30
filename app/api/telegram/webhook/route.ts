import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotCommands } from '../../../../lib/telegram-commands';
import type { TelegramUpdate } from '../../../../types/telegram';

// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_TOKEN:string = process.env.TELEGRAM_BOT_TOKEN as string;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;


if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret if provided
    if (WEBHOOK_SECRET) {
      const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
      if (secretHeader !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const update: TelegramUpdate = await req.json();
    
    // Log the update for debugging (remove in production)
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // Handle message updates
    if (update.message) {
      const botCommands = new TelegramBotCommands(BOT_TOKEN!);
      await botCommands.handleCommand(update.message);
    }

    // Handle edited messages
    if (update.edited_message) {
      const botCommands = new TelegramBotCommands(BOT_TOKEN!);
      await botCommands.handleCommand(update.edited_message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    status: 'Telegram webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}