-- Spotify 음악 정보를 위한 컬럼 추가
ALTER TABLE letters 
ADD COLUMN IF NOT EXISTS music_data TEXT;

-- 기존 music_url 컬럼 설명 업데이트
COMMENT ON COLUMN letters.music_url IS 'Spotify 외부 링크 URL';
COMMENT ON COLUMN letters.music_data IS 'Spotify 트랙 정보 JSON 데이터';
