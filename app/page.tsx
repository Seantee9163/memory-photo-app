import Link from 'next/link';
import PageCard from '@/components/PageCard';

export default function HomePage() {
  return (
    <PageCard title="AI 纪念照片生成器">
      <p className="text-base text-slate-700 sm:text-lg">上传照片，一键修复并生成 6 张温暖风格纪念图</p>
      <Link
        href="/upload"
        className="inline-flex rounded-xl bg-amber-600 px-5 py-3 font-medium text-white transition hover:bg-amber-700"
      >
        开始制作
      </Link>
    </PageCard>
  );
}
