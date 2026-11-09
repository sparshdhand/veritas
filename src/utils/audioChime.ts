/**
 * Generates an institutional harmonic chime using the Web Audio API.
 * Requires zero external audio files, works completely offline, and adds 0 KB to the bundle.
 */
export function playInstitutionalChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic frequencies for an uplifting, authoritative major chord (D major - D4, F#4, A4, D5)
    const frequencies = [293.66, 369.99, 440.0, 587.33];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft sine waves with subtle warm harmonic overtones
      osc.type = idx === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Volume envelope: gentle attack, lingering acoustic decay
      const delay = idx * 0.06;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.08 / (idx + 1), now + delay + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + delay + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 2.3);
    });
  } catch (err) {
    // Audio context may be blocked by autoplay policies prior to user interaction
    console.debug("[Chime] Web Audio playback deferred:", err);
  }
}
