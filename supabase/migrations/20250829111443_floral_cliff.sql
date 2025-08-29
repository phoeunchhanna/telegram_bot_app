/*
  # Telegram Bot Database Schema

  1. New Tables
    - `telegram_users`
      - `id` (uuid, primary key)
      - `telegram_id` (bigint, unique) - Telegram user ID
      - `username` (text) - Telegram username
      - `first_name` (text) - User's first name
      - `last_name` (text) - User's last name
      - `is_bot` (boolean) - Whether user is a bot
      - `language_code` (text) - User's language code
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_messages`
      - `id` (uuid, primary key)
      - `telegram_user_id` (uuid, foreign key)
      - `message_text` (text) - The actual message content
      - `message_type` (text) - Type of message (text, photo, document, etc.)
      - `telegram_message_id` (bigint) - Telegram's message ID
      - `created_at` (timestamp)
    
    - `user_data`
      - `id` (uuid, primary key)
      - `telegram_user_id` (uuid, foreign key)
      - `data_key` (text) - Key for the stored data
      - `data_value` (text) - Value of the stored data
      - `data_type` (text) - Type of data (note, contact, reminder, etc.)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Add indexes for performance

  3. Functions
    - Function to get or create telegram user
    - Triggers for updated_at timestamps
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create telegram_users table
CREATE TABLE IF NOT EXISTS telegram_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE NOT NULL,
  username text,
  first_name text,
  last_name text,
  is_bot boolean DEFAULT false,
  language_code text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_messages table
CREATE TABLE IF NOT EXISTS user_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id uuid REFERENCES telegram_users(id) ON DELETE CASCADE,
  message_text text,
  message_type text DEFAULT 'text',
  telegram_message_id bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_data table
CREATE TABLE IF NOT EXISTS user_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id uuid REFERENCES telegram_users(id) ON DELETE CASCADE,
  data_key text NOT NULL,
  data_value text NOT NULL,
  data_type text DEFAULT 'note',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policies for telegram_users table
CREATE POLICY "Allow service role full access to telegram_users"
  ON telegram_users
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for user_messages table
CREATE POLICY "Allow service role full access to user_messages"
  ON user_messages
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for user_data table
CREATE POLICY "Allow service role full access to user_data"
  ON user_data
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_id ON telegram_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_telegram_user_id ON user_messages(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_data_telegram_user_id ON user_data(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_data_key ON user_data(data_key);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_telegram_users_updated_at 
  BEFORE UPDATE ON telegram_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_data_updated_at 
  BEFORE UPDATE ON user_data 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get or create telegram user
CREATE OR REPLACE FUNCTION get_or_create_telegram_user(
  p_telegram_id bigint,
  p_username text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_is_bot boolean DEFAULT false,
  p_language_code text DEFAULT 'en'
)
RETURNS uuid AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Try to get existing user
  SELECT id INTO user_uuid 
  FROM telegram_users 
  WHERE telegram_id = p_telegram_id;
  
  -- If user doesn't exist, create them
  IF user_uuid IS NULL THEN
    INSERT INTO telegram_users (
      telegram_id, username, first_name, last_name, is_bot, language_code
    ) VALUES (
      p_telegram_id, p_username, p_first_name, p_last_name, p_is_bot, p_language_code
    ) RETURNING id INTO user_uuid;
  ELSE
    -- Update existing user info
    UPDATE telegram_users 
    SET 
      username = COALESCE(p_username, username),
      first_name = COALESCE(p_first_name, first_name),
      last_name = COALESCE(p_last_name, last_name),
      updated_at = now()
    WHERE id = user_uuid;
  END IF;
  
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;