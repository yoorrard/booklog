export type UserRole = "teacher" | "student";

export type Profile = {
  id: string;
  role: UserRole;
  display_name: string;
  created_at: string;
};

export type Teacher = {
  id: string;
  school: string | null;
  created_at: string;
};

export type Class = {
  id: string;
  teacher_id: string;
  name: string;
  grade: string | null;
  join_code: string;
  created_at: string;
};

export type Student = {
  id: string;
  class_id: string;
  student_number: number;
  login_id: string;
  must_change_password: boolean;
  created_at: string;
};

export type Book = {
  id: string;
  student_id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  genre: string | null;
  pages: number | null;
  cover_url: string | null;
  status: "reading" | "done" | "pause";
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RecordTheme =
  | "free"
  | "quote"
  | "feeling"
  | "summary"
  | "learn"
  | "recommend"
  | "letter"
  | "character"
  | "question"
  | "review";

export type RecordRow = {
  id: string;
  book_id: string;
  student_id: string;
  record_type: "short" | "long";
  theme: RecordTheme;
  title: string | null;
  content: string;
  mood: string | null;
  stars: number | null;
  created_at: string;
};

export const THEME_LABELS: Record<RecordTheme, { label: string; emoji: string; desc: string }> = {
  free:       { label: "자유 기록",   emoji: "✍️", desc: "자유롭게 남기는 독서 기록" },
  quote:      { label: "인상 깊은 구절", emoji: "💬", desc: "마음에 남은 문장을 그대로" },
  feeling:    { label: "감정",       emoji: "💗", desc: "책을 읽으며 느낀 감정" },
  summary:    { label: "줄거리 요약",  emoji: "📒", desc: "핵심 줄거리를 정리" },
  learn:      { label: "배운 점",    emoji: "💡", desc: "새롭게 알게 되거나 배운 점" },
  recommend:  { label: "추천 이유",   emoji: "⭐", desc: "친구에게 추천하는 이유" },
  letter:     { label: "주인공에게 편지", emoji: "✉️", desc: "주인공에게 쓰는 한 통의 편지" },
  character:  { label: "인물 탐구",   emoji: "🧑",  desc: "등장인물의 성격·변화 분석" },
  question:   { label: "나의 질문",   emoji: "❓", desc: "책을 읽으며 생긴 질문" },
  review:     { label: "한 줄 감상",  emoji: "🌟", desc: "짧은 한 줄 감상" }
};

export const THEME_ORDER: RecordTheme[] = [
  "free", "quote", "feeling", "summary", "learn", "recommend", "letter", "character", "question", "review"
];
