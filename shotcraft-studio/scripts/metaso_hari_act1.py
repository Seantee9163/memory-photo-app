"""Hari Malaysia scenes 1-3. Exactly three bounded creations; never buy credits.
Uses only the previously generated generic voice, not Sean's private media.
Source geometry and treaty facsimile are downloaded for accurate later compositing.
"""
import base64
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import sys
import time
from urllib.error import HTTPError
from urllib.parse import quote, urljoin, urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

OUT = Path('hari-act1')
OUT.mkdir(exist_ok=True)
TOKEN = os.environ.get('METASO_API_KEY', '').strip().lstrip('\ufeff')
if len(TOKEN) > 1 and TOKEN[0] in ('"', "'") and TOKEN[-1] == TOKEN[0]:
    TOKEN = TOKEN[1:-1].strip()
if TOKEN.lower().startswith('bearer '):
    TOKEN = TOKEN[7:].strip()
BASE = 'https://metaso.cn/api/minimax'
REPORT = {'project': 'Hari Malaysia', 'scenes': [], 'new_generation_posts': 0,
          'maximum_new_posts': 3, 'estimated_credit_cap': 459,
          'actual_charge_credits': None, 'remaining_balance': None,
          'purchase_requests': 0, 'context_ir_enabled': False,
          'private_user_media_uploaded': False,
          'reference_voice': 'Existing synthetic scene-08 voice; not an identity clone',
          'status': 'preflight'}

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None
OPENER = build_opener(NoRedirect())

def scrub(value):
    s = str(value)
    if TOKEN:
        s = s.replace(TOKEN, '[REDACTED]')
    s = re.sub(r'(?i)Bearer\s+\S+|\b(?:mk|sk)-[A-Za-z0-9_-]+', '[REDACTED]', s)
    return re.sub(r'https?://\S+', '[URL OMITTED]', s)[:600]

def save():
    text = json.dumps(REPORT, ensure_ascii=False, indent=2)
    (OUT / 'generation-report.json').write_text(text+'\n', encoding='utf-8')
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        Path(os.environ['GITHUB_STEP_SUMMARY']).write_text('# Hari Malaysia scenes 01-03\n\n```json\n'+text+'\n```\n', encoding='utf-8')

def safe_download(url, target, limit=80*1024*1024):
    for _ in range(6):
        p = urlparse(url)
        if p.scheme != 'https' or not p.hostname or p.username or p.password or p.port not in (None, 443):
            raise RuntimeError('Invalid download target')
        for a in socket.getaddrinfo(p.hostname,443,proto=socket.IPPROTO_TCP):
            if not ipaddress.ip_address(a[4][0]).is_global:
                raise RuntimeError('Non-public target rejected')
        try:
            r = OPENER.open(Request(url,headers={'User-Agent':'Shotcraft/1.2'}),timeout=90)
        except HTTPError as e:
            if e.code in (301,302,303,307,308):
                url=urljoin(url,e.headers.get('Location','')); continue
            raise RuntimeError('Download HTTP '+str(e.code))
        total=0
        with r, open(target,'wb') as f:
            while True:
                b=r.read(1024*1024)
                if not b: break
                total+=len(b)
                if total>limit: raise RuntimeError('Download size cap exceeded')
                f.write(b)
        if total<128: raise RuntimeError('Download is empty')
        return
    raise RuntimeError('Redirect limit exceeded')

def api(method,path,body=None):
    headers={'Authorization':'Bearer '+TOKEN,'Accept':'application/json','User-Agent':'Shotcraft/1.2'}
    data=None
    if body is not None:
        data=json.dumps(body,ensure_ascii=False).encode(); headers['Content-Type']='application/json'
    try:
        with OPENER.open(Request(BASE+path,data=data,method=method,headers=headers),timeout=180) as r:
            code,raw=r.status,r.read(2000000)
    except HTTPError as e:
        code,raw=e.code,e.read(2000000)
    # Deliberately no retry of POST, including ambiguous network failures.
    try: obj=json.loads(raw)
    except Exception: raise RuntimeError('Non-JSON API response HTTP '+str(code))
    if not isinstance(obj,dict): raise RuntimeError('Invalid API response')
    base=obj.get('base_resp') or {}
    if code>=300 or obj.get('error') or (isinstance(base,dict) and base.get('status_code') not in (None,0,'0')):
        err=obj.get('error') or obj.get('message') or base
        raise RuntimeError('Metaso HTTP '+str(code)+': '+scrub(err))
    return obj

