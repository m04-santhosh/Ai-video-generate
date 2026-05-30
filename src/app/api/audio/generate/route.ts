import { NextResponse } from 'next/server';
import { generateSpeech, isElevenLabsSandbox } from '@/lib/elevenlabs';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  let text = '';
  try {
    const body = await request.json();
    text = body.text || '';
    const voiceId = body.voiceId;

    if (!text) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    console.log(`Generating speech for voice ID: ${voiceId}`);
    
    // Call the Speech Generation Helper
    const result = await generateSpeech(text, voiceId);

    // If sandbox mode is active, it returns a mock SoundHelix URL
    if (isElevenLabsSandbox() || result.audioUrl.startsWith('http')) {
      return NextResponse.json({
        success: true,
        audioUrl: result.audioUrl,
        duration: result.duration
      });
    }

    // In a real flow, write the audio buffer to the public folder
    const xiKey = process.env.ELEVENLABS_API_KEY || '';
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': xiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1'
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS raw request failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to public directory
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const filename = `voice-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    const filepath = path.join(audioDir, filename);
    fs.writeFileSync(filepath, buffer);

    const audioUrl = `/audio/${filename}`;

    return NextResponse.json({
      success: true,
      audioUrl,
      duration: result.duration
    });
  } catch (error: any) {
    console.error('Audio generate API error:', error);
    // Graceful fallback to sandbox test file
    return NextResponse.json({
      success: true,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: Math.max(3, parseFloat((text.split(/\s+/).length / 2.5).toFixed(1)))
    });
  }
}
