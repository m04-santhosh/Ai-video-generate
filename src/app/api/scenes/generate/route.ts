import { NextResponse } from 'next/server';
import { supabase, isSandbox } from '@/lib/supabase';
import { searchVisuals } from '@/lib/pexels';
import { generateSpeech } from '@/lib/elevenlabs';
import { alignSubtitles } from '@/lib/subtitles';

export async function POST(request: Request) {
  try {
    const { projectId, scenes, voiceId, videoStyle } = await request.json();

    if (!projectId || !scenes || !Array.isArray(scenes)) {
      return NextResponse.json({ error: 'Project ID and scenes array are required' }, { status: 400 });
    }

    console.log(`Generating visual, audio and subtitle assets for Project ID: ${projectId}`);
    const generatedScenes = [];

    for (const rawScene of scenes) {
      // 1. Search Visual Media
      const visual = await searchVisuals(rawScene.visualKeywords, videoStyle, rawScene.sceneNumber);

      // 2. Generate Narration Audio
      const speech = await generateSpeech(rawScene.narration, voiceId);

      // 3. Align Subtitles
      const subtitles = alignSubtitles(rawScene.narration, speech.duration);

      const sceneId = crypto.randomUUID();

      const processedScene = {
        id: isSandbox() ? sceneId : undefined,
        projectId,
        sceneNumber: rawScene.sceneNumber,
        title: rawScene.title,
        narration: rawScene.narration,
        mediaUrl: visual.mediaUrl,
        mediaType: visual.mediaType,
        thumbnail: visual.thumbnail,
        audioUrl: speech.audioUrl,
        duration: speech.duration,
        subtitles
      };

      generatedScenes.push(processedScene);
    }

    if (isSandbox()) {
      console.log('Orchestrator finished in Sandbox Mode');
      // Update project status to Completed
      return NextResponse.json({ success: true, scenes: generatedScenes });
    }

    // Real Supabase flow:
    // 1. Insert scenes
    for (const sc of generatedScenes) {
      const { data: sceneData, error: sceneError } = await supabase
        .from('scenes')
        .insert({
          project_id: projectId,
          scene_number: sc.sceneNumber,
          title: sc.title,
          narration: sc.narration,
          media_url: sc.mediaUrl,
          media_type: sc.mediaType,
          thumbnail: sc.thumbnail,
          audio_url: sc.audioUrl,
          duration: sc.duration
        })
        .select()
        .single();

      if (sceneError) {
        console.error('Error inserting scene into DB:', sceneError);
        return NextResponse.json({ error: sceneError.message }, { status: 500 });
      }

      // 2. Insert subtitles for this scene
      if (sc.subtitles && sc.subtitles.length > 0) {
        const subtitleRows = sc.subtitles.map((sub) => ({
          scene_id: sceneData.id,
          start_time: sub.start,
          end_time: sub.end,
          text: sub.text
        }));

        const { error: subError } = await supabase
          .from('subtitles')
          .insert(subtitleRows);

        if (subError) {
          console.error('Error inserting subtitles into DB:', subError);
        }
      }
    }

    // Update project status to Completed in real DB
    await supabase
      .from('projects')
      .update({ status: 'Completed', updated_at: new Date().toISOString() })
      .eq('id', projectId);

    return NextResponse.json({ success: true, scenes: generatedScenes });
  } catch (error: any) {
    console.error('Scenes generate API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
