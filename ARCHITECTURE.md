# 프로젝트 아키텍처

## 🏗️ 시스템 구조

```
┌─────────────────────────────────────────┐
│        React App (Vite + TypeScript)    │
├─────────────────────────────────────────┤
│  App.tsx (Root Component)               │
│  ├─ EmotionProvider (Context)           │
│  │  └─ AppContent                       │
│  │     ├─ EmotionInput                  │
│  │     ├─ EmotionGraph                  │
│  │     ├─ LetterCard[]                  │
│  │     └─ LetterModal                   │
│  │        └─ MusicPlayer                │
├─────────────────────────────────────────┤
│  Services Layer                         │
│  ├─ OpenAI (GPT-4)                      │
│  ├─ Supabase (PostgreSQL)               │
│  └─ Spotify API                         │
└─────────────────────────────────────────┘
```

## 📊 데이터 흐름

### 1. 감정 기록 → 편지 생성 플로우

```
사용자 입력 (텍스트 + 감정 선택)
    ↓
EmotionInput.onSubmit
    ↓
App.handleEmotionSubmit
    ↓
OpenAI.analyzeEmotionIntensity
    ↓
Context.addLog + Supabase.saveEmotionLog
    ↓
[강도 > 70%?]
    ↓ YES
OpenAI.generateLetter
    ↓
Spotify.getMusicByEmotion (음악 추천)
    ↓
Context.addLetter + Supabase.saveLetter
    ↓
UI 업데이트 (새 편지 표시)
```

### 2. 편지 보기 플로우

```
LetterCard 클릭
    ↓
handleOpenLetter(letter)
    ↓
setSelectedLetter + setIsModalOpen(true)
    ↓
LetterModal 렌더링
    ↓
MusicPlayer 표시 (음악이 있는 경우)
    ↓
Framer Motion 애니메이션
```

## 🗄️ 데이터베이스 스키마

### emotion_logs 테이블
```sql
CREATE TABLE emotion_logs (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  emotion_type TEXT NOT NULL,          -- 감정 유형 (happy, sad, etc.)
  emotion_intensity INTEGER NOT NULL,  -- 감정 강도 (0-100)
  created_at TIMESTAMP DEFAULT NOW()
);
```

### letters 테이블
```sql
CREATE TABLE letters (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,               -- 편지 내용
  emotion_type TEXT NOT NULL,
  emotion_intensity INTEGER NOT NULL,
  music_url TEXT,                      -- Spotify 외부 링크
  music_data TEXT,                     -- Spotify 트랙 정보 (JSON)
  image_url TEXT,                      -- 이미지 URL (향후 구현)
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 인덱스
```sql
CREATE INDEX idx_emotion_logs_created_at ON emotion_logs(created_at);
CREATE INDEX idx_letters_created_at ON letters(created_at);
```

## 🔧 컴포넌트 아키텍처

### 컴포넌트 트리
```
App
└── EmotionProvider (Context)
    └── AppContent
        ├── EmotionInput (감정 입력)
        │   ├── 감정 선택 버튼 (6가지)
        │   ├── 텍스트 입력
        │   └── 제출 버튼
        ├── EmotionGraph (감정 트렌드 그래프)
        │   └── Recharts LineChart
        ├── LetterCard[] (편지 목록)
        │   ├── 편지 미리보기
        │   └── 음악 아이콘 (있는 경우)
        └── LetterModal (편지 상세)
            ├── 편지 내용
            └── MusicPlayer (음악 플레이어)
```

### 책임 분리

#### Presentation Components (UI)
- `EmotionInput`: 사용자 입력 수집
- `EmotionGraph`: 감정 트렌드 시각화
- `LetterCard`: 편지 카드 표시
- `LetterModal`: 편지 상세 모달
- `MusicPlayer`: Spotify 음악 재생

#### Container Components (로직)
- `App/AppContent`: 전체 상태 관리 및 이벤트 처리

#### Service Layer (API)
- `openai.ts`: GPT-4 API 호출
- `supabase.ts`: 데이터베이스 CRUD
- `spotify.ts`: Spotify API 연동

#### State Management
- `EmotionContext`: 전역 상태 관리
- `useEmotionData`: 커스텀 훅으로 로직 캡슐화

## 🎨 스타일링 전략

### Tailwind CSS 유틸리티 우선
```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  {/* 컨텐츠 */}
</div>
```

### 반응형 디자인
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>
```

