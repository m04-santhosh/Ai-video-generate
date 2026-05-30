import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';

export const isOpenAISandbox = () => {
  return !apiKey || apiKey.includes('mock');
};

const openai = !isOpenAISandbox() ? new OpenAI({ apiKey }) : null;

export interface SceneData {
  sceneNumber: number;
  title: string;
  narration: string;
  visualKeywords: string[];
}

function extractKeywords(sentence: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with',
    'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
    'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
    'should', 'now', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did',
    'helping', 'helps', 'empowers', 'pinpoint', 'analyze', 'analyzing', 'us', 'we', 'our'
  ]);
  
  const words = sentence
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  
  const uniqueWords = Array.from(new Set(words)).slice(0, 3);
  return uniqueWords.length > 0 ? uniqueWords : ['technology', 'modern'];
}

export async function analyzeScript(script: string): Promise<SceneData[]> {
  if (isOpenAISandbox() || !openai) {
    console.log('Running Script Analysis in Sandbox Mode');
    // Split script by sentences
    const sentences = script
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    return sentences.map((sentence, idx) => {
      const keywords = extractKeywords(sentence);
      // Generate a title based on the first few words
      const words = sentence.split(/\s+/).slice(0, 3).join(' ').replace(/[^a-zA-Z ]/g, '');
      return {
        sceneNumber: idx + 1,
        title: words || `Scene ${idx + 1}`,
        narration: sentence,
        visualKeywords: keywords
      };
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert video producer. Analyze the script provided and split it into logical video scenes (split every 1-2 sentences). 
For each scene, you MUST return a valid JSON object matching the schema. Return the response as a JSON array of scenes.

JSON schema:
{
  "scenes": [
    {
      "sceneNumber": number,
      "title": "short concise scene title",
      "narration": "the narration text for this scene",
      "visualKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

Ensure the response contains ONLY the JSON and is valid. Use 3-5 visual keywords that represent searchable terms for stock video websites like Pexels.`
        },
        {
          role: 'user',
          content: script
        }
      ],
      response_format: { type: 'json_object' }
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(resultText);
    return parsed.scenes || parsed;
  } catch (error) {
    console.warn('Error in OpenAI script analysis, falling back to local parsing:', error);
    
    // Split script by sentences
    const sentences = script
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    return sentences.map((sentence, idx) => {
      const keywords = extractKeywords(sentence);
      const words = sentence.split(/\s+/).slice(0, 3).join(' ').replace(/[^a-zA-Z ]/g, '');
      return {
        sceneNumber: idx + 1,
        title: words || `Scene ${idx + 1}`,
        narration: sentence,
        visualKeywords: keywords
      };
    });
  }
}
