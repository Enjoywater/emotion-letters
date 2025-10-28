import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useEmotionData } from '../hooks/useEmotionData';

type EmotionContextType = ReturnType<typeof useEmotionData>;

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export function EmotionProvider({ children }: { children: ReactNode }) {
  const emotionData = useEmotionData();
  
  // Context value를 메모이제이션하여 불필요한 리렌더링 방지
  const memoizedValue = useMemo(() => emotionData, [emotionData]);

  return (
    <EmotionContext.Provider value={memoizedValue}>
      {children}
    </EmotionContext.Provider>
  );
}

export function useEmotionContext() {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error('useEmotionContext must be used within EmotionProvider');
  }
  return context;
}