### 감정별 색상 시스템
```tsx
const emotionColors = {
  happy: 'from-yellow-400 to-orange-500',
  sad: 'from-blue-400 to-purple-500',
  anxious: 'from-red-400 to-pink-500',
  excited: 'from-purple-400 to-pink-500',
  calm: 'from-green-400 to-teal-500',
  angry: 'from-red-500 to-orange-600',
};
```

## ⚡ 성능 최적화 전략

### 1. React.memo
```tsx
// 불필요한 리렌더링 방지
export default memo(EmotionGraph);
export default memo(LetterCard);
export default memo(MusicPlayer);
```

### 2. useCallback
```tsx
// 함수 참조 안정화
const handleOpenLetter = useCallback((letter) => {
  setSelectedLetter(letter);
  setIsModalOpen(true);
}, []);
```

### 3. useMemo
```tsx
// 비용이 큰 계산 결과 캐싱
const emotionTrend = useMemo(() => {
  // 날짜별 평균 감정 강도 계산
}, [logs]);
```

### 4. Context 최적화
```tsx
// Context value 메모이제이션
const memoizedValue = useMemo(() => emotionData, [emotionData]);
```

자세한 내용은 [REACT_OPTIMIZATION.md](./REACT_OPTIMIZATION.md)를 참고하세요.

## 🎵 Spotify 통합

### 인증 플로우
```
1. Client Credentials Flow로 Access Token 획득
2. Token으로 Spotify API 호출
3. 감정별 검색 쿼리로 음악 검색
4. 랜덤 트랙 선택 및 반환
```

### 감정별 검색 쿼리
```tsx
const queryMap = {
  happy: 'happy upbeat energetic',
  sad: 'sad melancholy emotional ballad',
  anxious: 'calm peaceful relaxing ambient',
  excited: 'energetic exciting festival dance',
  calm: 'calm peaceful meditation zen',
  angry: 'powerful intense rock metal',
};
```

자세한 내용은 [SPOTIFY_INTEGRATION.md](./SPOTIFY_INTEGRATION.md)를 참고하세요.

## 🔐 보안 고려사항

### API 키 관리
- ✅ `.env` 파일에 저장
- ✅ `.gitignore`에 `.env` 추가
- ⚠️ 클라이언트 사이드 노출 (주의 필요)

### Supabase RLS (Row Level Security)
```sql
-- 개발 단계에서는 전체 접근 허용
CREATE POLICY "Enable all access" ON emotion_logs
  FOR ALL USING (true) WITH CHECK (true);
```

### 향후 개선
- [ ] 서버 사이드 API 프록시 구현
- [ ] 사용자 인증 시스템 (Supabase Auth)
- [ ] 사용자별 데이터 분리

## 📦 빌드 및 배포

### 개발 환경
```bash
npm run dev
# Vite 개발 서버: http://localhost:5173
```

### 프로덕션 빌드
```bash
npm run build
# dist/ 폴더에 최적화된 빌드 결과 생성
```

### 배포 옵션
1. **Vercel**: 자동 배포, 환경 변수 관리, SSR 지원
2. **Netlify**: 정적 사이트 호스팅
3. **GitHub Pages**: 무료 호스팅 (정적 사이트)

### 환경 변수 설정 (배포 시)
```env
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SPOTIFY_CLIENT_ID=...
VITE_SPOTIFY_CLIENT_SECRET=...
```

## 🚀 확장 계획

### Phase 1: 완료 ✅
- ✅ 감정 기록 시스템
- ✅ AI 편지 생성
- ✅ 감정 트렌드 그래프
- ✅ Supabase 데이터 저장
- ✅ Spotify 음악 추천
- ✅ React 성능 최적화

### Phase 2: 향후 개발
- [ ] Stable Diffusion 이미지 생성
- [ ] 사용자 인증 시스템
- [ ] 다크 모드 지원
- [ ] 편지 공유 기능

### Phase 3: 고급 기능
- [ ] PDF 내보내기
- [ ] 감정 분석 리포트
- [ ] 다국어 지원
- [ ] PWA (Progressive Web App)

## 📚 참고 자료

- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Supabase 문서](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
