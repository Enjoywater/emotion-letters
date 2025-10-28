import type { EmotionLog, Letter } from '../types/letter';
import { getMusicByEmotion } from './spotify';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API 키가 설정되지 않았습니다.');
}

async function callOpenAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 따뜻하고 이해심 많은 AI 상담사입니다. 사용자의 감정에 공감하며 개인화된 편지를 작성합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API 호출 실패:', error);
    throw error;
  }
}

export async function generateLetterFromEmotion(log: EmotionLog): Promise<Letter> {
  const emotionTypeMap: Record<string, string> = {
    happy: '기쁨',
    sad: '슬픔',
    anxious: '불안',
    excited: '설렘',
    calm: '평온',
    angry: '화남',
  };

  const prompt = `사용자가 다음과 같은 감정을 표현했습니다:
- 감정: ${emotionTypeMap[log.emotion.type] || log.emotion.type}
- 감정 강도: ${log.emotion.intensity}%
- 내용: ${log.text}

이 감정을 바탕으로 사용자에게 쓰는 따뜻하고 위로와 격려가 담긴 편지를 작성해주세요.
편지는 "안녕, 나야"로 시작하고, 사용자의 현재 감정을 인정하면서 앞으로를 응원하는 내용으로 작성해주세요.
개인적인 톤으로 작성하고, 감동적이고 따뜻한 메시지를 전달해주세요.`;

  const letterContent = await callOpenAI(prompt);

  // Spotify 음악 추천
  let musicTrack: any = undefined;
  try {
    const result = await getMusicByEmotion(log.emotion.type, log.emotion.intensity);
    musicTrack = result || undefined;
  } catch (error) {
    console.warn('음악 추천 실패:', error);
  }

  const letter: Letter = {
    id: `letter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content: letterContent,
    emotion: log.emotion,
    music: musicTrack,
    createdAt: new Date(),
  };

  return letter;
}

export async function analyzeEmotionIntensity(text: string, emotionType: string): Promise<number> {
  const emotionTypeMap: Record<string, string> = {
    happy: '기쁨',
    sad: '슬픔',
    anxious: '불안',
    excited: '설렘',
    calm: '평온',
    angry: '화남',
  };

  const prompt = `다음 텍스트에서 ${emotionTypeMap[emotionType] || emotionType}의 강도를 0-100 점수로 평가해주세요.
텍스트: "${text}"

점수만 숫자로만 응답해주세요 (예: 75).`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.statusText}`);
    }

    const data = await response.json();
    const intensityStr = data.choices[0]?.message?.content?.trim() || '50';
    const intensity = parseInt(intensityStr.replace(/[^0-9]/g, ''), 10);
    return Math.min(100, Math.max(0, intensity || 50));
  } catch (error) {
    console.error('감정 분석 실패:', error);
    // 오류 발생 시 랜덤 값 반환
    return Math.floor(Math.random() * 40) + 60;
  }
}

