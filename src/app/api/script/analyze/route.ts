import { NextResponse } from 'next/server';
import { analyzeScript } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const { script } = await request.json();

    if (!script) {
      return NextResponse.json({ error: 'Script text is required' }, { status: 400 });
    }

    console.log('API /script/analyze received request');
    const scenes = await analyzeScript(script);

    return NextResponse.json({ success: true, scenes });
  } catch (error: any) {
    console.error('Script analyze API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
