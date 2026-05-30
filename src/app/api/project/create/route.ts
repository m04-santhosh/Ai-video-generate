import { NextResponse } from 'next/server';
import { supabase, isSandbox } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { title, script, videoStyle, voice, aspectRatio, userId } = await request.json();

    if (!title || !script) {
      return NextResponse.json({ error: 'Title and script are required' }, { status: 400 });
    }

    if (isSandbox()) {
      console.log('API /project/create running in Sandbox Mode');
      const mockProject = {
        id: crypto.randomUUID(),
        title,
        script,
        video_style: videoStyle || 'Corporate',
        voice: voice || '21m00Tcm4TlvDq8ikWAM',
        aspect_ratio: aspectRatio || '16:9',
        status: 'Draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return NextResponse.json({ success: true, project: mockProject });
    }

    // Real Supabase insertion
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        script,
        video_style: videoStyle,
        voice,
        aspect_ratio: aspectRatio,
        user_id: userId,
        status: 'Draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting project into database:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: data });
  } catch (error: any) {
    console.error('Project create API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
