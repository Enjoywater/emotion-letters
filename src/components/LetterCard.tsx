import { memo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Heart, Calendar, Music } from 'lucide-react';
import type { Letter } from '../types/letter';

interface LetterCardProps {
  letter: Letter;
  onOpen: (letter: Letter) => void;
}

// Emotion 타입에 따른 색상 매핑
const emotionColors: Record<string, string> = {
  happy: 'from-yellow-400 to-orange-500',
  sad: 'from-blue-400 to-purple-500',
  anxious: 'from-red-400 to-pink-500',
  excited: 'from-purple-400 to-pink-500',
  calm: 'from-green-400 to-teal-500',
  angry: 'from-red-500 to-orange-600',
};

function LetterCard({ letter, onOpen }: LetterCardProps) {
  const emotionColor = emotionColors[letter.emotion.type] || 'from-gray-400 to-gray-600';
  const date = new Date(letter.createdAt).toLocaleDateString('ko-KR');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={() => onOpen(letter)}
    >
      <div className={`h-2 bg-gradient-to-r ${emotionColor}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-500" />
            {/* <h3 className="font-semibold text-lg"></h3> */}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{date}</span>
          </div>
        </div>
        
        <p className="text-gray-700 line-clamp-3 mb-4">
          {letter.content}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">
              {letter.emotion.type} ({letter.emotion.intensity}%)
            </span>
          </div>
          {letter.music && (
            <div className="flex items-center gap-1">
              <Music className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">음악 포함</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// React.memo로 최적화
export default memo(LetterCard);

