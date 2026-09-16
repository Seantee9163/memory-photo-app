# Hari Malaysia — Metaso sample handoff, 2026-09-16

## Actual generation

- Source generation run: https://github.com/Seantee9163/memory-photo-app/actions/runs/35048780461
- Run result: success. Video and sanitized report downloaded from artifact 10428635219.
- Provider task ID: 2100051773118595072.
- Exactly one new video generation POST in this attempt. MiniMax-H3, 15 seconds requested, 768P, 9:16 requested, aigc_watermark=false, context_ir_enabled=false.
- Provider reported output_seconds=15, input_seconds=0, input_image_count=0.
- Published-rate estimate: 153 credits (15 x 10.2). Actual charge and remaining balance were NOT returned by the API and remain unverified. No recharge, purchase, upgrade or subscription action was performed.
- No Sean photo, video or voice sample was uploaded. Narration is a generic synthetic substitute, not an identity clone. Similarity to Sean has not been verified.

## What this clip is

A first quality sample using scene 08's present-day rainforest, coastline and village imagery. It is AI-generated illustrative scenery, not footage documenting a verified Malaysian location or a historical event. It does not replace or reorder the eight-scene documentary plan.

The preceding connection-check run 35048369789 used an intentionally non-existent task identifier and received HTTP 400 / invalid task_id (2013). Its green status meant the read-only check completed, not that generation permission was verified. The earlier generation attempt 35046212039 stopped at credential-format validation with new_generation_posts=0 and task_id=null. This successful generation is the first actual provider result verified in this work session.

## File-level quality checks, performed in the working container

- Original video: Hari_Malaysia_Scene08_Metaso_RAW.mp4.
- Original SHA256: 7e3617f9ba6c89bbde5cf30253502eaf76d4899055b1f5a39fa2a34cb7596116; matches the artifact report.
- Original ffprobe result: 768 x 1344, 24 fps, H.264 video + AAC audio, 15.083333 seconds. The returned dimensions were not exactly 9:16 despite the API ratio field.
- Delivery video: Hari_Malaysia_Metaso_15s_Preview.mp4, 1080 x 1920, 24 fps, H.264 + AAC, 15.083333 seconds, 16,106,421 bytes.
- Adaptation: scale uniformly to 1080 x 1890 and pad 15 pixels at top and bottom. No cropping or stretching. This is NOT native 1080p generation.
- Full FFmpeg decode checks passed for source and edited delivery.
- Visual review: 30 sampled frames at 0.5-second intervals showed no people or visible platform watermark. No watermark-removal crop or erasure was applied. This sampled review is not a claim of independent frame-by-frame certification.
- Edited delivery SHA256: 1d8d2a1fc10653a05d3e15d048dba70d6598ae94964ee1ecba06008944049af4.
- Delivery files are conversation attachments, not repository MP4 assets.

## Narration check and corrective edit

ASR run: https://github.com/Seantee9163/memory-photo-app/actions/runs/35049072128

Method: faster-whisper small multilingual, CPU int8, automatic language detection, no expected text supplied to the model. Detected language: ms; probability 0.8367688655853271.

ASR detected extraneous, unintelligible text in the original 0.08–4.22 second span. This may include recognition errors and is not a definitive human transcription. To avoid retaining any unrequested speech, the original audio before 4.62 seconds was excluded from the edited delivery. Video frames were preserved.

The four requested later sentences were recognized:

1. 4.88–8.16: 16. September bukan sekadar sebuah tarikh.
2. 8.28–11.46: Ia adalah sebahagian daripada sejarah pembentukan Malaysia.
3. 12.06–12.84: Sejarah kita.
4. 13.38–14.20: Malaysia kita.

The edited delivery retains these four sentences with small padded cuts, short edge fades and pauses. Segment placement: 0.55, 5.00, 10.95 and 13.20 seconds. No new synthesis, voice cloning or additional paid video generation was used for this correction. ASR is not native-speaker listening review and cannot certify pronunciation, timbre or identity similarity.

## Workflow safeguards now in place

The sample workflow normalizes accidental surrounding quotes/Bearer prefixes, disables optional Context IR, blocks repeated create calls on a job re-run, and supports poll-only recovery by an existing task ID. Manual new generation requires a separate confirmation input. Ordinary edits to the file no longer generate paid video unless an explicit one-sample commit marker is supplied.

The read-only diagnostic now explicitly reports video_permission_verified=false and explains the invalid sentinel task response; authentication and other failures are no longer silently presented as verified access.

Offline control-flow tests passed for valid creation, missing consent, malformed credential, blocked paid rerun, poll-only recovery, transport failure without duplicate POST, and insufficient balance without any purchase request. These offline tests do not independently prove all future network outcomes.

## Still outstanding

- The other seven scenes and complete master film.
- Verified flag and map assets, final titles and full documentary music.
- Human listening acceptance of pronunciation and substitute voice timbre.
- Playback/save acceptance on Sean's actual iPad.

Public rate source: https://metaso.cn/minimax-h3
