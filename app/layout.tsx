import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 纪念照片生成器 Demo',
  description: '上传照片，一键修复并生成 6 张温暖风格纪念图'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
