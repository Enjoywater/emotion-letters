# Spotify 음악 추천 통합 가이드

## 🎵 개요

편지 생성 시 감정에 맞는 음악을 Spotify API를 통해 자동으로 추천하고 재생하는 기능입니다.

## ✨ 주요 기능

- 🎧 **감정 기반 음악 추천**: 6가지 감정별 맞춤 음악 검색
- 🎵 **미리보기 재생**: 30초 미리보기 자동 재생
- 🔗 **Spotify 연결**: 앱/웹 플레이어로 바로 이동
- 🖼️ **앨범 아트**: 앨범 커버 이미지 표시
- ⚡ **최적화**: React.memo로 불필요한 리렌더링 방지

---

## 🎯 감정별 음악 매핑

| 감정 | 검색 키워드 | 추천 장르 |
|------|------------|----------|
| **기쁨** | happy upbeat energetic | 팝, 댄스, 업템포 |
| **슬픔** | sad melancholy emotional ballad | 발라드, 인디, 감성 |
| **불안** | calm peaceful relaxing ambient | 앰비언트, 뉴에이지, 명상 |
| **설렘** | energetic exciting festival dance | EDM, 페스티벌, 댄스 |
| **평온** | calm peaceful meditation zen | 명상, 클래식, 어쿠스틱 |
| **화남** | powerful intense rock metal | 록, 메탈, 얼터너티브 |

---

## 🔧 구현 구조

### 1. Spotify API 서비스 (`spotify.ts`)

#### 인증 토큰 획득
```typescript
async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  
  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });
  
  const data = await response.json();
  return data.access_token;
}
```

#### 음악 검색
```typescript
async function searchSpotifyTracks(query: string): Promise<SpotifyTrack | null> {
  const token = await getSpotifyAccessToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=KR&limit=10`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const data = await response.json();
  const tracks = data.tracks?.items;
  
  // preview_url이 있는 트랙 우선 선택
  const tracksWithPreview = tracks.filter((track: any) => track.preview_url);
  const trackList = tracksWithPreview.length > 0 ? tracksWithPreview : tracks;
  
  // 랜덤 선택
  const randomTrack = trackList[Math.floor(Math.random() * trackList.length)];
  
  return {
    id: randomTrack.id,
    name: randomTrack.name,
    artist: randomTrack.artists[0]?.name,
    preview_url: randomTrack.preview_url,
    external_url: randomTrack.external_urls.spotify,
    image_url: randomTrack.album?.images[0]?.url,
  };
}
```

#### 감정별 음악 추천
```typescript
export async function getMusicByEmotion(
  emotionType: string,
  intensity: number
): Promise<SpotifyTrack | null> {
  const query = getSearchQuery(emotionType);
  return await searchSpotifyTracks(query);
}
```

### 2. 음악 플레이어 컴포넌트 (`MusicPlayer.tsx`)

```tsx
function MusicPlayer({ track }: { track: SpotifyTrack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!track.preview_url) {
      // 미리보기가 없으면 Spotify로 이동
      window.open(track.external_url, '_blank');
      return;
    }

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio) {
        audio.play();
      } else {
        const newAudio = new Audio(track.preview_url);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        setAudio(newAudio);
        newAudio.play();
      }
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4">
      {/* 앨범 아트 */}
      <img src={track.image_url} alt={track.name} className="w-12 h-12 rounded-lg" />
      
      {/* 재생/일시정지 버튼 */}
      <button onClick={handlePlayPause}>
        {isPlaying ? <Pause /> : <Play />}
      </button>
      
      {/* Spotify 링크 */}
      <button onClick={() => window.open(track.external_url, '_blank')}>
        <ExternalLink />
      </button>
    </div>
  );
}

export default memo(MusicPlayer);
```

---

## 🗄️ 데이터베이스 스키마

### letters 테이블 업데이트
```sql
ALTER TABLE letters 
ADD COLUMN IF NOT EXISTS music_data TEXT;

