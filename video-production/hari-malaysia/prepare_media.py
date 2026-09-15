"""Prepare public-reference material and preset Malay narration. No personal uploads.
No paid generation, credential values, customer images, or source voice samples are
transmitted. Assets go to a short-lived Actions artifact, never Git history.
"""
import asyncio, io, json, os, re, time, zipfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import requests
from PIL import Image, ImageOps, ImageDraw
import edge_tts
import shapefile

OUT = Path('hari-media-output')
OUT.mkdir(exist_ok=True)
HEADERS = {'User-Agent': 'ShotcraftHistoricalFilm/1.0 (public media research; github.com/Seantee9163/memory-photo-app)'}
SCRIPTS = [
'Pada tahun seribu sembilan ratus enam puluh satu, tercetus satu gagasan untuk membentuk sebuah negara baharu yang dikenali sebagai Malaysia.',
'Pada tahun seribu sembilan ratus enam puluh dua, Suruhanjaya Cobbold menjalankan tinjauan untuk mengetahui pandangan rakyat di Sabah dan Sarawak.',
'Pada sembilan Julai seribu sembilan ratus enam puluh tiga, Perjanjian Malaysia seribu sembilan ratus enam puluh tiga telah ditandatangani.',
'Penubuhan Malaysia pada asalnya dirancang pada tiga puluh satu Ogos seribu sembilan ratus enam puluh tiga. Namun, tarikh tersebut ditangguhkan.',
'Pada enam belas September seribu sembilan ratus enam puluh tiga, Malaysia secara rasmi diisytiharkan.',
'Pada tahun seribu sembilan ratus enam puluh lima, Singapura berpisah daripada Malaysia.',
'Hari ini, Malaysia terdiri daripada Semenanjung Malaysia, Sabah dan Sarawak.',
'Enam belas September bukan sekadar sebuah tarikh. Ia adalah sebahagian daripada sejarah pembentukan Malaysia. Sejarah kita. Malaysia kita.'
]
REPORT = {'narration': [], 'downloads': [], 'errors': [], 'metaso_secret_available': any(bool(os.getenv(k)) for k in ('METASO_MINIMAX_API_KEY','METASO_API_KEY')), 'metaso_called': False, 'personal_media_uploaded': False}

def get(url, **kwargs):
    r=requests.get(url, headers=HEADERS, timeout=45, **kwargs)
    r.raise_for_status()
    return r

def download(url, name):
    try:
        r=get(url)
        p=OUT/name
        p.write_bytes(r.content)
        REPORT['downloads'].append({'path':name,'source':url,'bytes':len(r.content)})
        print('Downloaded',name,len(r.content),flush=True)
        return p
    except Exception as exc:
        REPORT['errors'].append({'asset':name,'error':type(exc).__name__})
        print('Download failed', name, type(exc).__name__,flush=True)

def boundaries():
    selected = {'Malaysia','Indonesia','Singapore','Thailand','Brunei','Philippines','Cambodia','Vietnam','Myanmar'}
    for layer in ['admin_0_countries','admin_1_states_provinces']:
        try:
            url=f'https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_{layer}.zip'
            z=zipfile.ZipFile(io.BytesIO(get(url).content))
            def member(ext): return io.BytesIO(z.read(next(n for n in z.namelist() if n.endswith(ext))))
            reader=shapefile.Reader(shp=member('.shp'),shx=member('.shx'),dbf=member('.dbf'),encoding='utf-8')
            fields=[f[0] for f in reader.fields[1:]]
            features=[]
            for sr in reader.iterShapeRecords():
                props=dict(zip(fields,sr.record))
                admin=props.get('ADMIN',props.get('admin'))
                if (layer=='admin_0_countries' and admin in selected) or (layer=='admin_1_states_provinces' and (admin=='Malaysia' or props.get('adm0_a3')=='MYS')):
                    features.append({'type':'Feature','properties':props,'geometry':sr.shape.__geo_interface__})
            name=f'{layer}.geojson'
            (OUT/name).write_text(json.dumps({'type':'FeatureCollection','features':features}),encoding='utf-8')
            REPORT['downloads'].append({'path':name,'source':url,'license':'Natural Earth public domain','features':len(features)})
            print('Boundary features',layer,len(features),flush=True)
        except Exception as exc:
            REPORT['errors'].append({'asset':layer,'error':type(exc).__name__})


