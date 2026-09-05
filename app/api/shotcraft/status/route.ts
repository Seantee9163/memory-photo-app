import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jobId = (url.searchParams.get('jobId') || '').trim();
  const repo = process.env.SHOTCRAFT_GITHUB_REPO || 'Seantee9163/memory-photo-app';

  if (!jobId) {
    return NextResponse.json({error: 'Missing jobId.'}, {status: 400});
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases/tags/video-shotcraft-latest`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    });

    if (response.status === 404) {
      return NextResponse.json({jobId, status: 'rendering', ready: false});
    }
    if (!response.ok) {
      return NextResponse.json({jobId, status: 'rendering', ready: false});
    }

    const release = await response.json();
    const asset = Array.isArray(release.assets)
      ? release.assets.find((item: {name?: string}) => item.name === `${jobId}.mp4`)
      : undefined;

    if (!asset) {
      return NextResponse.json({
        jobId,
        status: 'rendering',
        ready: false,
        actionsUrl: `https://github.com/${repo}/actions/workflows/render-shotcraft-job.yml`,
      });
    }

    return NextResponse.json({
      jobId,
      status: 'ready',
      ready: true,
      downloadUrl: asset.browser_download_url,
      releaseUrl: release.html_url,
    });
  } catch {
    return NextResponse.json({jobId, status: 'rendering', ready: false});
  }
}
