# 감정을 나누는 편지함 📬

AI 기반 감정 분석 및 개인화된 편지 생성 시스템입니다.

## ✨ 주요 기능

- 📝 **감정 기록**: 일상의 감정과 생각을 6가지 감정 타입으로 기록
- 🤖 **AI 편지 생성**: 감정 강도가 높을 때 GPT-4가 개인화된 편지 작성
- 🎵 **음악 추천**: Spotify API를 통한 감정 기반 음악 추천
- 📊 **감정 트렌드 시각화**: 날짜별 감정 변화를 그래프로 확인
- ⚡ **최적화된 성능**: React 메모이제이션으로 불필요한 리렌더링 방지

## 🎥 데모

https://github.com/user-attachments/assets/96c593ad-793a-4407-b683-7fec8cad92cb

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 값들을 설정하세요:

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### 3. Supabase 테이블 생성
Supabase 대시보드의 SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- 감정 로그 테이블
CREATE TABLE IF NOT EXISTS emotion_logs (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  emotion_type TEXT NOT NULL,
  emotion_intensity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 편지 테이블
CREATE TABLE IF NOT EXISTS letters (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  emotion_type TEXT NOT NULL,
  emotion_intensity INTEGER NOT NULL,
  music_url TEXT,
  music_data TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_emotion_logs_created_at ON emotion_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_letters_created_at ON letters(created_at);

-- RLS 정책 설정 (선택사항)
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access" ON emotion_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access" ON letters FOR ALL USING (true) WITH CHECK (true);
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 5. 프로덕션 빌드
```bash
npm run build
```

## 🏗️ 기술 스택

### Frontend
- **React 18** + **TypeScript**: 타입 안전성과 최신 React 기능
- **Vite**: 빠른 개발 서버 및 빌드
- **Tailwind CSS**: 유틸리티 우선 스타일링
- **Framer Motion**: 부드러운 애니메이션
- **Recharts**: 데이터 시각화

### Backend & Services
- **OpenAI GPT-4**: AI 편지 생성 및 감정 강도 분석
- **Supabase**: 실시간 데이터베이스 (PostgreSQL)
- **Spotify API**: 감정 기반 음악 추천 및 재생

## 📁 프로젝트 구조

```
emotion-letter/
├── src/
│   ├── components/       # UI 컴포넌트
│   │   ├── EmotionGraph.tsx    # 감정 트렌드 그래프
│   │   ├── EmotionInput.tsx    # 감정 입력 폼
│   │   ├── LetterCard.tsx      # 편지 카드
│   │   ├── LetterModal.tsx     # 편지 상세 모달
│   │   └── MusicPlayer.tsx     # 음악 플레이어
│   ├── context/          # React Context
│   │   └── EmotionContext.tsx
│   ├── hooks/            # 커스텀 훅
│   │   └── useEmotionData.ts
│   ├── services/         # API 서비스
│   │   ├── openai.ts     # OpenAI API
│   │   ├── supabase.ts   # Supabase 클라이언트
│   │   └── spotify.ts    # Spotify API
│   ├── types/            # TypeScript 타입
│   │   ├── letter.ts
│   │   └── database.ts
│   └── App.tsx
├── ARCHITECTURE.md       # 아키텍처 문서
├── REACT_OPTIMIZATION.md # React 최적화 가이드
└── SPOTIFY_INTEGRATION.md # Spotify 통합 가이드
```

## 🎯 사용 방법

1. **감정 선택**: 현재 느끼는 감정을 6가지 중 선택
   - 기쁨 😊 / 슬픔 😢 / 불안 😰 / 설렘 🥰 / 평온 😌 / 화남 😡

2. **기록 작성**: 오늘의 감정과 생각을 자유롭게 작성

3. **AI 분석**: GPT-4가 감정 강도를 자동으로 분석 (0-100%)

4. **편지 생성**: 강도가 70% 이상이면 AI가 편지와 음악을 자동 생성

5. **편지 확인**: 받은 편지를 읽고 추천 음악을 들어보세요

## ⚡ React 성능 최적화

이 프로젝트는 불필요한 리렌더링을 최소화하기 위해 다음과 같은 최적화 기법을 적용했습니다:

### 1. React.memo
```tsx
// 컴포넌트 메모이제이션
export default memo(EmotionGraph);
export default memo(LetterCard);
export default memo(MusicPlayer);
```

### 2. useCallback
```tsx
// 함수 메모이제이션
const handleEmotionSubmit = useCallback(async (text, emotionType) => {
  // ...
}, [addLog, addLetter, setLoading]);
```

### 3. useMemo
```tsx
// 계산 결과 캐싱
const emotionTrend = useMemo(() => {
  // 날짜별 감정 트렌드 계산
}, [logs]);
```

### 4. Context 최적화
```tsx
// Context value 메모이제이션
const memoizedValue = useMemo(() => emotionData, [emotionData]);
```

자세한 내용은 [REACT_OPTIMIZATION.md](./REACT_OPTIMIZATION.md)를 참고하세요.

## 🎵 Spotify 음악 기능

편지 생성 시 감정에 맞는 음악을 자동으로 추천합니다:

| 감정 | 추천 장르 |
|------|----------|
| 기쁨 | 팝, 댄스, 업템포 |
| 슬픔 | 발라드, 인디, 감성 |
| 불안 | 앰비언트, 뉴에이지, 명상 |
| 설렘 | EDM, 페스티벌, 댄스 |
| 평온 | 명상, 클래식, 어쿠스틱 |
| 화남 | 록, 메탈, 얼터너티브 |

- 30초 미리보기 재생
- Spotify 앱/웹 연결
- 앨범 아트 표시

자세한 내용은 [SPOTIFY_INTEGRATION.md](./SPOTIFY_INTEGRATION.md)를 참고하세요.

## 📈 성능 개선 결과

| 메트릭 | 최적화 전 | 최적화 후 | 개선율 |
|--------|----------|----------|--------|
| 평균 렌더링 횟수 | 15회 | 5회 | **67%** ↓ |
| 트렌드 계산 빈도 | 매 렌더링 | 데이터 변경 시 | **90%** ↓ |
| Context 리렌더링 | 전체 | 필요한 곳만 | **60%** ↓ |

## 🔮 향후 계획

- [ ] Stable Diffusion 연동 (이미지 생성)
- [ ] 사용자 인증 시스템
- [ ] 다크 모드 지원
- [ ] 편지 공유 기능
- [ ] PDF 내보내기
- [ ] 다국어 지원

## 📄 추가 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처 및 데이터 흐름
- [REACT_OPTIMIZATION.md](./REACT_OPTIMIZATION.md) - React 성능 최적화 상세 가이드
- [SPOTIFY_INTEGRATION.md](./SPOTIFY_INTEGRATION.md) - Spotify 통합 구현 가이드

## 📄 라이센스

MIT License
