import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { created_by, data, is_premium, order_type } = body;

    // Create new table
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .insert({
        created_by,
        data,
        is_premium: is_premium || false,
        order_type: order_type || 'sell_order',
        version_number: 1,
      })
      .select()
      .single();

    if (tableError) throw tableError;

    // Create initial version
    const { error: versionError } = await supabase
      .from('table_versions')
      .insert({
        table_id: table.id,
        version_number: 1,
        data,
      });

    if (versionError) {
      console.error('Version creation error:', versionError);
      throw versionError;
    }

    return NextResponse.json(table);
  } catch (error: any) {
    console.error('Table creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
