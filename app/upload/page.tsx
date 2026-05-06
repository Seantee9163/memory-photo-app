'use client';

import Link from 'next/link';
import { useState } from 'react';
import PageCard from '@/components/PageCard';

const types = ['母婴', '家庭', '毕业', '追思', '朋友', '其他'];

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);

  return (
    <PageCard title="上传照片">
      <label className="block">
        <span className="mb-2 block font-medium">上传 1 到 3 张照片</span>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(e.target.files)}
          className="block w-full rounded-lg border border-amber-300 p-2"
        />
        <p className="mt-2 text-sm text-slate-500">当前已选择：{Math.min(files?.length ?? 0, 3)} 张（Demo 不做实际上传）</p>
      </label>

      <label className="block">
        <span className="mb-2 block font-medium">填写组名</span>
        <input type="text" placeholder="例如：外婆纪念相册" className="w-full rounded-lg border border-amber-300 p-2" />
      </label>

      <fieldset>
        <legend className="mb-2 font-medium">选择类型</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {types.map((type) => (
            <label key={type} className="flex items-center gap-2 rounded-lg border border-amber-200 p-2">
              <input type="radio" name="styleType" defaultChecked={type === '家庭'} />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Link href="/processing" className="inline-flex rounded-xl bg-amber-600 px-5 py-3 font-medium text-white hover:bg-amber-700">
        开始生成
      </Link>
    </PageCard>
  );
}
