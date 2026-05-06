import Image from 'next/image';
import Link from 'next/link';
import PageCard from '@/components/PageCard';

const mockImages = [
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
  'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200',
  'https://images.unsplash.com/photo-1469571486292-b53601020c0d?w=1200',
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200',
  'https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200'
];

export default function ResultPage() {
  return (
    <PageCard title="生成结果（Demo）">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockImages.map((src, idx) => (
          <article key={src} className="overflow-hidden rounded-xl border border-amber-200 bg-white">
            <Image src={src} alt={`结果图 ${idx + 1}`} width={1200} height={900} className="h-48 w-full object-cover" />
            <div className="p-3">
              <button className="w-full rounded-lg border border-amber-500 px-3 py-2 text-amber-700 hover:bg-amber-100">下载第 {idx + 1} 张</button>
            </div>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="rounded-xl bg-amber-600 px-5 py-3 font-medium text-white hover:bg-amber-700">全部下载</button>
        <Link href="/upload" className="rounded-xl border border-amber-500 px-5 py-3 font-medium text-amber-700 hover:bg-amber-100">
          重新制作
        </Link>
      </div>
    </PageCard>
  );
}
