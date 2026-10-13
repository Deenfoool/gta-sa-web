import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGamePath, summarizeInstall, readImgDirectory } from '../src/importer.js';
test('normalizes case-insensitive paths and discards selected folder prefix', () => {
  assert.equal(normalizeGamePath('GTA San Andreas\\Models\\GTA3.IMG'), 'models/gta3.img');
  assert.equal(normalizeGamePath('data/gta.dat'), 'data/gta.dat');
});
test('detects missing files without mistaking optional files for required files', () => {
  const dummy = new Blob(['x']);
  const data = summarizeInstall([{path:'SA/data/gta.dat',file:dummy},{path:'SA/MODELS/GTA3.IMG',file:dummy}]);
  assert.equal(data.valid,false); assert.equal(data.required[2].path,'anim/ped.ifp');
  const all = summarizeInstall([{path:'anim/ped.ifp',file:dummy},{path:'data/gta.dat',file:dummy},{path:'models/gta3.img',file:dummy}]);
  assert.equal(all.valid,true);
});
test('parses IMG VER2 directory without loading archive data', async () => {
  const data = new Uint8Array(8 + 32 + 4096);
  data.set([86,69,82,50],0); new DataView(data.buffer).setUint32(4,1,true);
  const view = new DataView(data.buffer); view.setUint32(8,1,true); view.setUint16(8+6,1,true);
  data.set(new TextEncoder().encode('test.dff'),8+8);
  const result = await readImgDirectory(new Blob([data]));
  assert.equal(result.version,'VER2'); assert.equal(result.count,1);
  assert.deepEqual(result.sample,['test.dff']); assert.equal(result.outOfBounds,0);
});
test('rejects non VER2 IMG files', async () => {
  await assert.rejects(readImgDirectory(new Blob([new Uint8Array(8)])), /Unsupported IMG/);
});
