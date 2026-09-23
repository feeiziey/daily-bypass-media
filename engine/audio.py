"""Procedural score + sound design, mixed under the voiceover.

Everything is synthesised here, so there is nothing to license.
mix(ep_dir, cues, duration, seed) -> writes build/mix.wav (48 kHz stereo)
"""
import numpy as np
import soundfile as sf
import os

SR = 48000
rng_global = np.random.default_rng(7)


def one_pole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    # vectorised-ish via lfilter would need scipy; loop in chunks with numpy cumulative trick
    from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x)


def hp(x, fc):
    from scipy.signal import butter, lfilter
    b, a = butter(2, fc / (SR / 2), 'high')
    return lfilter(b, a, x)


def bp(x, lo, hi):
    from scipy.signal import butter, lfilter
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return lfilter(b, a, x)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def pad_voice(freq, n, rng):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.07, 0.0, 0.06):
        f = freq * 2 ** (det / 12)
        ph = rng.uniform(0, 2 * np.pi)
        # soft saw from a few partials
        for h in range(1, 7):
            out += np.sin(2 * np.pi * f * h * t + ph * h) / (h ** 1.35)
    return out / 3


def score(duration, seed=0, key=57, mood='minor'):
    """Slow evolving pads + sub + soft pulse. key = MIDI root (57 = A3)."""
    rng = np.random.default_rng(seed)
    n = int(duration * SR)
    out = np.zeros((n, 2))
    # progression (semitones from root), minor-mysterious
    progs = [
        [(0, 3, 7, 10), (-4, 0, 3, 7), (-7, -4, 0, 3), (-5, -1, 2, 7)],   # i7 - VI - iv - v
        [(0, 3, 7, 14), (-2, 2, 5, 10), (-4, 0, 3, 10), (-5, 2, 5, 9)],
        [(0, 7, 10, 15), (-4, 3, 7, 12), (1, 5, 8, 13), (-5, 2, 7, 10)],
    ]
    prog = progs[seed % len(progs)]
    bar = 60 / 76 * 4  # 76 bpm, 4/4
    chord_len = bar * 2
    t = np.arange(n) / SR
    idx = 0
    pos = 0.0
    while pos < duration:
        ch = prog[idx % len(prog)]
        s = int(pos * SR)
        L = int((chord_len + 1.5) * SR)
        e = min(n, s + L)
        seg = np.zeros(e - s)
        for iv in ch:
            seg += pad_voice(midi(key + iv), e - s, rng)
        # envelope: slow attack/release
        env = np.ones(e - s)
        a = int(1.2 * SR)
        r = int(1.8 * SR)
        env[:a] = np.linspace(0, 1, min(a, len(env)))[: len(env[:a])]
        if len(env) > r:
            env[-r:] *= np.linspace(1, 0, r)
        seg *= env
        pan = 0.5 + 0.25 * np.sin(idx * 1.7)
        out[s:e, 0] += seg * (1 - pan) * 0.9
        out[s:e, 1] += seg * pan * 0.9
        idx += 1
        pos += chord_len
    # darken
    for c in range(2):
        out[:, c] = one_pole_lp(out[:, c], 900)
    # sub drone on root
    sub = np.sin(2 * np.pi * midi(key - 24) * t) * 0.55 * (0.8 + 0.2 * np.sin(2 * np.pi * t / 7))
    out += sub[:, None] * 0.5
    # soft pulse: filtered noise ticks on 8ths, fades in after hook
    step = 60 / 76 / 2
    noise = rng.standard_normal(n)
    ticks = np.zeros(n)
    k = 0
    while k * step < duration:
        s = int(k * step * SR)
        L = int(0.05 * SR)
        e = min(n, s + L)
        acc = 1.0 if k % 2 == 0 else 0.55
        ticks[s:e] += np.exp(-np.linspace(0, 9, e - s)) * acc
        k += 1
    pulse = hp(noise * ticks, 5000) * 0.22
    pulse_env = np.clip((t - 3.0) / 4.0, 0, 1)
    out[:, 0] += pulse * pulse_env
    out[:, 1] += np.roll(pulse, 180) * pulse_env
    # low heartbeat kick every bar after 6s
    kick = np.zeros(n)
    k = 0
    while k * bar < duration:
        s = int(k * bar * SR)
        L = int(0.35 * SR)
        e = min(n, s + L)
        tt = np.arange(e - s) / SR
        f = 55 * np.exp(-tt * 18) + 42
        kick[s:e] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
        k += 1
    out += (kick * np.clip((t - 6.0) / 3.0, 0, 1) * 0.35)[:, None]
    out /= np.abs(out).max() + 1e-9
    return out