def media_probe(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)]))

def prepare_references():
    from PIL import Image,ImageDraw,ImageFilter
    # Non-semantic layout reference, no fictional historical writing or maps.
    img=Image.new('RGB',(720,1280),(42,29,21)); d=ImageDraw.Draw(img)
    for y in range(0,1280,65): d.line((0,y,720,y+18),fill=(62,44,29),width=2)
    d.rectangle((52,282,673,982),fill=(18,15,12))
    d.rectangle((45,270,665,970),fill=(221,204,170))
    d.rectangle((55,279,654,960),outline=(190,166,130),width=2)
    d.rectangle((11,1000,280,1200),fill=(94,62,39))
    img=img.filter(ImageFilter.GaussianBlur(.5)); img.save(OUT/'neutral-layout.jpg',quality=90)
    source=Path('previous/Hari_Malaysia_Scene08_Metaso_RAW.mp4')
    if not source.is_file(): raise RuntimeError('Existing scene-08 artifact missing; no generation sent')
    subprocess.run(['ffmpeg','-y','-v','error','-ss','4.65','-i',str(source),'-t','9.85','-vn','-ac','1','-ar','44100','-c:a','libmp3lame','-b:a','128k',str(OUT/'synthetic-reference.mp3')],check=True)
    return [{'type':'image_url','image_url':{'url':'data:image/jpeg;base64,'+base64.b64encode((OUT/'neutral-layout.jpg').read_bytes()).decode()},'role':'reference_image'},
            {'type':'audio_url','audio_url':{'url':'data:audio/mpeg;base64,'+base64.b64encode((OUT/'synthetic-reference.mp3').read_bytes()).decode()},'role':'reference_audio'}]

SCENES=[
('01','1961 — Gagasan Malaysia',
 'A 1961 archival reading table with an aged large cream paper lying flat, old paper folders and blank kraft archive boxes at the margins. Top-down very slow restrained push-in. The central paper is blank and will receive a verified Southeast Asia map in post-production. Rich realistic paper fibres and amber side light; modest 1960s 35mm film grain.',
 'Pada tahun seribu sembilan ratus enam puluh satu, tercetus satu gagasan untuk membentuk sebuah negara baharu yang dikenali sebagai Malaysia.'),
('02','1962 — Suruhanjaya Cobbold',
 'An unoccupied 1962 archive worktable: dark wooden surface, folded old cream paper and archive boxes in the back, a closed brown file on the left, old fountain pen near the far right. Slow lateral camera drift over the empty central cream paper. Verified North Borneo and Sarawak map and Cobbold Commission label will be composited on that blank area. Documentary macro details of paper fibres and folder ties. No ballot boxes, no voting enactment.',
 'Pada tahun seribu sembilan ratus enam puluh dua, Suruhanjaya Cobbold menjalankan tinjauan untuk mengetahui pandangan rakyat di Sabah dan Sarawak.'),
('03','9 July 1963 — Malaysia Agreement',
 'A solemn museum-style still life: formal cream paper documents on a wooden 1960s archive desk, a capped black fountain pen, a closed plain stamp pad at one edge. Very slow forward dolly, paper edges in shallow focus. Preserve a large blank central cream page for a later verified treaty facsimile. Never generate readable document wording, signatures, coats of arms or seals. Do not depict a signing event or self-writing ink.',
 'Pada sembilan Julai seribu sembilan ratus enam puluh tiga, Perjanjian Malaysia seribu sembilan ratus enam puluh tiga telah ditandatangani.')]

