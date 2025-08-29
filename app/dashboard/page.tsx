'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Bot, Users, Database, Settings } from 'lucide-react';

interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

interface TelegramUser {
  id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  user_data: any[];
  user_messages: any[];
}

export default function Dashboard() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBotInfo = async () => {
    try {
      const response = await fetch('/api/telegram/setup');
      const data = await response.json();
      setBotInfo(data.bot);
    } catch (error) {
      console.error('Failed to fetch bot info:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const setupWebhook = async () => {
    if (!webhookUrl) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      
      if (response.ok) {
        alert('Webhook set successfully!');
        fetchBotInfo();
      } else {
        alert('Failed to set webhook');
      }
    } catch (error) {
      alert('Error setting webhook');
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/setup', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Webhook deleted successfully!');
        fetchBotInfo();
      } else {
        alert('Failed to delete webhook');
      }
    } catch (error) {
      alert('Error deleting webhook');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotInfo();
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Telegram Bot Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor and manage your Telegram bot and user data
          </p>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {botInfo ? (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  {botInfo && (
                    <p className="text-xs text-muted-foreground mt-2">
                      @{botInfo.username}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered bot users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Entries</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.reduce((acc, user) => acc + user.user_data.length, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stored data entries
                  </p>
                </CardContent>
              </Card>
            </div>

            {botInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Bot Information</CardTitle>
                  <CardDescription>
                    Current bot configuration and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Bot Name:</strong> {botInfo.first_name}
                    </div>
                    <div>
                      <strong>Username:</strong> @{botInfo.username}
                    </div>
                    <div>
                      <strong>Bot ID:</strong> {botInfo.id}
                    </div>
                    <div>
                      <strong>Is Bot:</strong> {botInfo.is_bot ? 'Yes' : 'No'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Users</h2>
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {user.first_name} {user.last_name}
                        {user.username && <span className="text-sm text-gray-500 ml-2">@{user.username}</span>}
                      </span>
                      <Badge variant="secondary">
                        ID: {user.telegram_id}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Messages:</strong> {user.user_messages.length}
                      </div>
                      <div>
                        <strong>Data Entries:</strong> {user.user_data.length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <h2 className="text-2xl font-bold">Stored Data</h2>
            
            <div className="space-y-4">
              {users.map((user) => (
                user.user_data.length > 0 && (
                  <Card key={user.id}>
                    <CardHeader>
                      <CardTitle>
                        {user.first_name} {user.last_name}
                        {user.username && <span className="text-sm text-gray-500 ml-2">@{user.username}</span>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {user.user_data.map((data: any) => (
                          <div key={data.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <strong>{data.data_key}:</strong> {data.data_value}
                              <Badge variant="outline" className="ml-2">
                                {data.data_type}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(data.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Set up or modify the Telegram webhook URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://yourdomain.com/api/telegram/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <Button onClick={setupWebhook} disabled={loading}>
                    {loading ? 'Setting...' : 'Set Webhook'}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={deleteWebhook} disabled={loading}>
                    Delete Webhook
                  </Button>
                  <Button variant="outline" onClick={fetchBotInfo}>
                    Check Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>
                  Required environment variables for the bot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm font-mono">
                  <div>TELEGRAM_BOT_TOKEN=your_bot_token_here</div>
                  <div>TELEGRAM_WEBHOOK_SECRET=your_secret_here (optional)</div>
                  <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=your_service_role_key</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}