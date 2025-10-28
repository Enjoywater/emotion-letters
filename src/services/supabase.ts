import { createClient } from '@supabase/supabase-js';
import type { EmotionLog, Letter } from '../types/letter';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export async function saveEmotionLog(log: EmotionLog) {
  const { data, error } = await supabase
    .from('emotion_logs')
    .insert({
      id: log.id,
      text: log.text,
      emotion_type: log.emotion.type,
      emotion_intensity: log.emotion.intensity,
      created_at: log.createdAt.toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

export async function saveLetter(letter: Letter) {
  const { data, error } = await supabase
    .from('letters')
    .insert({
      id: letter.id,
      content: letter.content,
      emotion_type: letter.emotion.type,
      emotion_intensity: letter.emotion.intensity,
      music_url: letter.music?.external_url || null,
      image_url: letter.imageUrl || null,
      music_data: letter.music ? JSON.stringify(letter.music) : null, // Spotify 트랙 정보 저장
      created_at: letter.createdAt.toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

export async function getEmotionLogs() {
  const { data, error } = await supabase
    .from('emotion_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: [], error };

  const logs: EmotionLog[] = data.map((row: any) => ({
    id: row.id,
    text: row.text,
    emotion: {
      type: row.emotion_type as any,
      intensity: row.emotion_intensity,
      timestamp: new Date(row.created_at),
    },
    createdAt: new Date(row.created_at),
  }));

  return { data: logs, error };
}

export async function getLetters(limit?: number) {
  let query = supabase
    .from('letters')
    .select('*')
    .order('created_at', { ascending: false });
  
  // limit이 지정된 경우에만 제한 적용
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) return { data: [], error };

  const letters: Letter[] = data.map((row: any) => ({
    id: row.id,
    content: row.content,
    emotion: {
      type: row.emotion_type as any,
      intensity: row.emotion_intensity,
      timestamp: new Date(row.created_at),
    },
    musicUrl: row.music_url || undefined,
    imageUrl: row.image_url || undefined,
    music: row.music_data ? JSON.parse(row.music_data) : undefined, // Spotify 트랙 정보 복원
    createdAt: new Date(row.created_at),
  }));

  return { data: letters, error };
}

