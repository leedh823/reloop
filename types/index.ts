export interface Failure {
  id: string;
  title: string;
  summary: string;
  content: string;
  emotionTag: string;
  category: string;
  pdfUrl?: string;
  createdAt: Date;
}

export interface CreateFailureRequest {
  title: string;
  summary: string;
  content: string;
  emotionTag: string;
  category: string;
  pdfUrl?: string;
}

