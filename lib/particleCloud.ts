export type ParticleBlobData = {
  origins: Float32Array;
  scales: Float32Array;
  seeds: Float32Array;
};

const TAU = Math.PI * 2;

export function createParticleBlob(count: number, radius = 1.9): ParticleBlobData {
  const origins = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const u = Math.random();
    const v = Math.random();
    const theta = TAU * u;
    const phi = Math.acos(2 * v - 1);
    const spread = Math.pow(Math.random(), 0.58);
    const r = radius * spread;

    const sinPhi = Math.sin(phi);
    let x = Math.cos(theta) * sinPhi * r;
    let y = Math.sin(theta) * sinPhi * r;
    let z = Math.cos(phi) * r;

    // Light anisotropy creates a logo-like, non-uniform cloud silhouette.
    x *= 1.18;
    y *= 0.78;
    z *= 0.94;

    origins[i3] = x;
    origins[i3 + 1] = y;
    origins[i3 + 2] = z;

    scales[i] = 0.55 + Math.random() * 0.95;
    seeds[i] = Math.random() * 1000;
  }

  return { origins, scales, seeds };
}

export function createTextParticleCloud(
  count: number,
  text: string,
  options?: { width?: number; height?: number; fontFamily?: string; fontWeight?: number }
): ParticleBlobData {
  if (typeof document === "undefined") {
    return createParticleBlob(count, 1.75);
  }

  const width = options?.width ?? 1024;
  const height = options?.height ?? 512;
  const fontFamily = options?.fontFamily ?? "Inter, system-ui, sans-serif";
  const fontWeight = options?.fontWeight ?? 700;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return createParticleBlob(count, 1.75);

  const paintText = (fontSize: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillText(text, width * 0.5, height * 0.54);
  };

  let fontSize = Math.floor(height * 0.6);
  paintText(fontSize);
  const measured = ctx.measureText(text).width;
  if (measured > width * 0.88) {
    const ratio = (width * 0.88) / measured;
    fontSize = Math.max(44, Math.floor(fontSize * ratio));
    paintText(fontSize);
  }

  const imageData = ctx.getImageData(0, 0, width, height).data;
  const samples: Array<[number, number]> = [];
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const alpha = imageData[(y * width + x) * 4 + 3];
      if (alpha > 20) {
        samples.push([x, y]);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (samples.length === 0) return createParticleBlob(count, 1.75);

  const boxWidth = Math.max(1, maxX - minX);
  const boxHeight = Math.max(1, maxY - minY);
  const centerX = minX + boxWidth * 0.5;
  const centerY = minY + boxHeight * 0.5;

  const origins = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const sample = samples[(Math.random() * samples.length) | 0];
    const jitterX = (Math.random() - 0.5) * 0.032;
    const jitterY = (Math.random() - 0.5) * 0.032;
    const nx = (sample[0] - centerX) / boxWidth;
    const ny = (centerY - sample[1]) / boxHeight;
    const x = (nx + jitterX) * 17.6;
    const y = (ny + jitterY) * 6.4;
    const z = (Math.random() - 0.5) * 0.65;

    origins[i3] = x;
    origins[i3 + 1] = y;
    origins[i3 + 2] = z;

    scales[i] = 0.48 + Math.random() * 0.95;
    seeds[i] = Math.random() * 1000;
  }

  return { origins, scales, seeds };
}

export function smoothFalloff(distance: number, radius: number): number {
  if (distance >= radius) return 0;
  const t = 1 - distance / radius;
  return t * t * (3 - 2 * t);
}

export function dampFactor(lambda: number, deltaSeconds: number): number {
  return 1 - Math.exp(-lambda * deltaSeconds);
}
