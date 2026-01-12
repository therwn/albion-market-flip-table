import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { data, is_premium, order_type } = body;

    // Get current table to increment version
    const { data: currentTable, error: fetchError } = await supabase
      .from('tables')
      .select('version_number')
      .eq('id', params.id)
      .single();

    if (fetchError) throw fetchError;

    const newVersionNumber = (currentTable?.version_number || 0) + 1;

    // Update table
    const { data: updatedTable, error: updateError } = await supabase
      .from('tables')
      .update({
        data,
        is_premium: is_premium,
        order_type: order_type,
        version_number: newVersionNumber,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create new version
    const { error: versionError } = await supabase
      .from('table_versions')
      .insert({
        table_id: params.id,
        version_number: newVersionNumber,
        data,
      });

    if (versionError) throw versionError;

    return NextResponse.json(updatedTable);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
