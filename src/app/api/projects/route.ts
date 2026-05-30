import { NextResponse } from 'next/server';
import { supabase, isSandbox } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (isSandbox()) {
      console.log('GET /api/projects in Sandbox Mode');
      // In Sandbox mode, we return an empty array by default, but the frontend will manage it in localStorage.
      // This allows persisting projects in the browser during sandbox testing.
      return NextResponse.json({ success: true, projects: [] });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, projects: data });
  } catch (error: any) {
    console.error('Projects list API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
