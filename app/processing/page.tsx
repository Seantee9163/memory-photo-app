import Link from 'next/link';
import PageCard from '@/components/PageCard';

const steps = ['正在检查照片', '正在修复老照片', '正在生成高级写真', '正在生成漫画风格', '正在生成趣味风格', '正在整理下载结果'];

export default function ProcessingPage() {
  return (
    <PageCard title="处理中">
      <ul className="space-y-3">
        {steps.map((step, idx) => (
          <li key={step} className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-sm font-semibold text-white">{idx + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
      <Link href="/result" className="inline-flex rounded-xl bg-amber-600 px-5 py-3 font-medium text-white hover:bg-amber-700">
        查看结果
      </Link>
    </PageCard>
  );
}
