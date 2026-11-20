/**
 * Reads what a browser's WebCodecs decoder needs from a published MP4's one
 * video track: the codec string and `avcC` description, and every sample in
 * decode order with its place in the file and its presentation time.
 */

/** One coded picture of the track, as the decoder is given it. */
export interface Mp4Sample {
  offset: number;
  size: number;
  /** Presentation time in microseconds. */
  timestamp: number;
  key: boolean;
}

export interface Mp4VideoSamples {
  codec: string;
  description: number[];
  samples: Mp4Sample[];
}

/** One ISO base media file box: its four-character type and where its payload lies. */
export interface Mp4Box {
  type: string;
  start: number;
  end: number;
}

/** The boxes directly inside `bytes[start, end)`, in file order. */
export function mp4Boxes(bytes: Buffer, start = 0, end = bytes.length): Mp4Box[] {
  const boxes: Mp4Box[] = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString("latin1");
    let header = 8;
    if (size === 1) {
      size = Number(bytes.readBigUInt64BE(offset + 8));
      header = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < header || offset + size > end) {
      throw new Error(`MP4 ${type} box at ${offset} overruns its parent`);
    }
    boxes.push({ type, start: offset + header, end: offset + size });
    offset += size;
  }
  return boxes;
}

function boxAt(bytes: Buffer, path: string[], within?: Mp4Box): Mp4Box {
  let parent = within;
  for (const type of path) {
    const found = mp4Boxes(bytes, parent?.start, parent?.end).find((box) => box.type === type);
    if (!found) {
      throw new Error(`MP4 has no ${path.join("/")} box`);
    }
    parent = found;
  }
  return parent!;
}

function optionalBox(bytes: Buffer, path: string[], within: Mp4Box): Mp4Box | undefined {
  try {
    return boxAt(bytes, path, within);
  } catch {
    return undefined;
  }
}

/** A full box's entries: `count` records of `width` 32-bit words after its version, flags and count. */
function entries(bytes: Buffer, box: Mp4Box, width: number): number[][] {
  const count = bytes.readUInt32BE(box.start + 4);
  return Array.from({ length: count }, (_, i) =>
    Array.from({ length: width }, (_, j) => bytes.readUInt32BE(box.start + 8 + (i * width + j) * 4)),
  );
}

function expandRuns(runs: number[][]): number[] {
  return runs.flatMap(([count, value]) => Array<number>(count).fill(value));
}

/** The video track's samples of a published MP4, read from its sample tables. */
export function mp4VideoSamples(bytes: Buffer): Mp4VideoSamples {
  const moov = boxAt(bytes, ["moov"]);
  const trak = mp4Boxes(bytes, moov.start, moov.end)
    .filter((box) => box.type === "trak")
    .find((box) => bytes.toString("latin1", boxAt(bytes, ["mdia", "hdlr"], box).start + 8, boxAt(bytes, ["mdia", "hdlr"], box).start + 12) === "vide");
  if (!trak) {
    throw new Error("MP4 has no video track");
  }
  const mdhd = boxAt(bytes, ["mdia", "mdhd"], trak);
  const timescale = bytes.readUInt32BE(mdhd.start + (bytes[mdhd.start] === 1 ? 20 : 12));
  const stbl = boxAt(bytes, ["mdia", "minf", "stbl"], trak);

  const stsd = boxAt(bytes, ["stsd"], stbl);
  const avc1 = mp4Boxes(bytes, stsd.start + 8, stsd.end)[0];
  if (avc1?.type !== "avc1") {
    throw new Error(`MP4 video track is ${avc1?.type}, not avc1`);
  }
  const avcC = boxAt(bytes, ["avcC"], { ...avc1, start: avc1.start + 78 });
  const description = [...bytes.subarray(avcC.start, avcC.end)];
  const hex = (value: number) => value.toString(16).padStart(2, "0");
  const codec = `avc1.${hex(description[1])}${hex(description[2])}${hex(description[3])}`;

  const deltas = expandRuns(entries(bytes, boxAt(bytes, ["stts"], stbl), 2));
  const ctts = optionalBox(bytes, ["ctts"], stbl);
  // Version 1 offsets are signed; read every offset as signed, which also holds for version 0's small values.
  const offsets = ctts ? expandRuns(entries(bytes, ctts, 2).map(([count, value]) => [count, value | 0])) : [];
  const stsz = boxAt(bytes, ["stsz"], stbl);
  const fixedSize = bytes.readUInt32BE(stsz.start + 4);
  const sampleCount = bytes.readUInt32BE(stsz.start + 8);
  const sizes = Array.from({ length: sampleCount }, (_, i) => fixedSize || bytes.readUInt32BE(stsz.start + 12 + i * 4));
  const stco = optionalBox(bytes, ["stco"], stbl);
  const chunkOffsets = stco
    ? entries(bytes, stco, 1).map(([offset]) => offset)
    : entries(bytes, boxAt(bytes, ["co64"], stbl), 2).map(([high, low]) => high * 2 ** 32 + low);
  const stsc = entries(bytes, boxAt(bytes, ["stsc"], stbl), 3);
  const stss = optionalBox(bytes, ["stss"], stbl);
  const keys = new Set(stss ? entries(bytes, stss, 1).map(([number]) => number - 1) : sizes.map((_, i) => i));

  const samples: Mp4Sample[] = [];
  let decodeTime = 0;
  for (let chunk = 0; chunk < chunkOffsets.length; chunk += 1) {
    const run = [...stsc].reverse().find(([firstChunk]) => firstChunk - 1 <= chunk)!;
    let offset = chunkOffsets[chunk];
    for (let i = 0; i < run[1] && samples.length < sampleCount; i += 1) {
      const index = samples.length;
      const presentation = decodeTime + (offsets[index] ?? 0);
      samples.push({ offset, size: sizes[index], timestamp: Math.round((presentation * 1e6) / timescale), key: keys.has(index) });
      offset += sizes[index];
      decodeTime += deltas[index];
    }
  }
  return { codec, description, samples };
}
