import { NextResponse } from 'next/server';
import { supabase, isSandbox } from '@/lib/supabase';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;

    if (isSandbox()) {
      console.log(`GET /api/project/${id} in Sandbox Mode`);
      return NextResponse.json({ success: true, project: null });
    }

    // Real DB flow: fetch project, scenes, and subtitles nested
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        scenes (
          *,
          subtitles (
            id,
            scene_id,
            start_time,
            end_time,
            text
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching project ${id}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map database snake_case keys or keep nested structure as is
    // Let's format it for frontend consumption
    const formattedScenes = data.scenes
      ? data.scenes
          .map((scene: any) => ({
            id: scene.id,
            projectId: scene.project_id,
            sceneNumber: scene.scene_number,
            title: scene.title,
            narration: scene.narration,
            mediaUrl: scene.media_url,
            mediaType: scene.media_type,
            thumbnail: scene.thumbnail,
            audioUrl: scene.audio_url,
            duration: parseFloat(scene.duration),
            subtitles: scene.subtitles
              ? scene.subtitles.map((sub: any) => ({
                  id: sub.id,
                  sceneId: sub.scene_id,
                  start: parseFloat(sub.start_time),
                  end: parseFloat(sub.end_time),
                  text: sub.text
                }))
              : []
          }))
          .sort((a: any, b: any) => a.sceneNumber - b.sceneNumber)
      : [];

    const formattedProject = {
      id: data.id,
      title: data.title,
      script: data.script,
      videoStyle: data.video_style,
      voice: data.voice,
      aspectRatio: data.aspect_ratio,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      scenes: formattedScenes
    };

    return NextResponse.json({ success: true, project: formattedProject });
  } catch (error: any) {
    console.error('Project details API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;

    if (isSandbox()) {
      console.log(`DELETE /api/project/${id} in Sandbox Mode`);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting project ${id}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Project delete API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
