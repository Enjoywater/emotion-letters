// Spotify API 연동

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  preview_url: string | null;
  external_url: string;
  image_url?: string;
}

// Spotify API 인증 토큰 획득
async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.warn('Spotify Client ID 또는 Secret이 설정되지 않았습니다.');
    return null;
  }

  try {
    // Base64로 인코딩된 client_id:client_secret
    const credentials = btoa(`${clientId}:${clientSecret}`);
    
    // 프록시를 통한 요청으로 CORS 문제 해결
    const response = await fetch('/api/spotify-token/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Spotify token 요청 실패:', errorData);
      throw new Error('Spotify token 요청 실패');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Spotify 토큰 획득 실패:', error);
    return null;
  }
}

// 감정별 검색 쿼리 생성
function getSearchQuery(emotionType: string): string {
  const queryMap: Record<string, string> = {
    happy: 'happy upbeat energetic',
    sad: 'sad melancholy emotional ballad',
    anxious: 'calm peaceful relaxing ambient',
    excited: 'energetic exciting festival dance',
    calm: 'calm peaceful meditation zen',
    angry: 'powerful intense rock metal',
  };

  return queryMap[emotionType] || 'happy';
}

// Spotify API 검색 요청
async function searchSpotifyTracks(query: string): Promise<SpotifyTrack | null> {
  const token = await getSpotifyAccessToken();
  
  if (!token) {
    return null;
  }

  try {
    // 프록시를 통한 검색 요청으로 CORS 문제 해결
    // market=KR 추가로 한국에서 사용 가능한 콘텐츠만 반환
    const searchParams = new URLSearchParams({
      q: query,
      type: 'track',
      market: 'KR',
      limit: '10',
    });
    
    const response = await fetch(
      `/api/spotify-api/v1/search?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify API 응답 오류:', response.status, errorText);
      throw new Error(`Spotify API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('Spotify 검색 결과:', data);
    
    const tracks = data.tracks?.items;

    if (!tracks || tracks.length === 0) {
      console.warn('검색 결과가 없습니다:', query);
      return null;
    }

    // preview_url이 있는 트랙만 필터링
    const tracksWithPreview = tracks.filter((track: any) => track.preview_url);
    const trackList = tracksWithPreview.length > 0 ? tracksWithPreview : tracks;
    
    // 랜덤하게 트랙 선택
    const randomTrack = trackList[Math.floor(Math.random() * trackList.length)];
    
    return {
      id: randomTrack.id,
      name: randomTrack.name,
      artist: randomTrack.artists[0]?.name || 'Unknown Artist',
      preview_url: randomTrack.preview_url,
      external_url: randomTrack.external_urls.spotify,
      image_url: randomTrack.album?.images[0]?.url,
    };
  } catch (error) {
    console.error('Spotify 검색 실패:', error);
    return null;
  }
}

// 감정에 따른 음악 추천
export async function getMusicByEmotion(
  emotionType: string,
  _intensity: number
): Promise<SpotifyTrack | null> {
  const query = getSearchQuery(emotionType);
  return await searchSpotifyTracks(query);
}

