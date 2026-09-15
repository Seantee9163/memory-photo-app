# Video Shotcraft — local-first studio v1.0

## Open the working interface

https://seantee9163.github.io/memory-photo-app/shotcraft-studio/

This is a self-contained browser editor, not the older Memory Photo demo and not the Vercel API frontend. The original Remotion workflows and existing homepage are unchanged.

## 使用方法

1. 用 iPad 的完整浏览器打开工作台，选择 1–12 个照片或视频文件。
2. 填主题；已有提词放在「提词文案 / 字幕原文」。选择 15 / 30 / 60 秒、高级 / 销售 / 故事 / 震撼、竖屏 / 横屏 / 方形。
3. 自选歌曲、录好的配音和正式 Logo 均为选填。歌曲需要实际音频文件，不接受歌名或流媒体链接代替文件。
4. 点「预览整支片」，确认后点「生成视频文件」。生成时保持页面前台，不锁屏、不切换应用。
5. 完成后播放检查，点「保存视频文件」或系统分享。关闭或刷新页面前先保存结果。

## 已实现

- 混合图片和视频输入、素材排序与删除、视频截取起点与终点。
- 规则驱动的镜头排序、照片轻微推进、转场、字幕烧录及 SRT 下载。
- 15 / 30 / 60 秒，9:16 / 16:9 / 1:1，720p / 1080p。
- 用户歌曲的起点与音量、循环和结尾淡出，录制配音混音，视频原声开关。
- 无歌曲时可使用程序合成氛围音；不是商业歌曲或大模型音乐服务。
- 自选音乐能量峰附近对齐镜头切换。属于粗略能量估计，不是精确的音乐节拍分析。
- 产品与 Logo 使用原素材，等比例排版，不生成新产品视角或替代 Logo。
- 可导入明确的 JSON 分镜：每项包含 duration、asset（1 起算）、caption；总时长必须等于所选时长。
- 用户输入只用于本地画布或 textContent，不作为 HTML 执行。无 API 密钥字段，无第三方分析脚本，CSP 禁止 connect 请求。此页面选入的媒体不提交到仓库或服务器。
- 本机检测导出格式；不能录制 MP4 时明确提供 WebM，绝不把 WebM 仅改名为 MP4。
- 取消、离开页面、失去帧更新和录制错误不会作为成功成片交付。

## 尚未实现，不能宣传为已完成

- 大模型自动理解任意提示词、识别最佳视频片段、自动转录或文字转配音。
- 聊天附件自动传入网页、云端后台渲染、持久任务队列、多账号自动发布。
- iPad Safari 真机录制、系统分享、存入照片 App 的验收。

当前提示词仅识别「慢节奏」「快切」「不加字幕」「关闭原声」及界面说明的近义表达。其他要求需要先由 ChatGPT 给出明确分镜，再导入编辑器。

## 实际测试记录

Environment: Linux Chromium 144, Playwright with local HTML loaded into a browser page, FFmpeg / ffprobe for output validation. Test fixtures were synthetic images and a moving test-pattern video, not real jewelry marketing material. Browser screenshot widths checked: 390, 768, 1024 pixels; no horizontal overflow. No JavaScript page errors in the completed test runs.

| Test | Actual duration | Dimensions | Result |
|---|---:|---:|---|
| Mixed photos + moving video + supplied music + supplied subtitles | 14.997900 s | 720 x 1280 | Exported, video decoded, non-silent audio |
| Photo + built-in synthesized music, sales style | 29.998700 s | 1920 x 1080 | Exported, video decoded, non-silent audio |
| Photo + built-in synthesized music, story style | 60.001433 s | 720 x 720 | Exported, video decoded, non-silent audio |

Additional checks passed: empty input rejection; invalid scene asset rejection; valid explicit scene plan acceptance; overly dense subtitle rejection; SRT download; user cancellation without reporting success.

Important: these Linux test files are genuine MP4 containers with VP9 video and Opus audio selected by this Chromium build. They are NOT verified H.264/AAC delivery files. Safari may choose different encoders. Passing a desktop-browser export test does not establish iPad Photos compatibility, frame-exact 30 fps, or production reliability. All three files were decoded successfully by FFmpeg; real-time frame rates varied with load.

Tested source Git blob SHA: 295f6d30c926a2b1f0869a71421c1d7bc62d3034.
Source commit: 0ef2b03a8f33ad45d036228257744826fbdb6598.
GitHub Pages deployment run: 34980908867 (build and deployment succeeded).

## Cloud continuation requirements

The older app/api/shotcraft/submit route is not used by this editor. Do not treat it as production-ready: its previous implementation accepts a single image, uses fixed copy templates and writes uploads into the public repository. Before enabling cloud submission, implement authentication and ownership checks, private object storage for media, per-job IDs and result isolation, bounded retry and concurrency, safe secret handling, an approved AI/voice provider, and end-to-end mobile acceptance tests. Do not upload customer material or private music to public Git history.

The single index.html can also be hosted on another static host or opened by a desktop browser. iPad Files/Quick Look is not a substitute for running the hosted webpage in a full browser. This release is a local editing trial, not a completed unattended cloud/SaaS system.
