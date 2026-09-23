"""Build the voiceover for one episode with Kokoro-82M (local, free).

Reads <episode>/meta.json, writes <episode>/build/vo.wav and build/words.json.

Script syntax (meta.json "script" is a list of sentences):
  "The line is [32,090|thirty-two thousand ninety] kilometers long."
  A sentence may also be {"text": "...", "pause": 0.7} to hold after it.
  [display|spoken] shows `display` in captions but speaks `spoken`.

Word timing: each sentence is synthesised on its own, trimmed, then words are
placed by phoneme count, anchored on the pauses Kokoro leaves at commas.
"""
import json, re, sys, os
import numpy as np
import soundfile as sf

ENGINE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.environ.get('KOKORO_DIR', os.path.join(ENGINE, 'models'))
SR = 24000
FRAME = 0.01


def parse_sentence(text):
    """-> list of (display, spoken) word pairs"""
    words = []
    for m in re.finditer(r'\[([^\]|]+)\|([^\]]+)\]([^\s]*)|(\S+)', text):
        if m.group(4):
            words.append((m.group(4), m.group(4)))
        else:
            disp = m.group(1) + (m.group(3) or '')
            spoken = m.group(2) + (m.group(3) or '')
            words.append((disp, spoken))
    return words


def rms_frames(a):
    n = int(SR * FRAME)
    k = len(a) // n
    return np.sqrt((a[:k * n].reshape(k, n) ** 2).mean(1) + 1e-12)


def trim(a, thr_db=-42):
    r = rms_frames(a)
    db = 20 * np.log10(r / (r.max() + 1e-9))
    idx = np.where(db > thr_db)[0]
    if not len(idx):
        return a
    s = max(0, idx[0] - 2) * int(SR * FRAME)
    e = min(len(a), (idx[-1] + 4) * int(SR * FRAME))
    return a[s:e]


def internal_pauses(a, min_len=0.11, thr_db=-38):
    r = rms_frames(a)
    db = 20 * np.log10(r / (r.max() + 1e-9))
    sil = db < thr_db
    out, i = [], 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]:
                j += 1
            if (j - i) * FRAME >= min_len and i > 5 and j < len(sil) - 5:
                out.append((i * FRAME, j * FRAME))
            i = j
        else:
            i += 1
    return out


def weight(tok, spoken, lang):
    ph = tok.phonemize(spoken, lang)
    ph = re.sub(r"[ˈˌː\s]", '', ph)
    return max(1, len(ph))


def main(ep_dir):
    from kokoro_onnx import Kokoro
    meta = json.load(open(os.path.join(ep_dir, 'meta.json')))
    voice = meta.get('voice', 'am_michael')
    speed = meta.get('speed', 1.0)
    lang = 'en-gb' if voice.startswith('b') else 'en-us'
    k = Kokoro(os.path.join(MODEL_DIR, 'kokoro-v1.0.onnx'), os.path.join(MODEL_DIR, 'voices-v1.0.bin'))
    gap_default = meta.get('gap', 0.26)
    lead = 0.35
    audio = [np.zeros(int(SR * lead), np.float32)]
    t = lead
    words = []
    for si, s in enumerate(meta['script']):
        text = s['text'] if isinstance(s, dict) else s
        hold = s.get('pause', gap_default) if isinstance(s, dict) else gap_default
        pairs = parse_sentence(text)
        spoken = ' '.join(p[1] for p in pairs)
        a, sr = k.create(spoken, voice=voice, speed=speed, lang=lang)
        assert sr == SR
        a = trim(a.astype(np.float32))
        dur = len(a) / SR
        # segment the sentence at punctuation, match to detected pauses
        breaks = [i for i, (d, _) in enumerate(pairs[:-1]) if re.search(r'[,;:—]$', d)]
        pauses = internal_pauses(a)
        segs = []  # (word_start_idx, word_end_idx_exclusive, t_start, t_end)
        if breaks and len(pauses) >= 1:
            # choose, for each break in order, the pause closest to the expected position
            w = [weight(k.tokenizer, sp, lang) for _, sp in pairs]
            cum = np.cumsum(w) / sum(w)
            used, bounds = -1, []
            for b in breaks:
                exp = cum[b] * dur
                cands = [(abs((p0 + p1) / 2 - exp), j) for j, (p0, p1) in enumerate(pauses) if j > used]
                if not cands:
                    continue
                dist, j = min(cands)
                if dist < 0.9:
                    bounds.append((b, pauses[j]))
                    used = j
            start_w, start_t = 0, 0.0
            for b, (p0, p1) in bounds:
                segs.append((start_w, b + 1, start_t, p0))
                start_w, start_t = b + 1, p1
            segs.append((start_w, len(pairs), start_t, dur))
        else:
            segs = [(0, len(pairs), 0.0, dur)]
        for (w0, w1, ts, te) in segs:
            ws = [weight(k.tokenizer, pairs[i][1], lang) for i in range(w0, w1)]
            tot = sum(ws)
            acc = ts
            for i, wt in zip(range(w0, w1), ws):
                d = (te - ts) * wt / tot
                words.append({'text': pairs[i][0], 't0': round(t + acc, 3), 't1': round(t + acc + d, 3), 's': si})
                acc += d
        audio.append(a)
        audio.append(np.zeros(int(SR * hold), np.float32))
        t += dur + hold
    full = np.concatenate(audio)
    # gentle loudness normalisation to about -16 LUFS-ish peak
    full = full / (np.abs(full).max() + 1e-9) * 0.89
    os.makedirs(os.path.join(ep_dir, 'build'), exist_ok=True)
    sf.write(os.path.join(ep_dir, 'build', 'vo.wav'), full, SR)
    json.dump({'duration': round(len(full) / SR, 3), 'voice': voice, 'words': words},
              open(os.path.join(ep_dir, 'build', 'words.json'), 'w'), indent=1)
    print(f'{meta["slug"]}: {len(full) / SR:.1f}s, {len(words)} words')


if __name__ == '__main__':
    main(sys.argv[1])
