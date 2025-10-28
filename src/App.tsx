import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { EmotionProvider, useEmotionContext } from './context/EmotionContext';
import EmotionInput from './components/EmotionInput';
import EmotionGraph from './components/EmotionGraph';
import LetterCard from './components/LetterCard';
import LetterModal from './components/LetterModal';
import { generateLetterFromEmotion, analyzeEmotionIntensity } from './services/openai';
import { saveEmotionLog, saveLetter } from './services/supabase';
import type { Letter, EmotionLog } from './types/letter';

function AppContent() {
  const {
    letters,
    loading,
    initialLoading,
    emotionTrend,
    addLog,
    addLetter,
    setLoading,
  } = useEmotionContext();

  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 감정 기록 제출 핸들러를 useCallback으로 메모이제이션
  const handleEmotionSubmit = useCallback(async (text: string, emotionType: string) => {
    setLoading(true);
    
    try {
      // AI를 사용하여 감정 강도 분석
      const intensity = await analyzeEmotionIntensity(text, emotionType);
      
      const newLog: EmotionLog = {
        id: `log-${Date.now()}`,
        text,
        emotion: {
          type: emotionType as any,
          intensity,
          timestamp: new Date(),
        },
        createdAt: new Date(),
      };

      // 로컬 상태 업데이트
      addLog(newLog);
      
      // Supabase에 저장
      await saveEmotionLog(newLog);
      
      // 감정 강도가 높으면 편지 생성
      if (intensity > 70) {
        try {
          const letter = await generateLetterFromEmotion(newLog);
          addLetter(letter);
          
          // Supabase에 편지 저장
          await saveLetter(letter);
        } catch (error) {
          console.error('Failed to generate letter:', error);
        }
      }
    } catch (error) {
      console.error('Failed to save emotion log:', error);
    } finally {
      setLoading(false);
    }
  }, [addLog, addLetter, setLoading]);

  // 편지 열기 핸들러 메모이제이션
  const handleOpenLetter = useCallback((letter: Letter) => {
    setSelectedLetter(letter);
    setIsModalOpen(true);
  }, []);

  // 편지 닫기 핸들러 메모이제이션
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedLetter(null), 300); // 애니메이션 완료 후 초기화
  }, []);

  // 편지 목록을 날짜순으로 정렬하여 메모이제이션
  const sortedLetters = useMemo(() => {
    return [...letters].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [letters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            감정을 나누는 편지함
          </h1>
          <p className="text-gray-600 text-lg">
            감정을 기록하고, AI가 작성한 편지를 받아보세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <EmotionInput onSubmit={handleEmotionSubmit} loading={loading} />
          </div>
          <div>
            <EmotionGraph data={emotionTrend} />
          </div>
        </div>

        {/* 초기 로딩 중 */}
        {initialLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-gray-500 text-lg">편지함을 불러오는 중...</p>
            </div>
          </motion.div>
        )}

        {/* 편지 목록 */}
        {!initialLoading && sortedLetters.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">최근 10개의 편지</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedLetters.map((letter) => (
                <LetterCard
                  key={letter.id}
                  letter={letter}
                  onOpen={handleOpenLetter}
                />
              ))}
            </div>
          </div>
        )}

        {/* 편지가 없을 때 */}
        {!initialLoading && letters.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-gray-500 text-lg">
              아직 받은 편지가 없습니다. 감정을 기록해보세요!
            </p>
          </motion.div>
        )}

        <LetterModal
          letter={selectedLetter}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <EmotionProvider>
      <AppContent />
    </EmotionProvider>
  );
}

export default App;

