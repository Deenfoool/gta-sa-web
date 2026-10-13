// No server calls or game-data persistence. This module only reads metadata and a bounded IMG index.
export const REQUIRED = Object.freeze(['data/gta.dat', 'models/gta3.img', 'anim/ped.ifp']);
export const OPTIONAL = Object.freeze(['models/gta_int.img', 'models/txd.img', 'data/default.dat']);
const ROOT_DIRS = new Set(['data', 'models', 'anim', 'text', 'audio', 'movies', 'player', 'vehicles']);

export function normalizeGamePath(path) {
  const pieces = String(path).replaceAll('\\', '/').split('/').filter(Boolean);
  const start = pieces.findIndex((part) => ROOT_DIRS.has(part.toLowerCase()));
  return (start < 0 ? pieces : pieces.slice(start)).join('/').toLowerCase();
}
export function summarizeInstall(records) {
  const index = new Map();
  for (const record of records) {
    const path = normalizeGamePath(record.path);
    if (path && !index.has(path)) index.set(path, record.file);
  }
  return {
    total: records.length,
    files: index,
    required: REQUIRED.map((path) => ({ path, found: index.has(path), size: index.get(path)?.size ?? 0 })),
    optional: OPTIONAL.map((path) => ({ path, found: index.has(path) })),
    valid: REQUIRED.every((path) => index.has(path)),
  };
}
export function formatBytes(size) {
  if (!Number.isFinite(size) || size < 0) return '?';
  if (size < 1024) return size + ' B';
  const units = ['KB', 'MB', 'GB', 'TB'];
  const power = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length);
  return (size / 1024 ** power).toFixed(1) + ' ' + units[power - 1];
}
export async function readImgDirectory(file) {
  if (!file || typeof file.slice !== 'function') throw new Error('Missing IMG file');
  const header = new DataView(await file.slice(0, 8).arrayBuffer());
  if (header.byteLength !== 8) throw new Error('IMG header is truncated');
  const signature = String.fromCharCode(...new Uint8Array(header.buffer, 0, 4));
  if (signature !== 'VER2') throw new Error('Unsupported IMG format (expected VER2)');
  const count = header.getUint32(4, true);
  if (count > 300000 || 8 + count * 32 > file.size) throw new Error('Invalid or truncated IMG directory');
  // Read the table only: do not buffer the potentially multi-gigabyte archive.
  const bytes = await file.slice(8, 8 + count * 32).arrayBuffer();
  const view = new DataView(bytes);
  const names = [];
  let outOfBounds = 0;
  for (let i = 0; i < count; i++) {
    const off = i * 32;
    const sector = view.getUint32(off, true);
    const sectors = view.getUint16(off + 6, true) || view.getUint16(off + 4, true);
    const nameBytes = new Uint8Array(bytes, off + 8, 24);
    const terminator = nameBytes.indexOf(0);
    const name = new TextDecoder('ascii').decode(terminator < 0 ? nameBytes : nameBytes.subarray(0, terminator));
    if (sector * 2048 + sectors * 2048 > file.size) outOfBounds++;
    if (i < 5) names.push(name);
  }
  return { version: signature, count, sample: names, outOfBounds };
}
export async function collectFromDirectory(root, onProgress = () => {}) {
  const records = [];
  async function visit(directory, prefix) {
    for await (const [name, handle] of directory.entries()) {
      const path = prefix ? prefix + '/' + name : name;
      if (handle.kind === 'directory') await visit(handle, path);
      else if (handle.kind === 'file') {
        records.push({ path, file: await handle.getFile() });
        if (records.length % 250 === 0) onProgress(records.length);
      }
    }
  }
  await visit(root, '');
  return records;
}
