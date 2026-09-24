"""Write episodes/<slug>/post.md from meta.json: caption, hashtags, sources, disclosure."""
import json, re, sys, os, glob

TAGS = '#geography #maps #earth #didyouknow #dailybypass'


def spoken_to_display(s):
    s = s['text'] if isinstance(s, dict) else s
    return re.sub(r'\[([^\]|]+)\|[^\]]+\]', r'\1', s)


ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
for ep in ARGS or sorted(glob.glob('episodes/*/')):
    meta = json.load(open(os.path.join(ep, 'meta.json')))
    out = os.path.join(ep, 'post.md')
    if os.path.exists(out) and '--force' not in sys.argv:
        continue
    lines = [spoken_to_display(s) for s in meta['script']]
    cap = ' '.join(lines[:2])
    extra = meta.get('tags', '')
    src = '\n'.join(f'- {u}' for u in meta.get('sources', []))
    open(out, 'w').write(f"""# {meta['title']}

**Video:** {meta['slug']}.mp4

**Caption**
{cap}

{TAGS} {extra}

**Full script**
{' '.join(lines)}

**Sources**
{src}

**AI disclosure:** narration is synthetic (Kokoro TTS). Satellite imagery: NASA Blue Marble / Black Marble.
""")
    print('wrote', out)