def main():
    if os.environ.get('CREATE_ALLOWED','').lower()!='true': raise RuntimeError('Batch creation not authorized')
    if os.environ.get('GITHUB_RUN_ATTEMPT','1')!='1': raise RuntimeError('Duplicate paid rerun blocked. Recover recorded task IDs; never recreate them.')
    if not TOKEN.startswith('mk-') or not re.fullmatch(r'[!-~]{8,4096}',TOKEN): raise RuntimeError('Invalid credential format')
    refs=prepare_references()
    sources={
      'natural-earth-countries.zip':'https://naturalearth.s3.amazonaws.com/50m_cultural/ne_50m_admin_0_countries.zip',
      'MA63_UNTS_750_10760.pdf':'https://treaties.un.org/doc/publication/unts/volume%20750/volume-750-i-10760-english.pdf'}
    for name,url in sources.items():
        safe_download(url,OUT/name)
    (OUT/'sources.json').write_text(json.dumps(sources,indent=2),encoding='utf-8')
    for sid,title,visual,voice in SCENES:
        item={'scene':sid,'title':title,'duration_requested':15,'task_id':None,'status':'prepared','estimated_credits':153,'narration_expected':voice}
        REPORT['scenes'].append(item)
        prompt=('Create a 15-second VERTICAL 9:16 cinematic historical documentary background shot. '+visual+' '
          'Image 1 is only a simple LAYOUT reference, render it as realistic cinematic photography, not a flat illustration. '
          'No people, no faces, no actors, no hands, no bodies, no silhouettes, no human reflections, no portraits on paper. '
          'No modern devices or architecture. No legible text, maps, dates, national flags, logos, watermarks or branded outro: accurate map, treaty, title and date layers will be added in post. '
          'AUDIO: Use the same adult male narrator TIMBRE and calm Malaysian documentary delivery as Audio 1; do NOT repeat words from that reference. '
          'One off-screen male voice speaking STANDARD BAHASA MELAYU. Not advertising. No music, no sound effects, no extra speech. '
          'Start the following narration at 0.5 seconds and finish it completely before 14.4 seconds, with a silent tail. Do not introduce the clip. '
          'Speak ONLY this exact Malay sentence: "'+voice+'". No other words. This is an illustrative historical reconstruction, not actual archival footage.')
        payload={'model':'MiniMax-H3','content':[{'type':'text','text':prompt}]+refs,'duration':15,'resolution':'768P','ratio':'9:16','aigc_watermark':False,'context_ir_enabled':False}
        if REPORT['new_generation_posts']>=3: raise RuntimeError('Hard generation cap reached')
        item['status']='submitting'; REPORT['new_generation_posts']+=1; REPORT['status']='generating'; save()
        result=api('POST','/v2/video_generation',payload)
        task=str(result.get('task_id') or '')
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,160}',task): raise RuntimeError('No valid task ID; stop without resubmission')
        item.update(task_id=task,status='accepted'); save(); print('SCENE',sid,'TASK',task,flush=True)
        deadline=time.monotonic()+1000; url=None
        while time.monotonic()<deadline:
            obj=api('GET','/v2/query/video_generation/'+quote(task,safe=''))
            taskdata=obj.get('task') or {}; phase=str(taskdata.get('status','')).lower()
            item['status']=phase or 'queued'; save()
            if phase in ('failed','fail','error','cancelled','canceled','expired'):
                raise RuntimeError('Task failed: '+scrub(taskdata.get('error') or phase))
            if phase in ('succeeded','completed','success'):
                url=(taskdata.get('content') or {}).get('url'); item['usage']=taskdata.get('usage')
                if url: break
            time.sleep(15)
        if not url: raise RuntimeError('Poll timeout: recover this existing task ID, no automatic paid retry')
        target=OUT/('scene-'+sid+'-raw.mp4'); safe_download(url,target)
        info=media_probe(target); aud=[s for s in info['streams'] if s['codec_type']=='audio']
        subprocess.run(['ffmpeg','-v','error','-i',str(target),'-f','null','-'],check=True)
        # Inspect the decoded audio, not just the presence of an audio stream.
        pcm=subprocess.check_output(['ffmpeg','-v','error','-i',str(target),'-vn','-ac','1','-ar','16000','-f','f32le','-']) if aud else b''
        import numpy as np
        samples=np.frombuffer(pcm,dtype=np.float32)
        rms=float(np.sqrt(np.mean(samples*samples))) if len(samples) else 0.0
        item.update(status='downloaded_for_visual_and_narration_qc',bytes=target.stat().st_size,
                    sha256=hashlib.sha256(target.read_bytes()).hexdigest(),probe=info,
                    audio_decoded_seconds=len(samples)/16000,audio_rms=rms)
        save()
        if rms<0.001 or len(samples)<16000*8:
            raise RuntimeError('Decoded audio QC failed: stop the remaining paid requests')
    REPORT['status']='three_scenes_downloaded_awaiting_editorial_qc'; save()

if __name__=='__main__':
    try: main()
    except Exception as error:
        REPORT.update(status='stopped_no_automatic_recharge_or_regeneration',reason=scrub(error)); save()
        print('STOPPED',scrub(error)); sys.exit(1)
