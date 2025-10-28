import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Calendar, Music } from 'lucide-react';
import MusicPlayer from './MusicPlayer';
import type { Letter } from '../types/letter';

interface LetterModalProps {
  letter: Letter | null;
  isOpen: boolean;
  onClose: () => void;
}

function LetterModal({ letter, isOpen, onClose }: LetterModalProps) {
  if (!letter) return null;

  const date = new Date(letter.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-500" />
                  <div>
                    <h2 className="font-semibold text-xl">너에게</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {letter.content}
                  </p>
                </div>

                {/* 음악 플레이어 */}
                {letter.music && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Music className="w-5 h-5 text-green-500" />
                      추천 음악
                    </h3>
                    <MusicPlayer track={letter.music} />
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">감정 분석</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      감정: <span className="font-semibold">{letter.emotion.type}</span>
                    </span>
                    <span className="text-gray-600">
                      강도: <span className="font-semibold">{letter.emotion.intensity}%</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// React.memo로 최적화
export default memo(LetterModal);

