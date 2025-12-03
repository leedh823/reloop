export interface Failure {
  id: string;
  title: string;
  summary: string;
  content: string;
  emotionTag: string;
  category: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  author?: string;
  createdAt: Date;
  hasAiReview?: boolean;
  hasDiscordThread?: boolean;
}

export interface CreateFailureRequest {
  title: string;
  summary: string;
  content: string;
  emotionTag: string;
  category: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  author?: string;
}

