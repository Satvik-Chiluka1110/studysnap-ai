export interface Flashcard {
  question: string;
  answer: string;
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
  imageKeywords: string[];
  imageUrls: string[];
}

export interface GenerationResult {
  summary: string;
  keyPoints: string[];
  flashcards: Flashcard[];
  narrationScript: string;
  imageKeywords: string[];
  title: string;
}
