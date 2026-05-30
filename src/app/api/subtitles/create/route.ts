import { NextResponse } from 'next/server';
import { alignSubtitles } from '@/lib/subtitles';

export async function POST(request: Request) {
  try {
    const { text, duration } = await request.json();

    if (!text || duration === undefined) {
      return NextResponse.json({ error: 'Text and duration are required' }, { status: 400 });
    }

    console.log(`Subtitles create API triggered (Duration: ${duration}s)`);
    const subtitles = alignSubtitles(text, duration);

    return NextResponse.json({ success: true, subtitles });
  } catch (error: any) {
    console.error('Subtitles create API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
