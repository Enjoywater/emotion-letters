import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ExternalLink, Music } from 'lucide-react';
import type { SpotifyTrack } from '../services/spotify';

interface MusicPlayerProps {
  track: SpotifyTrack;
  className?: string;
}

function MusicPlayer({ track, className = '' }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!track.preview_url) {
      // 미리보기가 없으면 Spotify로 이동
      window.open(track.external_url, '_blank');
      return;
    }

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio) {
        audio.play();
      } else {
        const newAudio = new Audio(track.preview_url);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        newAudio.addEventListener('error', () => {
          console.warn('음악 재생 실패, Spotify로 이동');
          window.open(track.external_url, '_blank');
        });
        setAudio(newAudio);
        newAudio.play();
      }
      setIsPlaying(true);
    }
  };

  const handleSpotifyClick = () => {
    window.open(track.external_url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white ${className}`}
    >
      <div className="flex items-center gap-4">
        {/* 앨범 아트 */}
        <div className="relative">
          {track.image_url ? (
            <img
              src={track.image_url}
              alt={track.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <Music className="w-6 h-6" />
            </div>
          )}
          
          {/* 재생 버튼 오버레이 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </motion.button>
        </div>

        {/* 트랙 정보 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{track.name}</h4>
          <p className="text-xs text-white/80 truncate">{track.artist}</p>
        </div>

        {/* Spotify 링크 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSpotifyClick}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          title="Spotify에서 듣기"
        >
          <ExternalLink className="w-4 h-4" />
        </motion.button>
      </div>

      {/* 재생 상태 표시 */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex items-center gap-2"
        >
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
            <div className="w-1 h-3 bg-white/60 rounded-full animate-pulse"></div>
          </div>
          <span className="text-xs text-white/80">재생 중...</span>
        </motion.div>
      )}
    </motion.div>
  );
}

// React.memo로 최적화
export default memo(MusicPlayer);
