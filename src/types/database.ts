export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      emotion_logs: {
        Row: {
          id: string
          text: string
          emotion_type: string
          emotion_intensity: number
          created_at: string
        }
        Insert: {
          id: string
          text: string
          emotion_type: string
          emotion_intensity: number
          created_at?: string
        }
        Update: {
          id?: string
          text?: string
          emotion_type?: string
          emotion_intensity?: number
          created_at?: string
        }
      }
      letters: {
        Row: {
          id: string
          content: string
          emotion_type: string
          emotion_intensity: number
          music_url: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          content: string
          emotion_type: string
          emotion_intensity: number
          music_url?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          emotion_type?: string
          emotion_intensity?: number
          music_url?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
    }
  }
}

