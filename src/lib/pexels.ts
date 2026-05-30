export interface MediaSearchResult {
  mediaUrl: string;
  mediaType: 'video' | 'image';
  thumbnail: string;
}

const pexelsKey = process.env.PEXELS_API_KEY || '';
const pixabayKey = process.env.PIXABAY_API_KEY || '';

export const isMediaSandbox = () => {
  const noPexels = !pexelsKey || pexelsKey.includes('mock');
  const noPixabay = !pixabayKey || pixabayKey.includes('mock');
  return noPexels && noPixabay;
};

// Curation pools categorized by thematic keyword tags
const MOCK_CATEGORIES = {
  health: [
    {
      url: 'https://cdn.pixabay.com/video/2016/09/13/5086-182390884_large.mp4', // laboratory / research
      thumbnail: 'https://cdn.pixabay.com/photo/2016/09/13/18/43/laboratory-1667994_640.jpg',
      type: 'video'
    },
    {
      url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=compress&cs=tinysrgb&w=800', // doctor working
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    },
    {
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=compress&cs=tinysrgb&w=800', // hospital stethoscope
      thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    },
    {
      url: 'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?auto=compress&cs=tinysrgb&w=800', // medical analysis
      thumbnail: 'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    }
  ],
  tech: [
    {
      url: 'https://cdn.pixabay.com/video/2023/11/04/187760-880942502_large.mp4', // abstract AI neural network
      thumbnail: 'https://cdn.pixabay.com/photo/2023/11/04/19/21/ai-8365609_640.jpg',
      type: 'video'
    },
    {
      url: 'https://cdn.pixabay.com/video/2021/04/12/70878-537466547_large.mp4', // typing code
      thumbnail: 'https://cdn.pixabay.com/photo/2021/04/12/09/00/coding-6171850_640.jpg',
      type: 'video'
    },
    {
      url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800', // developer team
      thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    },
    {
      url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800', // futuristic robotics
      thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    }
  ],
  business: [
    {
      url: 'https://cdn.pixabay.com/video/2020/09/23/50702-462967676_large.mp4', // abstract connection dots
      thumbnail: 'https://cdn.pixabay.com/photo/2020/09/23/20/27/abstract-5596988_640.jpg',
      type: 'video'
    },
    {
      url: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800', // business meeting
      thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    },
    {
      url: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800', // business analytics charts
      thumbnail: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    }
  ],
  education: [
    {
      url: 'https://cdn.pixabay.com/video/2020/11/04/54726-471207869_large.mp4', // abstract glowing graph
      thumbnail: 'https://cdn.pixabay.com/photo/2020/11/04/18/34/city-5713220_640.jpg',
      type: 'video'
    },
    {
      url: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800', // chemistry lab experiment
      thumbnail: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    },
    {
      url: 'https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=800', // blackboard school
      thumbnail: 'https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    }
  ],
  nature: [
    {
      url: 'https://cdn.pixabay.com/video/2015/10/18/1077-142618991_large.mp4', // green forest mist
      thumbnail: 'https://cdn.pixabay.com/photo/2015/10/18/10/36/mist-994223_640.jpg',
      type: 'video'
    },
    {
      url: 'https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg?auto=compress&cs=tinysrgb&w=800', // mountain hill scenery
      thumbnail: 'https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    },
    {
      url: 'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg?auto=compress&cs=tinysrgb&w=800', // cinematic nature bridge
      thumbnail: 'https://images.pexels.com/photos/247599/pexels-photo-247599.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'image'
    }
  ]
};

export async function searchVisuals(
  keywords: string[], 
  style: string = 'Corporate', 
  sceneNumber: number = 1
): Promise<MediaSearchResult> {
  const query = keywords.join(' ').toLowerCase();
  console.log(`Searching visuals for scene ${sceneNumber} with query: "${query}" (Style: ${style})`);

  // Sandbox Mode matching
  if (isMediaSandbox()) {
    console.log('Media API in Sandbox Mode. Classifying query context.');
    
    // 1. Determine category based on keywords
    let category: keyof typeof MOCK_CATEGORIES = 'tech'; // Default to tech
    
    if (/doctor|hospital|medical|illness|disease|health|patient|nurse|treatment/i.test(query)) {
      category = 'health';
    } else if (/school|class|learn|study|lecture|science|chemistry|education|book/i.test(query)) {
      category = 'education';
    } else if (/business|work|office|chart|sale|teamwork|company|marketing|finance/i.test(query)) {
      category = 'business';
    } else if (/nature|forest|mountain|sea|ocean|scenic|travel|sky|aerial/i.test(query)) {
      category = 'nature';
    } else if (/computer|digital|data|technology|code|programmer|futuristic|robot|ai/i.test(query)) {
      category = 'tech';
    }

    // 2. Select asset using round-robin on category list to guarantee different visuals
    const pool = MOCK_CATEGORIES[category];
    const assetIndex = (sceneNumber - 1) % pool.length;
    const selectedAsset = pool[assetIndex];

    console.log(`Matched query to category "${category}" - Selected asset index ${assetIndex}`);

    return {
      mediaUrl: selectedAsset.url,
      mediaType: selectedAsset.type as 'video' | 'image',
      thumbnail: selectedAsset.thumbnail
    };
  }

  // 1. Search Pexels Videos (Priority 1)
  try {
    if (pexelsKey && !pexelsKey.includes('mock')) {
      const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=3`, {
        headers: { Authorization: pexelsKey }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.videos && data.videos.length > 0) {
          // Use sceneNumber to shift select matching index to prevent repeats if search returns multiple items
          const index = (sceneNumber - 1) % Math.min(3, data.videos.length);
          const video = data.videos[index];
          const videoFile = video.video_files.find((f: any) => f.file_type === 'video/mp4') || video.video_files[0];
          if (videoFile) {
            return {
              mediaUrl: videoFile.link,
              mediaType: 'video',
              thumbnail: video.image
            };
          }
        }
      }
    }
  } catch (err) {
    console.error('Pexels Video Search Error:', err);
  }

  // 2. Search Pexels Images (Priority 2)
  try {
    if (pexelsKey && !pexelsKey.includes('mock')) {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3`, {
        headers: { Authorization: pexelsKey }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          const index = (sceneNumber - 1) % Math.min(3, data.photos.length);
          const photo = data.photos[index];
          return {
            mediaUrl: photo.src.large,
            mediaType: 'image',
            thumbnail: photo.src.tiny
          };
        }
      }
    }
  } catch (err) {
    console.error('Pexels Image Search Error:', err);
  }

  // 3. Search Pixabay Videos (Priority 3)
  try {
    if (pixabayKey && !pixabayKey.includes('mock')) {
      const response = await fetch(`https://pixabay.com/api/videos/?key=${pixabayKey}&q=${encodeURIComponent(query)}&per_page=3`);
      if (response.ok) {
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
          const index = (sceneNumber - 1) % Math.min(3, data.hits.length);
          const hit = data.hits[index];
          const videoUrl = hit.videos.medium?.url || hit.videos.small?.url || hit.videos.tiny?.url;
          if (videoUrl) {
            return {
              mediaUrl: videoUrl,
              mediaType: 'video',
              thumbnail: `https://i.vimeocdn.com/video/${hit.picture_id}_295x166.jpg`
            };
          }
        }
      }
    }
  } catch (err) {
    console.error('Pixabay Video Search Error:', err);
  }

  // 4. Search Pixabay Images (Priority 4)
  try {
    if (pixabayKey && !pixabayKey.includes('mock')) {
      const response = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3`);
      if (response.ok) {
        const data = await response.json();
        if (data.hits && data.hits.length > 0) {
          const index = (sceneNumber - 1) % Math.min(3, data.hits.length);
          const hit = data.hits[index];
          return {
            mediaUrl: hit.largeImageURL,
            mediaType: 'image',
            thumbnail: hit.previewURL
          };
        }
      }
    }
  } catch (err) {
    console.error('Pixabay Image Search Error:', err);
  }

  // Final fallback (category logic)
  const categoryPool = MOCK_CATEGORIES.tech;
  const item = categoryPool[(sceneNumber - 1) % categoryPool.length];
  return {
    mediaUrl: item.url,
    mediaType: item.type as 'video' | 'image',
    thumbnail: item.thumbnail
  };
}
