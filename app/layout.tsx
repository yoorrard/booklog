import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리 반 독서통장 · Booklog",
  description: "교사가 학급을 만들고, 학생들은 자기만의 독서 기록을 차곡차곡 쌓아가는 학급 독서통장 서비스.",
  applicationName: "Booklog",
  other: {
    "color-scheme": "light"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
