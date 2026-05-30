export interface SubtitleWord {
  start: number;
  end: number;
  text: string;
}

/**
 * Proportional Subtitle Aligner
 * Splits a narration string into logical lines (around 4-6 words each) 
 * and distributes the total audio duration proportionally based on character lengths.
 */
export function alignSubtitles(narration: string, duration: number): SubtitleWord[] {
  if (!narration || duration <= 0) return [];

  const words = narration.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return [];

  // Group words into lines of ~4 words each
  const lines: string[] = [];
  const wordsPerLine = 4;
  
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '));
  }

  // Calculate character length of each line and total characters
  const lineLengths = lines.map(line => line.length);
  const totalLength = lineLengths.reduce((sum, len) => sum + len, 0);

  if (totalLength === 0) return [];

  let currentTime = 0;
  const subtitleSegments: SubtitleWord[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const percentage = lineLengths[i] / totalLength;
    const lineDuration = duration * percentage;
    
    // Ensure each line shows for at least 0.5 seconds and has some safety margin
    const start = parseFloat(currentTime.toFixed(2));
    currentTime += lineDuration;
    const end = parseFloat(currentTime.toFixed(2));

    subtitleSegments.push({
      start,
      end,
      text: line
    });
  }

  // Adjust final end time to match the duration exactly
  if (subtitleSegments.length > 0) {
    subtitleSegments[subtitleSegments.length - 1].end = parseFloat(duration.toFixed(2));
  }

  return subtitleSegments;
}
