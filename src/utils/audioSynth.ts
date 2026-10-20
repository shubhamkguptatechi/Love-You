/**
 * Romantic Cinematic Ambient Soundscape Synthesizer
 * Built using Web Audio API for zero-dependency, guaranteed-playback romantic music.
 * Produces warm burgundy/rose-gold analog drone pads and gentle crystalline harp chimes.
 */

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private droneOscs: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];
  private filterNode: BiquadFilterNode | null = null;

  private notes = [
    138.59, // Db3
    164.81, // E3
    174.61, // F3
    207.65, // Ab3
    233.08, // Bb3
    261.63, // C4
    277.18, // Db4
    311.13, // Eb4
    349.23, // F4
    415.30, // Ab4
    466.16, // Bb4
    523.25, // C5
    554.37, // Db5
    622.25, // Eb5
    698.46, // F5
  ];

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      // Audio not supported in environment
    }
  }

  public async start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Master bus
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.001, this.ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 3);
    master.connect(this.ctx.destination);
    this.masterGain = master;

    // Warm Low-pass filter with breathing envelope
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.2, this.ctx.currentTime);
    filter.connect(master);
    this.filterNode = filter;

    // Start lush drone chord: Db2 (69.3Hz), Ab2 (103.8Hz), F3 (174.6Hz), C4 (261.6Hz)
    const droneFreqs = [69.3, 103.83, 174.61, 261.63];
    this.droneOscs = [];
    this.droneGains = [];

    droneFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.filterNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Warm sine and gentle triangle mix
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detune for lush orchestral chorus
      const detune = (idx - 1.5) * 4;
      osc.detune.setValueAtTime(detune, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08 / (idx + 1), this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start();

      this.droneOscs.push(osc);
      this.droneGains.push(gain);
    });

    // Start slow filter breath (breathing LFO)
    this.scheduleBreathing();

    // Start periodic gentle chime harp arpeggios
    this.scheduleChimes();
  }

  private scheduleBreathing() {
    if (!this.ctx || !this.filterNode || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    // Breathing cycle synchronized with the 3.8s heartbeat pulse
    this.filterNode.frequency.cancelScheduledValues(now);
    this.filterNode.frequency.setValueAtTime(this.filterNode.frequency.value, now);
    this.filterNode.frequency.linearRampToValueAtTime(460, now + 0.5); // First heartbeat crest
    this.filterNode.frequency.linearRampToValueAtTime(360, now + 1.0);
    this.filterNode.frequency.linearRampToValueAtTime(500, now + 1.45); // Second resonant crest
    this.filterNode.frequency.linearRampToValueAtTime(280, now + 3.8); // Gentle resting exhale

    setTimeout(() => {
      if (this.isPlaying) this.scheduleBreathing();
    }, 3800);
  }

  private playChime(freq: number, delayMs: number = 0) {
    setTimeout(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      // Crystalline bell/harp envelope
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2.004, now); // Gentle shimmer harmonic

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.045, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(noteGain);
      oscHarmonic.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 3.3);
      oscHarmonic.stop(now + 3.3);
    }, delayMs);
  }

  private scheduleChimes() {
    if (!this.isPlaying) return;

    // Pick 2-4 harmonic notes for an arpeggiated romantic phrase
    const phraseLength = Math.floor(Math.random() * 3) + 2;
    const baseIndex = Math.floor(Math.random() * 6) + 4;

    for (let i = 0; i < phraseLength; i++) {
      const noteIndex = Math.min(this.notes.length - 1, baseIndex + i * 2);
      const freq = this.notes[noteIndex];
      this.playChime(freq, i * 420);
    }

    // Schedule next romantic motif in 3.5 to 6.5 seconds
    const nextInterval = 3500 + Math.random() * 3000;
    this.intervalId = window.setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleChimes();
      }
    }, nextInterval);
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    this.isPlaying = false;

    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }

    // Gentle fade-out
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    setTimeout(() => {
      this.droneOscs.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.droneOscs = [];
      this.droneGains = [];
    }, 1300);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const romanticAudio = new RomanticAudioEngine();
