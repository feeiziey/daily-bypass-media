"""Render one episode to MP4.

  python3 engine/render.py engine/episodes/<slug> [--workers 3] [--preview 12.5] [--frames 0:90]

Steps: detail texture crops -> VO (if missing) -> boot page -> audio mix from cues ->
frames (parallel headless Chromium workers) -> H.264 segments -> concat + mux.
"""
import argparse, json, os, subprocess, sys, threading, time, functools, shutil
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from multiprocessing import Process

ENGINE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
MASTER = os.environ.get('BYPASS_MASTER_TEX', os.path.join(ENGINE, 'player', 'tex', 'master_21600.jpg'))
CHROME = os.environ.get('BYPASS_CHROME', '/opt/pw-browsers/chromium')
FFMPEG = shutil.which('ffmpeg') or 'ffmpeg'
CHROME_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
               '--disable-gpu-vsync', '--font-render-hinting=none']


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve(port):
    h = functools.partial(Quiet, directory=ENGINE)
    srv = ThreadingHTTPServer(('127.0.0.1', port), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def prep_details(ep_dir, meta):
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    dets = meta.get('details', [])
    todo = [d for d in dets if not os.path.exists(os.path.join(ep_dir, 'build', d['file']))]
    if not todo:
        return
    im = Image.open(MASTER)
    Wm, Hm = im.size
    for d in todo:
        w, s, e, n = d['bbox']
        x0, x1 = (w + 180) / 360 * Wm, (e + 180) / 360 * Wm
        y0, y1 = (90 - n) / 180 * Hm, (90 - s) / 180 * Hm
        crop = im.crop((int(x0), int(y0), int(round(x1)), int(round(y1))))
        mx = d.get('max', 4096)
        if max(crop.size) > mx:
            k = mx / max(crop.size)
            crop = crop.resize((int(crop.size[0] * k), int(crop.size[1] * k)), Image.LANCZOS)
        crop.save(os.path.join(ep_dir, 'build', d['file']), quality=93)
        print('detail', d['file'], crop.size)


def page_url(port, ep_dir):
    rel = os.path.relpath(ep_dir, os.path.join(ENGINE, 'player'))
    return f'http://127.0.0.1:{port}/player/index.html?ep={rel}'


def open_page(p, url):
    b = p.chromium.launch(args=CHROME_ARGS, executable_path=CHROME)
    pg = b.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
    logs = []
    pg.on('console', lambda m: logs.append(m.text))
    pg.goto(url)
    for _ in range(600):
        st = pg.evaluate('() => [window.READY || false, window.BOOT_ERROR || null]')
        if st[1]:
            raise RuntimeError(st[1] + '\n' + '\n'.join(logs[-10:]))
        if st[0]:
            break
        time.sleep(0.1)
    else:
        raise RuntimeError('page never ready\n' + '\n'.join(logs[-20:]))
    return b, pg


def worker(url, f0, f1, out_path, crf):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b, pg = open_page(p, url)
        cmd = [FFMPEG, '-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', str(FPS), '-i', '-',
               '-c:v', 'libx264', '-preset', 'medium', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-r', str(FPS), out_path]
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for i in range(f0, f1):
            pg.evaluate(f'() => window.seek({i / FPS})')
            ff.stdin.write(pg.screenshot(type='jpeg', quality=94))
        ff.stdin.close()
        ff.wait()
        b.close()


def still(url, t, out):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b, pg = open_page(p, url)
        for tt in t:
            pg.evaluate(f'() => window.seek({tt})')
            pg.screenshot(path=out.format(t=f'{tt:06.2f}'), type='jpeg', quality=90)
        b.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ep')
    ap.add_argument('--workers', type=int, default=3)
    ap.add_argument('--crf', type=int, default=21)
    ap.add_argument('--stills', help='comma list of seconds, writes build/still_<t>.jpg')
    ap.add_argument('--out')
    ap.add_argument('--port', type=int, default=0)
    ap.add_argument('--revo', action='store_true')
    a = ap.parse_args()
    ep_dir = os.path.abspath(a.ep)
    meta = json.load(open(os.path.join(ep_dir, 'meta.json')))
    os.makedirs(os.path.join(ep_dir, 'build'), exist_ok=True)
    if a.revo or not os.path.exists(os.path.join(ep_dir, 'build', 'words.json')):
        subprocess.run([sys.executable, os.path.join(ENGINE, 'vo.py'), ep_dir], check=True)
    prep_details(ep_dir, meta)
    port = a.port or (8700 + os.getpid() % 900)
    srv = serve(port)
    url = page_url(port, ep_dir)
    if a.stills:
        still(url, [float(x) for x in a.stills.split(',')], os.path.join(ep_dir, 'build', 'still_{t}.jpg'))
        return
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b, pg = open_page(p, url)
        M = pg.evaluate('() => window.META')
        b.close()
    dur = M['duration']
    nfr = int(round(dur * FPS))
    sys.path.insert(0, ENGINE)
    import audio
    audio.mix(ep_dir, M['cues'], nfr / FPS, seed=meta.get('musicSeed', 0), key=meta.get('musicKey', 57))
    t0 = time.time()
    k = max(1, a.workers)
    bounds = [round(i * nfr / k) for i in range(k + 1)]
    segs, procs = [], []
    for i in range(k):
        sp = os.path.join(ep_dir, 'build', f'seg{i}.mp4')
        segs.append(sp)
        pr = Process(target=worker, args=(url, bounds[i], bounds[i + 1], sp, a.crf))
        pr.start()
        procs.append(pr)
    for pr in procs:
        pr.join()
        if pr.exitcode:
            raise SystemExit('worker failed')
    lst = os.path.join(ep_dir, 'build', 'segs.txt')
    open(lst, 'w').write(''.join(f"file '{s}'\n" for s in segs))
    out = a.out or os.path.join(ep_dir, 'build', f"{meta['slug']}.mp4")
    subprocess.run([FFMPEG, '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst,
                    '-i', os.path.join(ep_dir, 'build', 'mix.wav'), '-map', '0:v', '-map', '1:a',
                    '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], check=True)
    for s in segs:
        os.remove(s)
    print(f'rendered {out}: {dur:.1f}s, {nfr} frames in {time.time() - t0:.0f}s')


if __name__ == '__main__':
    main()
