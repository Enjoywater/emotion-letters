import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';

interface EmotionInputProps {
  onSubmit: (text: string, emotionType: string) => void;
  loading?: boolean;
}

function EmotionInput({ onSubmit, loading = false }: EmotionInputProps) {
  const [text, setText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');

  // useCallback으로 함수 메모이제이션: 불필요한 재생성 방지
  const handleSubmit = useCallback(() => {
    if (!text.trim() || !selectedEmotion) return;
    onSubmit(text, selectedEmotion);
    setText('');
    setSelectedEmotion('');
  }, [text, selectedEmotion, onSubmit]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      handleSubmit();
    }
  }, [handleSubmit]);

  const emotions = [
    { type: 'happy', label: '기쁨', color: 'bg-yellow-500' },
    { type: 'sad', label: '슬픔', color: 'bg-blue-500' },
    { type: 'anxious', label: '불안', color: 'bg-red-500' },
    { type: 'excited', label: '설렘', color: 'bg-purple-500' },
    { type: 'calm', label: '평온', color: 'bg-green-500' },
    { type: 'angry', label: '화남', color: 'bg-orange-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h2 className="text-xl font-semibold">오늘의 감정 기록하기</h2>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          지금 어떤 감정인가요?
        </label>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion) => (
            <motion.button
              key={emotion.type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedEmotion(emotion.type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedEmotion === emotion.type
                  ? `${emotion.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {emotion.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          오늘 하루는 어땠나요?
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="오늘의 감정과 생각을 자유롭게 적어보세요..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!text.trim() || !selectedEmotion || loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            <span>AI가 편지를 작성하는 중...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>감정 기록하기</span>
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500 text-center mt-2">
        Shift + Enter로 빠르게 제출
      </p>
    </motion.div>
  );
}

export default EmotionInput;

