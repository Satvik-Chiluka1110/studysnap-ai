export interface Flashcard {
  question: string;
  answer: string;
}

export interface Chapter {
  title: string;
  startSlide: number;
  narrationSegment: string;
}

export interface SessionData {
  id: string;
  title: string;
  createdAt: string;
  rawContent: string;
  summary: string;
  keyPoints: string[];
  flashcards: Flashcard[];
  narrationScript: string;
  chapters: Chapter[];
  imageKeywords: string[];
  imageUrls: string[];
}

export interface GenerationResult {
  summary: string;
  keyPoints: string[];
  flashcards: Flashcard[];
  narrationScript: string;
  chapters: Chapter[];
  imageKeywords: string[];
  title: string;
}
