export type CropCategory = 'hair' | 'beard' | 'eyes' | 'nose' | 'mouth' | 'custom';

export interface CropBox {
  x: number;      // 0..1 normalized (left)
  y: number;      // 0..1 normalized (top)
  width: number;  // 0..1 normalized
  height: number; // 0..1 normalized
}

export interface CelebrityCard {
  id: string;
  name: string;             // e.g. "Kanye West"
  category: CropCategory;
  imageUrl: string;         // Object URL, data URL, or web link
  imageBlob?: Blob;
  imageWidth: number;
  imageHeight: number;
  crop: CropBox;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizDeck {
  id: string;
  title: string;
  cards: CelebrityCard[];
  createdAt: number;
}

export interface DailyGuessState {
  date: string;
  category: CropCategory;
  guesses: string[];
  isCompleted: boolean;
  isWon: boolean;
  streak: number;
}

export type AppTab = 'daily' | 'host' | 'maker' | 'export';