def sfx(kind, rng):
    if kind == 'whoosh':
        L = int(0.9 * SR)
        x = rng.standard_normal(L)
        env = np.sin(np.linspace(0, np.pi, L)) ** 2
        tt = np.linspace(0, 1, L)
        # moving band-pass via crossfading two bands
        a = bp(x, 300, 1400) * (1 - tt) + bp(x, 1400, 5000) * tt
        y = a * env * 0.5
        return np.stack([y * (1 - tt * 0.6), y * (0.4 + tt * 0.6)], 1)
    if kind == 'pop':
        L = int(0.14 * SR)
        tt = np.arange(L) / SR
        f = 900 * np.exp(-tt * 25) + 420
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 38) * 0.55
        return np.stack([y, y], 1)
    if kind == 'tick':
        L = int(0.5 * SR)
        y = np.zeros(L)
        for i in range(6):
            s = int(i * 0.07 * SR)
            e = s + int(0.012 * SR)
            y[s:e] += hp(rng.standard_normal(e - s), 3000) * np.exp(-np.linspace(0, 6, e - s)) * (0.6 - i * 0.07)
        return np.stack([y, y], 1) * 0.6
    if kind == 'boom':
        L = int(2.2 * SR)
        tt = np.arange(L) / SR
        f = 70 * np.exp(-tt * 3) + 32
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.2)
        y += one_pole_lp(rng.standard_normal(L), 400) * np.exp(-tt * 4) * 0.6
        y = y / np.abs(y).max() * 0.9
        return np.stack([y, y], 1)
    raise ValueError(kind)


def mix(ep_dir, cues, duration, seed=0, key=57):
    import librosa
    vo, vsr = sf.read(os.path.join(ep_dir, 'build', 'vo.wav'))
    if vo.ndim > 1:
        vo = vo.mean(1)
    vo = librosa.resample(vo, orig_sr=vsr, target_sr=SR)
    n = int(duration * SR)
    vo = np.pad(vo, (0, max(0, n - len(vo))))[:n]
    mus = score(duration, seed, key)[:n]
    # ducking envelope from VO
    frame = int(0.02 * SR)
    env = np.sqrt(np.convolve(vo ** 2, np.ones(frame) / frame, 'same'))
    env = env / (env.max() + 1e-9)
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    env = uniform_filter1d(maximum_filter1d(env, int(0.35 * SR)), int(0.25 * SR))
    duck = 1.0 - 0.55 * np.clip(env * 3, 0, 1)
    t = np.arange(n) / SR
    fade = np.clip(t / 1.5, 0, 1) * np.clip((duration - t) / 1.2, 0, 1)
    vo_end = len(np.trim_zeros(vo, 'b')) / SR
    swell = 1 + 0.9 * np.clip((t - vo_end) / 0.8, 0, 1)  # music rises on the end card
    music = mus * (0.16 * duck * fade * swell)[:, None]
    fx = np.zeros((n, 2))
    rng = np.random.default_rng(seed + 11)
    last = {}
    for c in sorted(cues, key=lambda c: c['t']):
        k = c['kind']
        if c['t'] - last.get(k, -9) < 0.25:
            continue
        last[k] = c['t']
        y = sfx(k, rng) * c.get('gain', 1)
        s = int(c['t'] * SR)
        if s >= n:
            continue
        e = min(n, s + len(y))
        fx[s:e] += y[: e - s]
    out = vo[:, None] * 0.92 + music + fx * 0.22
    peak = np.abs(out).max()
    if peak > 0.98:
        out *= 0.98 / peak
    sf.write(os.path.join(ep_dir, 'build', 'mix.wav'), out.astype(np.float32), SR)
