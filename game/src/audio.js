// Synthesised sound only (WebAudio, no audio files): footsteps, a suspicion
// sting, a pickup chime and the caught alarm. Created lazily on first input
// so browsers allow it; M toggles mute.

export function makeAudio() {
  const audio = { ctx: null, muted: false };
  audio.ensure = () => {
    if (!audio.ctx) {
      try {
        audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        audio.ctx = null;
      }
    }
    if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  };
  audio.tone = (freq, dur, type, gain, when = 0) => {
    if (audio.muted || !audio.ctx) return;
    const t0 = audio.ctx.currentTime + when;
    const osc = audio.ctx.createOscillator();
    const g = audio.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(audio.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };
  audio.step = (loud) => audio.tone(loud ? 140 : 220, 0.05, 'triangle', loud ? 0.09 : 0.03);
  audio.suspicious = () => { audio.tone(392, 0.18, 'sine', 0.08); audio.tone(466, 0.22, 'sine', 0.08, 0.14); };
  audio.alarm = () => { audio.tone(220, 0.25, 'square', 0.08); audio.tone(174, 0.35, 'square', 0.08, 0.18); };
  audio.chime = () => { audio.tone(880, 0.12, 'sine', 0.07); audio.tone(1318, 0.2, 'sine', 0.06, 0.09); };
  audio.prize = () => { audio.tone(523, 0.15, 'sine', 0.08); audio.tone(659, 0.15, 'sine', 0.08, 0.12); audio.tone(784, 0.3, 'sine', 0.08, 0.24); };
  audio.toggleMute = () => { audio.muted = !audio.muted; return audio.muted; };
  return audio;
}
