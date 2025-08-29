import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function GET() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('telegram_users')
      .select(`
        id,
        telegram_id,
        username,
        first_name,
        last_name,
        created_at,
        user_data (
          id,
          data_key,
          data_value,
          data_type,
          created_at
        ),
        user_messages (
          id,
          message_text,
          message_type,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      users,
      count: users?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}