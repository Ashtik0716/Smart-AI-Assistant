/**
 * Builds a short two-tone beeping alarm as a WAV file in memory and returns an
 * object URL for it. Callers should URL.revokeObjectURL() it when finished.
 */
export function createDefaultAlarmUrl() {
  const sampleRate = 22050;
  const beeps = 8;
  const beepSec = 0.3;
  const gapSec = 0.2;

  const beepLen = Math.floor(sampleRate * beepSec);
  const gapLen = Math.floor(sampleRate * gapSec);
  const fade = Math.floor(sampleRate * 0.01); // 10 ms ramps stop the beeps from clicking
  const samples = new Int16Array(beeps * (beepLen + gapLen));

  let pos = 0;
  for (let b = 0; b < beeps; b++) {
    const freq = b % 2 === 0 ? 784 : 1047; // alternate two notes so it's hard to sleep through
    for (let i = 0; i < beepLen; i++) {
      const envelope = Math.min(1, i / fade, (beepLen - i) / fade);
      const value = Math.sin((2 * Math.PI * freq * i) / sampleRate) * envelope * 0.6;
      samples[pos + i] = Math.round(value * 32767);
    }
    pos += beepLen + gapLen; // the gap stays silent (zeros)
  }

  // Wrap the samples in a standard 44-byte WAV header (mono, 16-bit PCM).
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, i) => view.setInt16(44 + i * 2, sample, true));

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}