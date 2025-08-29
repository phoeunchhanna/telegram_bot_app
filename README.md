# Telegram Bot Data Store

A comprehensive Next.js application that creates a Telegram bot capable of storing and managing user data with a beautiful dashboard interface.

## Features

- 🤖 **Telegram Bot Integration**: Full webhook support with command handling
- 💾 **Database Storage**: Secure data storage with Supabase
- 👥 **User Management**: Automatic user registration and profile management
- 📊 **Admin Dashboard**: Beautiful web interface to monitor bot activity
- 🔐 **Security**: Row-level security and proper authentication
- 📱 **Responsive Design**: Works perfectly on desktop and mobile

## Bot Commands

- `/start` - Initialize bot and get welcome message
- `/help` - Show available commands and usage
- `/save <key> <value>` - Save data with a specific key
- `/list` - List all saved data entries
- `/delete <key>` - Delete specific data by key

You can also send any text message and it will be automatically saved as a note!

## Setup Instructions

### 1. Create Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided by BotFather

### 2. Setup Supabase Database

1. Create a new project on [Supabase](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Run the migration file to create the database schema

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_optional_webhook_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Setup Webhook

1. Deploy your application or run it locally with ngrok for testing
2. Go to the dashboard at `/dashboard`
3. Navigate to the "Settings" tab
4. Enter your webhook URL: `https://yourdomain.com/api/telegram/webhook`
5. Click "Set Webhook"

### 5. Test Your Bot

1. Find your bot on Telegram using the username you created
2. Send `/start` to begin interacting
3. Try commands like `/save email john@example.com`
4. Check the dashboard to see stored data

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## API Endpoints

- `POST /api/telegram/webhook` - Handles incoming Telegram messages
- `GET/POST/DELETE /api/telegram/setup` - Bot configuration management
- `GET /api/admin/users` - Retrieve all users and their data

## Database Schema

The application uses three main tables:

- **telegram_users**: Store Telegram user information
- **user_messages**: Store all messages sent to the bot
- **user_data**: Store custom key-value data for each user

## Security

- Row Level Security (RLS) enabled on all tables
- Service role authentication for bot operations
- Optional webhook secret verification
- Proper input validation and sanitization

## Deployment

This application can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- Railway
- Your own server

Make sure to set the environment variables in your deployment platform.

## Troubleshooting

### Bot not responding
- Check if TELEGRAM_BOT_TOKEN is correct
- Verify webhook is set properly
- Check deployment logs for errors

### Database connection issues
- Verify Supabase credentials
- Ensure database migrations have been run
- Check RLS policies are properly configured

### Webhook not working
- Ensure your domain has HTTPS
- Check if webhook URL is accessible publicly
- Verify webhook secret if using one

## Support

If you encounter any issues, please check the console logs and ensure all environment variables are properly configured.