COMMENT ON COLUMN letters.music_url IS 'Spotify 외부 링크 URL';
COMMENT ON COLUMN letters.music_data IS 'Spotify 트랙 정보 JSON 데이터';
```

### 저장되는 데이터 구조
```json
{
  "id": "spotify_track_id",
  "name": "곡 제목",
  "artist": "아티스트명",
  "preview_url": "30초 미리보기 URL",
  "external_url": "Spotify 외부 링크",
  "image_url": "앨범 아트 URL"
}
```

---

## 🚀 설정 방법

### 1. Spotify 앱 등록

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) 접속
2. 새 앱 생성
3. **Client ID**와 **Client Secret** 복사

### 2. 환경 변수 설정

`.env` 파일에 추가:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### 3. Supabase 테이블 업데이트

```sql
-- supabase_music_update.sql 실행
ALTER TABLE letters ADD COLUMN IF NOT EXISTS music_data TEXT;
```

### 4. 테스트

1. 개발 서버 실행: `npm run dev`
2. 감정 기록 작성 (강도 70% 이상)
3. 편지 생성 시 음악 자동 추가
4. 편지 모달에서 음악 재생 확인

---

## 📱 사용자 경험

### 편지 생성 플로우
```
감정 기록 입력
    ↓
AI 감정 강도 분석
    ↓
[강도 > 70%?]
    ↓ YES
편지 생성 (OpenAI)
    ↓
음악 추천 (Spotify) ← 새로 추가
    ↓
편지 + 음악 저장
    ↓
UI에 표시
```

### 편지 보기 플로우
```
편지 카드 클릭
    ↓
편지 모달 열기
    ↓
음악 플레이어 표시 (음악이 있는 경우)
    ↓
재생 버튼 클릭 → 30초 미리보기 재생
또는
Spotify 링크 클릭 → 전체 곡 감상
```

---

## 🎨 UI/UX 디자인

### 편지 카드
- 음악이 포함된 경우 녹색 음악 아이콘 표시
- 감정별 그라데이션 색상 유지

### 편지 모달
- "추천 음악" 섹션 추가
- 그라데이션 음악 플레이어
- 앨범 아트 표시
- 재생 상태 애니메이션

### 음악 플레이어
- 호버 시 재생 버튼 오버레이
- 재생 중 시각적 피드백 (음파 애니메이션)
- Spotify 외부 링크 버튼
- 반응형 디자인

---

## ⚠️ 주의사항 및 제한사항

### API 제한
- **Client Credentials Flow**: 사용자 인증 없이 공개 데이터만 접근
- **미리보기 제한**: 일부 곡은 30초 미리보기가 없을 수 있음
- **지역 제한**: `market=KR` 설정으로 한국에서 사용 가능한 곡만 검색

### 보안
- ⚠️ 클라이언트 사이드에서 Client Secret 노출 (개선 필요)
- 향후: 서버 사이드 API 프록시 구현 권장

### 오류 처리
- 미리보기가 없는 경우: Spotify 외부 링크로 자동 이동
- API 오류 시: 콘솔에 로그 출력 및 음악 없이 편지만 생성

---

## 🔮 향후 개선 계획

### Phase 1: 고급 기능
- [ ] 사용자 인증 (Authorization Code Flow)
- [ ] 플레이리스트 생성 기능
- [ ] 음악 취향 학습 알고리즘

### Phase 2: 성능 개선
- [ ] 서버 사이드 API 프록시
- [ ] Access Token 캐싱 (1시간)
- [ ] 음악 검색 결과 캐싱

### Phase 3: 사용자 경험
- [ ] 음악 스타일 선택 옵션
- [ ] 여러 곡 추천 (플레이리스트)
- [ ] 음악 기반 편지 공유

---

## 📚 참고 자료

- [Spotify Web API 문서](https://developer.spotify.com/documentation/web-api)
- [Client Credentials Flow](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow)
- [Spotify 검색 API](https://developer.spotify.com/documentation/web-api/reference/search)

---

## 🎉 완성도

| 기능 | 상태 | 설명 |
|------|------|------|
| Spotify API 연동 | ✅ 완료 | Client Credentials Flow |
| 감정별 음악 추천 | ✅ 완료 | 6가지 감정 타입 지원 |
| 음악 플레이어 | ✅ 완료 | 미리보기 재생 + 외부 링크 |
| 편지 통합 | ✅ 완료 | 자동 음악 추천 및 저장 |
| UI/UX | ✅ 완료 | 반응형 디자인 + 애니메이션 |
| 데이터베이스 | ✅ 완료 | Supabase 스키마 업데이트 |

**이제 감정을 기록하면 AI 편지와 함께 맞춤 음악도 받을 수 있습니다!** 🎵✨
