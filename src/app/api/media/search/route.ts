import { NextResponse } from 'next/server';
import { searchVisuals } from '@/lib/pexels';

export async function POST(request: Request) {
  try {
    const { query, mediaType } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    console.log(`Media search API triggered for query: "${query}", mediaType: "${mediaType}"`);
    
    // In our helper we search visuals.
    // If the user requests a specific type or we just run the general search,
    // searchVisuals returns a single result. Let's return a list of search results if we want.
    // To give the user a choice, let's write a quick custom Pexels search query that returns a list!
    // This is much better for a premium editor replace function.
    const pexelsKey = process.env.PEXELS_API_KEY || '';
    const pixabayKey = process.env.PIXABAY_API_KEY || '';

    const noPexels = !pexelsKey || pexelsKey.includes('mock');
    const noPixabay = !pixabayKey || pixabayKey.includes('mock');

    // If sandbox, return a list of quality mock urls
    if (noPexels && noPixabay) {
      const mockList = [
        {
          mediaUrl: 'https://cdn.pixabay.com/video/2020/09/23/50702-462967676_large.mp4',
          mediaType: 'video',
          thumbnail: 'https://cdn.pixabay.com/photo/2020/09/23/20/27/abstract-5596988_640.jpg'
        },
        {
          mediaUrl: 'https://cdn.pixabay.com/video/2020/11/04/54726-471207869_large.mp4',
          mediaType: 'video',
          thumbnail: 'https://cdn.pixabay.com/photo/2020/11/04/18/34/city-5713220_640.jpg'
        },
        {
          mediaUrl: 'https://cdn.pixabay.com/video/2016/09/13/5086-182390884_large.mp4',
          mediaType: 'video',
          thumbnail: 'https://cdn.pixabay.com/photo/2016/09/13/18/43/laboratory-1667994_640.jpg'
        },
        {
          mediaUrl: 'https://cdn.pixabay.com/video/2021/04/12/70878-537466547_large.mp4',
          mediaType: 'video',
          thumbnail: 'https://cdn.pixabay.com/photo/2021/04/12/09/00/coding-6171850_640.jpg'
        },
        {
          mediaUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600',
          mediaType: 'image',
          thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=150'
        },
        {
          mediaUrl: 'https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg?auto=compress&cs=tinysrgb&w=600',
          mediaType: 'image',
          thumbnail: 'https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg?auto=compress&cs=tinysrgb&w=150'
        }
      ];
      // Filter list based on requested mediaType if specified
      const filtered = mediaType ? mockList.filter(item => item.mediaType === mediaType) : mockList;
      return NextResponse.json({ success: true, media: filtered });
    }

    const results = [];

    // Search Pexels Videos
    if (mediaType === 'video' || !mediaType) {
      try {
        const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5`, {
          headers: { Authorization: pexelsKey }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.videos) {
            for (const video of data.videos) {
              const videoFile = video.video_files.find((f: any) => f.file_type === 'video/mp4') || video.video_files[0];
              if (videoFile) {
                results.push({
                  mediaUrl: videoFile.link,
                  mediaType: 'video',
                  thumbnail: video.image
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Pexels Video Replace Search Error:', err);
      }
    }

    // Search Pexels Images
    if (mediaType === 'image' || !mediaType) {
      try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, {
          headers: { Authorization: pexelsKey }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.photos) {
            for (const photo of data.photos) {
              results.push({
                mediaUrl: photo.src.large,
                mediaType: 'image',
                thumbnail: photo.src.tiny
              });
            }
          }
        }
      } catch (err) {
        console.error('Pexels Image Replace Search Error:', err);
      }
    }

    // Fallback if empty results
    if (results.length === 0) {
      const visual = await searchVisuals([query]);
      results.push(visual);
    }

    return NextResponse.json({ success: true, media: results });
  } catch (error: any) {
    console.error('Media search API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
