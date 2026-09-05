import {randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';

export const runtime = 'nodejs';

const allowedDurations = new Set([15, 30, 60]);
const allowedStyles = new Set(['premium', 'sales', 'story', 'impact']);

const copyTemplates: Record<string, (name: string, point: string) => string[]> = {
  premium: (name, point) => [
    name,
    point || '细节，不需要喧哗',
    '光落下来，工艺才真正出现',
    '916黄金 · 手工质感',
    'YXY Jewellery',
  ],
  sales: (name, point) => [
    name,
    point || '第一眼看黄金，第二眼看工艺',
    '近看纹理 · 再看结构',
    '916黄金 · 可定制',
    '现在，把它留给重要的人',
  ],
  story: (name, point) => [
    '一件黄金，先从一个念头开始',
    name,
    point || '手上的痕迹，最后变成作品',
    '时间经过，工艺留下',
    'YXY Jewellery · 把故事做成黄金',
  ],
  impact: (name, point) => [
    '别眨眼',
    name,
    point || '黄金只是材料，细节才是分量',
    '近一点，再近一点',
    '916黄金 · YXY Jewellery',
  ],
};

const githubPath = (path: string) => path.split('/').map(encodeURIComponent).join('/');

async function createGithubFile(args: {
  repo: string;
  branch: string;
  token: string;
  path: string;
  contentBase64: string;
  message: string;
}) {
  const response = await fetch(`https://api.github.com/repos/${args.repo}/contents/${githubPath(args.path)}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${args.token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message: args.message,
      content: args.contentBase64,
      branch: args.branch,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub write failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const token = process.env.SHOTCRAFT_GITHUB_TOKEN;
    const repo = process.env.SHOTCRAFT_GITHUB_REPO || 'Seantee9163/memory-photo-app';
    const branch = process.env.SHOTCRAFT_GITHUB_BRANCH || 'main';

    if (!token) {
      return NextResponse.json(
        {error: 'Server is not connected to GitHub yet. Missing SHOTCRAFT_GITHUB_TOKEN.'},
        {status: 503},
      );
    }

    const form = await request.formData();
    const image = form.get('image');
    const productName = String(form.get('productName') || '916 Gold Jewelry').trim().slice(0, 80);
    const sellingPoint = String(form.get('sellingPoint') || '').trim().slice(0, 120);
    const duration = Number(form.get('duration'));
    const style = String(form.get('style') || 'premium');

    if (!image || typeof image === 'string' || typeof image.arrayBuffer !== 'function') {
      return NextResponse.json({error: '请选择一张产品图。'}, {status: 400});
    }
    if (!allowedDurations.has(duration)) {
      return NextResponse.json({error: '视频时长只能是 15、30 或 60 秒。'}, {status: 400});
    }
    if (!allowedStyles.has(style)) {
      return NextResponse.json({error: '视频风格无效。'}, {status: 400});
    }
    if (image.size > 8 * 1024 * 1024) {
      return NextResponse.json({error: '图片请控制在 8MB 以内。'}, {status: 400});
    }

    const mime = image.type || 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    const now = new Date().toISOString().replace(/[-:.]/g, '');
    const jobId = `${now}-${randomUUID().slice(0, 8)}`;
    const imagePath = `video-shotcraft-products/inbox/${jobId}/product.${ext}`;
    const jobPath = `video-shotcraft-products/inbox/${jobId}/job.json`;

    const bytes = Buffer.from(await image.arrayBuffer());
    await createGithubFile({
      repo,
      branch,
      token,
      path: imagePath,
      contentBase64: bytes.toString('base64'),
      message: `shotcraft: upload product image ${jobId}`,
    });

    const copy = copyTemplates[style](productName || '916 Gold Jewelry', sellingPoint);
    const job = {
      jobId,
      createdAt: new Date().toISOString(),
      productName: productName || '916 Gold Jewelry',
      sellingPoint,
      duration,
      style,
      imagePath,
      copy,
      source: 'ipad-control-panel',
    };

    await createGithubFile({
      repo,
      branch,
      token,
      path: jobPath,
      contentBase64: Buffer.from(`${JSON.stringify(job, null, 2)}\n`, 'utf8').toString('base64'),
      message: `shotcraft: queue render job ${jobId}`,
    });

    return NextResponse.json({
      ok: true,
      jobId,
      status: 'queued',
      statusUrl: `/api/shotcraft/status?jobId=${encodeURIComponent(jobId)}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : '提交失败，请稍后再试。'},
      {status: 500},
    );
  }
}
