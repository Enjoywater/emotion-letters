export interface Emotion {
  type: 'happy' | 'sad' | 'anxious' | 'excited' | 'calm' | 'angry';
  intensity: number; // 0-100
  timestamp: Date;
}

export interface Letter {
  id: string;
  content: string;
  emotion: Emotion;
  musicUrl?: string;
  imageUrl?: string;
  music?: SpotifyTrack; // Spotify 트랙 정보 추가
  createdAt: Date;
}

export interface EmotionLog {
  id: string;
  emotion: Emotion;
  text: string;
  createdAt: Date;
}

// Spotify 트랙 타입 임포트
export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  preview_url: string | null;
  external_url: string;
  image_url?: string;
}

