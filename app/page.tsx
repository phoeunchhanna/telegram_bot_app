'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Database, MessageCircle, Users, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

export default function Home() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBotInfo = async () => {
    try {
      const response = await fetch('/api/telegram/setup');
      if (response.ok) {
        const data = await response.json();
        setBotInfo(data.bot);
      }
    } catch (error) {
      console.error('Failed to fetch bot info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotInfo();
  }, []);

  const features = [
    {
      icon: <Bot className="h-8 w-8 text-blue-500" />,
      title: 'Telegram Bot Integration',
      description: 'Full-featured Telegram bot with command handling and webhook support',
    },
    {
      icon: <Database className="h-8 w-8 text-green-500" />,
      title: 'Database Storage',
      description: 'Secure data storage with Supabase and automatic user management',
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-purple-500" />,
      title: 'Message Processing',
      description: 'Handle text messages, commands, and store user interactions',
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: 'User Management',
      description: 'Automatic user registration and profile management',
    },
  ];

  const commands = [
    { command: '/start', description: 'Initialize bot and get welcome message' },
    { command: '/help', description: 'Show available commands and usage' },
    { command: '/save <key> <value>', description: 'Save data with a specific key' },
    { command: '/list', description: 'List all saved data entries' },
    { command: '/delete <key>', description: 'Delete specific data by key' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <Bot className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Telegram Bot Data Store
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A powerful Next.js application that creates a Telegram bot capable of storing and managing user data 
            with a beautiful dashboard interface.
          </p>

          <div className="flex justify-center gap-4 mt-8">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                View Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {botInfo && (
              <a 
                href={`https://t.me/${botInfo.username}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline">
                  Chat with Bot
                  <MessageCircle className="ml-2 h-5 w-5" />
                </Button>
              </a>
            )}
          </div>

          {/* Bot Status */}
          {!loading && (
            <div className="flex justify-center mt-6">
              {botInfo ? (
                <Badge variant="default" className="bg-green-500 text-white px-4 py-2">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Bot Active: @{botInfo.username}
                </Badge>
              ) : (
                <Badge variant="destructive" className="px-4 py-2">
                  Bot Not Configured
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commands Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Bot Commands
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Commands</CardTitle>
              <CardDescription>
                Commands your Telegram bot can handle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commands.map((cmd, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <code className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-mono text-sm">
                      {cmd.command}
                    </code>
                    <span className="text-gray-600">{cmd.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Setup Instructions */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Setup Instructions
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Setup Guide</CardTitle>
              <CardDescription>
                Follow these steps to get your bot running
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Telegram Bot</h3>
                    <p className="text-gray-600">
                      Message @BotFather on Telegram and use /newbot to create your bot
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Configure Environment</h3>
                    <p className="text-gray-600">
                      Set up your .env.local file with bot token and Supabase credentials
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Setup Database</h3>
                    <p className="text-gray-600">
                      Connect to Supabase and run the database migrations
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold">Set Webhook</h3>
                    <p className="text-gray-600">
                      Use the dashboard to configure your webhook URL and start receiving messages
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}