def commons(group, query, limit=4):
    try:
        params={'action':'query','format':'json','generator':'search','gsrsearch':query,'gsrnamespace':6,'gsrlimit':limit,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':1800}
        data=get('https://commons.wikimedia.org/w/api.php',params=params).json()
        for i,page in enumerate(data.get('query',{}).get('pages',{}).values()):
            info=page.get('imageinfo',[{}])[0]
            meta=info.get('extmetadata',{})
            license=meta.get('LicenseShortName',{}).get('value','')
            if not any(x in license.lower() for x in ['cc by','cc0','public domain','pd']): continue
            url=info.get('thumburl',info.get('url',''))
            if not url: continue
            name=f'{group}_{i:02d}.jpg'
            try:
                raw=get(url).content
                im=Image.open(io.BytesIO(raw)).convert('RGB')
                im.thumbnail((2000,2000))
                im.save(OUT/name,quality=92)
                REPORT['downloads'].append({'path':name,'source':info.get('descriptionurl',''),'asset_url':url,'title':page['title'],'metadata':meta,'license':license})
                print('Photo',name,page['title'],license,flush=True)
            except Exception as exc:
                print('Photo failed',group,type(exc).__name__,flush=True)
            time.sleep(.8)
    except Exception as exc:
        REPORT['errors'].append({'asset':group,'error':type(exc).__name__})
        print('Commons query failed', group, type(exc).__name__, flush=True)

async def speech():
    for i,text in enumerate(SCRIPTS,1):
        ok=False
        for attempt in range(2):
            try:
                comm=edge_tts.Communicate(text,'ms-MY-OsmanNeural',rate='-10%',pitch='-2Hz')
                await asyncio.wait_for(comm.save(str(OUT/f'voice_{i:02d}.mp3')),timeout=90)
                REPORT['narration'].append({'scene':i,'text':text,'voice':'ms-MY-OsmanNeural','cloned':False,'file':f'voice_{i:02d}.mp3'})
                print('Speech ready',i,flush=True)
                ok=True; break
            except Exception as exc:
                print('Speech attempt failed',i,type(exc).__name__,flush=True)
                await asyncio.sleep(3)
        if not ok:
            REPORT['errors'].append({'asset':f'voice_{i:02d}','error':'speech unavailable'})
        await asyncio.sleep(1)

def contact():
    files=sorted(OUT.glob('*.jpg'))
    if not files:return
    W=1000; tileW=250; tileH=210
    sheet=Image.new('RGB',(W,((len(files)+3)//4)*tileH),(28,30,34));d=ImageDraw.Draw(sheet)
    for i,p in enumerate(files):
        im=Image.open(p).convert('RGB');im.thumbnail((tileW-10,tileH-32))
        x=i%4*tileW;y=i//4*tileH
        sheet.paste(im,(x+(tileW-im.width)//2,y))
        d.text((x+5,y+tileH-24),p.name,fill='white')
    sheet.save(OUT/'contact.jpg',quality=92)

async def main():
    loop=asyncio.get_running_loop()
    def sources():
        download('https://treaties.un.org/doc/Publication/UNTS/Volume%20750/volume-750-I-10760-English.pdf','ma63_unts.pdf')
        download('https://upload.wikimedia.org/wikipedia/commons/6/66/Flag_of_Malaysia.svg','flag_malaysia.svg')
        boundaries()
        for group,query,limit in [
            ('stadium','"Stadium Merdeka"',6),
            ('kinabalu','"Mount Kinabalu" landscape',3),
            ('sarawak','"Bako National Park" coast',3),
            ('kualalumpur','"Kuala Lumpur" skyline sunrise',3),
            ('kampung','"Malaysia" "paddy field"',3),
        ]: commons(group,query,limit)
        contact()
    task=loop.run_in_executor(None,sources)
    await speech()
    await task
    (OUT/'source_report.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'narration_ms.txt').write_text('\n\n'.join(SCRIPTS),encoding='utf-8')
    print('Done. Narration scenes:',len(REPORT['narration']),'public assets:',len(REPORT['downloads']),flush=True)
    if len(REPORT['narration'])!=8: raise SystemExit('Not all speech scenes completed; artifact retains diagnostics.')

if __name__=='__main__':asyncio.run(main())
