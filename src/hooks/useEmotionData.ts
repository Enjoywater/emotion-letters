import { useState, useCallback, useMemo, useEffect } from 'react';
import { getLetters, getEmotionLogs } from '../services/supabase';
import type { EmotionLog, Letter } from '../types/letter';

export function useEmotionData() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 초기 데이터 로딩
  useEffect(() => {
    async function loadInitialData() {
      try {
        setInitialLoading(true);
        
        // 최신 10개의 편지 불러오기
        const { data: lettersData, error: lettersError } = await getLetters(10);
        if (!lettersError && lettersData) {
          setLetters(lettersData);
        }
        
        // 감정 로그 불러오기 (그래프 표시용)
        const { data: logsData, error: logsError } = await getEmotionLogs();
        if (!logsError && logsData) {
          setLogs(logsData);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  const addLog = useCallback((log: EmotionLog) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const addLetter = useCallback((letter: Letter) => {
    setLetters(prev => [...prev, letter]);
  }, []);

  // 감정 데이터를 날짜별로 그룹화하여 메모이제이션
  const emotionTrend = useMemo(() => {
    const trendMap = new Map<string, number>();
    
    logs.forEach(log => {
      const date = new Date(log.createdAt).toLocaleDateString('ko-KR');
      const existing = trendMap.get(date) || 0;
      trendMap.set(date, existing + log.emotion.intensity);
    });

    return Array.from(trendMap.entries()).map(([date, intensity]) => ({
      date,
      intensity: intensity / logs.filter(l => 
        new Date(l.createdAt).toLocaleDateString('ko-KR') === date
      ).length
    }));
  }, [logs]);

  // 평균 감정 강도 계산
  const averageIntensity = useMemo(() => {
    if (logs.length === 0) return 0;
    const sum = logs.reduce((acc, log) => acc + log.emotion.intensity, 0);
    return sum / logs.length;
  }, [logs]);

  return {
    logs,
    letters,
    loading,
    initialLoading,
    emotionTrend,
    averageIntensity,
    addLog,
    addLetter,
    setLoading,
  };
}

