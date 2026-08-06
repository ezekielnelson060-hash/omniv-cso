/**
 * Client-side track passport (Web Audio API).
 * Runs in the browser only: BPM estimate, duration, peak/RMS levels.
 * Key detection is left soft (model-side) until lab-grade WASM is wired.
 */

export type AudioPassport = {
  name: string;
  durationSec: number;
  sampleRate: number;
  channels: number;
  /** Estimated BPM (null if confidence too low) */
  bpm: number | null;
  bpmConfidence: number;
  /** Peak level in dBFS (0 = full scale) */
  peakDb: number;
  /** RMS level in dBFS */
  rmsDb: number;
  /** rough loudness band for managers */
  energy: "quiet" | "moderate" | "hot" | "clipping";
  analyzedAt: number;
};

function dbFromLinear(x: number): number {
  if (x <= 1e-10) return -100;
  return 20 * Math.log10(x);
}

function downsample(data: Float32Array, factor: number): Float32Array {
  const n = Math.floor(data.length / factor);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    const base = i * factor;
    for (let j = 0; j < factor; j++) s += Math.abs(data[base + j] || 0);
    out[i] = s / factor;
  }
  return out;
}

/** Autocorrelation BPM on an amplitude envelope (rough but dependency-free). */
function estimateBpm(
  channel: Float32Array,
  sampleRate: number
): { bpm: number | null; confidence: number } {
  const maxSamples = Math.min(channel.length, sampleRate * 45);
  const slice = channel.subarray(0, maxSamples);

  const hop = Math.max(1, Math.floor(sampleRate / 100));
  const env = downsample(slice, hop);
  const envRate = sampleRate / hop;

  const diff = new Float32Array(env.length);
  for (let i = 1; i < env.length; i++) {
    diff[i] = Math.max(0, env[i] - env[i - 1]);
  }

  const minBpm = 70;
  const maxBpm = 180;
  const minLag = Math.floor((60 / maxBpm) * envRate);
  const maxLag = Math.floor((60 / minBpm) * envRate);

  let bestLag = 0;
  let bestCorr = 0;
  let second = 0;

  let mean = 0;
  for (let i = 0; i < diff.length; i++) mean += diff[i];
  mean /= Math.max(1, diff.length);

  for (let lag = minLag; lag <= maxLag && lag < diff.length; lag++) {
    let corr = 0;
    let n = 0;
    for (let i = 0; i + lag < diff.length; i++) {
      corr += (diff[i] - mean) * (diff[i + lag] - mean);
      n++;
    }
    if (n > 0) corr /= n;
    if (corr > bestCorr) {
      second = bestCorr;
      bestCorr = corr;
      bestLag = lag;
    } else if (corr > second) {
      second = corr;
    }
  }

  if (bestLag <= 0 || bestCorr <= 0) {
    return { bpm: null, confidence: 0 };
  }

  let bpm = (60 * envRate) / bestLag;
  if (bpm > 160) bpm /= 2;
  if (bpm < 75) bpm *= 2;
  bpm = Math.round(bpm * 10) / 10;

  const confidence =
    bestCorr > 0 ? Math.min(1, Math.max(0, 1 - second / bestCorr)) : 0;

  if (confidence < 0.12 || bpm < 60 || bpm > 200) {
    return { bpm: null, confidence };
  }
  return { bpm, confidence };
}

function levels(channel: Float32Array): { peakDb: number; rmsDb: number } {
  let peak = 0;
  let sumSq = 0;
  const n = channel.length;
  for (let i = 0; i < n; i++) {
    const v = Math.abs(channel[i]);
    if (v > peak) peak = v;
    sumSq += channel[i] * channel[i];
  }
  const rms = Math.sqrt(sumSq / Math.max(1, n));
  return { peakDb: dbFromLinear(peak), rmsDb: dbFromLinear(rms) };
}

function energyBand(peakDb: number, rmsDb: number): AudioPassport["energy"] {
  if (peakDb > -0.5) return "clipping";
  if (rmsDb > -12) return "hot";
  if (rmsDb > -22) return "moderate";
  return "quiet";
}

/**
 * Decode a File with Web Audio and produce a track passport.
 * Safe for Next.js client components (no WASM dependency).
 */
export async function analyzeAudioFile(file: File): Promise<AudioPassport | null> {
  if (typeof window === "undefined") return null;
  if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|flac|aac|ogg)$/i.test(file.name)) {
    return null;
  }

  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const buf = await file.arrayBuffer();
    const audio = await ctx.decodeAudioData(buf.slice(0));
    const channel = audio.getChannelData(0);
    const { peakDb, rmsDb } = levels(channel);
    const { bpm, confidence } = estimateBpm(channel, audio.sampleRate);

    try {
      await ctx.close();
    } catch {
      /* noop */
    }

    return {
      name: file.name,
      durationSec: Math.round(audio.duration * 10) / 10,
      sampleRate: audio.sampleRate,
      channels: audio.numberOfChannels,
      bpm,
      bpmConfidence: Math.round(confidence * 100) / 100,
      peakDb: Math.round(peakDb * 10) / 10,
      rmsDb: Math.round(rmsDb * 10) / 10,
      energy: energyBand(peakDb, rmsDb),
      analyzedAt: Date.now(),
    };
  } catch (e) {
    console.warn("audio passport failed", e);
    return null;
  }
}

/** Compact block for Ziki system / user prompt. */
export function formatPassportForZiki(p: AudioPassport): string {
  const lines = [
    `TRACK PASSPORT (client analysis of "${p.name}"):`,
    `- Duration: ${p.durationSec}s`,
    `- Sample rate: ${p.sampleRate} Hz · channels: ${p.channels}`,
    p.bpm != null
      ? `- Estimated BPM: ${p.bpm} (confidence ${Math.round(p.bpmConfidence * 100)}%)`
      : `- Estimated BPM: inconclusive`,
    `- Peak: ${p.peakDb} dBFS · RMS: ${p.rmsDb} dBFS · Energy: ${p.energy}`,
    `- Treat BPM/levels as measured estimates; refine key/structure by listening.`,
  ];
  return lines.join("\n");
}
