
export class AudioService {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private windNode: AudioBufferSourceNode | null = null;
  private crackleInterval: number | null = null;
  private musicInterval: number | null = null;
  private isPlaying: boolean = false;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.context = new AudioContext();
      
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.4;

      this.musicGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = 0.35; 
    }
  }

  public async init() {
    if (!this.context) return;
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    if (!this.isPlaying) {
      this.startAmbience();
      this.startMusic();
      this.isPlaying = true;
    }
  }

  public toggleMute(muted: boolean) {
    if (this.masterGain) {
      const target = muted ? 0 : 0.4;
      this.masterGain.gain.setTargetAtTime(target, this.context!.currentTime, 0.1);
    }
  }

  private startAmbience() {
    if (!this.context || !this.masterGain) return;

    // 1. Background Wind/Rumble (Pink Noise)
    const bufferSize = 2 * this.context.sampleRate;
    const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; 
    }

    this.windNode = this.context.createBufferSource();
    this.windNode.buffer = noiseBuffer;
    this.windNode.loop = true;

    const windFilter = this.context.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400;
    windFilter.Q.value = 1;

    this.windNode.connect(windFilter);
    windFilter.connect(this.masterGain);
    this.windNode.start();

    if (this.crackleInterval) clearInterval(this.crackleInterval);
    this.crackleInterval = window.setInterval(() => {
      if (Math.random() > 0.3) return; 
      this.playCrackle();
    }, 100);
  }

  private startMusic() {
    if (!this.context || !this.musicGain) return;
    
    // A simple "Medieval" Melody in A Minor / Dorian
    // Frequencies: A4=440, B4=493, C5=523, D5=587, E5=659, F5=698, G5=783, A5=880
    const melody = [
      { note: 440, dur: 0.5 }, { note: 523, dur: 0.5 }, { note: 587, dur: 0.75 }, { note: 659, dur: 0.25 },
      { note: 587, dur: 0.5 }, { note: 523, dur: 0.5 }, { note: 493, dur: 1 },
      { note: 392, dur: 0.5 }, { note: 493, dur: 0.5 }, { note: 523, dur: 0.75 }, { note: 493, dur: 0.25 },
      { note: 440, dur: 0.5 }, { note: 392, dur: 0.5 }, { note: 440, dur: 1.5 }
    ];

    let noteIndex = 0;
    let nextNoteTime = this.context.currentTime;

    const scheduleNextNote = () => {
      if (!this.context || !this.musicGain) return;

      // Schedule audio slightly ahead
      while (nextNoteTime < this.context.currentTime + 0.1) {
        const { note, dur } = melody[noteIndex];
        
        // Slow tempo (each duration unit = 0.8s approx)
        const playDuration = dur * 0.8; 
        
        this.playInstrumentNote(note, nextNoteTime, playDuration);
        
        nextNoteTime += playDuration;
        noteIndex = (noteIndex + 1) % melody.length;
        
        // Add a pause at end of phrase
        if (noteIndex === 0) nextNoteTime += 2.0;
      }
      
      this.musicInterval = window.setTimeout(scheduleNextNote, 50);
    };

    scheduleNextNote();
  }

  private playInstrumentNote(frequency: number, time: number, duration: number) {
    if (!this.context || !this.musicGain) return;

    // Use a Triangle wave for a flute/recorder sound, or Sawtooth for strings
    // Mixing them gives a richer "early music" synth feel
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'triangle'; 
    osc.frequency.value = frequency;

    // Envelope (soft attack, sustain, soft release)
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.1);
    gain.gain.setValueAtTime(0.3, time + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playCrackle() {
    if (!this.context || !this.masterGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.value = 100 + Math.random() * 500;
    
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const duration = 0.05 + Math.random() * 0.05;
    const startTime = this.context.currentTime;

    gain.gain.setValueAtTime(0.05, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    const panner = this.context.createStereoPanner();
    panner.pan.value = Math.random() * 2 - 1;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  public playFootstep() {
    if (!this.context || !this.masterGain) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.frequency.setValueAtTime(80, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.2);
  }

  public async playSpeech(base64Audio: string) {
    if (!this.context || !this.masterGain) return;

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    try {
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        this.context,
        24000,
        1
      );

      const source = this.context.createBufferSource();
      source.buffer = audioBuffer;
      
      const speechGain = this.context.createGain();
      speechGain.gain.value = 2.0;

      source.connect(speechGain);
      speechGain.connect(this.masterGain);
      source.start();
    } catch (e) {
      console.error("Error playing speech:", e);
    }
  }

  public cleanup() {
    if (this.windNode) this.windNode.stop();
    if (this.crackleInterval) clearInterval(this.crackleInterval);
    if (this.musicInterval) clearTimeout(this.musicInterval);
    if (this.context) this.context.close();
  }
}

export const audioService = new AudioService();

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
