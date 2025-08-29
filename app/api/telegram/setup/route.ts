import { NextRequest, NextResponse } from 'next/server';
import { TelegramAPI } from '../../../../lib/telegram-api';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
}

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl } = await req.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'webhookUrl is required' },
        { status: 400 }
      );
    }

    const telegramApi = new TelegramAPI(BOT_TOKEN);
    
    // Set webhook
    const result = await telegramApi.setWebhook(webhookUrl);
    
    // Get bot info
    const botInfo = await telegramApi.getMe();

    return NextResponse.json({
      success: true,
      webhook: result,
      bot: botInfo.result,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const telegramApi = new TelegramAPI(BOT_TOKEN);
    const botInfo = await telegramApi.getMe();

    return NextResponse.json({
      bot: botInfo.result,
      webhook_url: process.env.TELEGRAM_WEBHOOK_URL || 'Not configured',
    });
  } catch (error) {
    console.error('Get bot info error:', error);
    return NextResponse.json(
      { error: 'Failed to get bot info' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const telegramApi = new TelegramAPI(BOT_TOKEN);
    const result = await telegramApi.deleteWebhook();

    return NextResponse.json({
      success: true,
      result: result,
    });
  } catch (error) {
    console.error('Delete webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}