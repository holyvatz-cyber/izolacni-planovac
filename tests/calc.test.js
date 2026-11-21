// Spuštění: node tests/calc.test.js
const assert = require('assert');
const K = require('../js/calc.js');
const ctx = { level: 'doporucena', priority: 'vyvazeny' };

assert.deepStrictEqual(K.bestFill([60, 80, 100, 120, 140, 160], 170).total, 160);
assert.deepStrictEqual(K.bestCover([50, 100, 140], 185).parts, [140, 50]);
assert.deepStrictEqual(K.bestCover([50, 80, 140], 125).parts, [140]);

const roof = K.recommend({ type: 'sikma', mode: 'plocha', area: 100, frameDepth: 160, frameWidth: 80, frameSpacing: 900, maxExtra: 100 }, ctx);
assert.ok(roof.ok && roof.U <= 0.16, 'střecha splní doporučenou hodnotu');
assert.ok(roof.acc.some((a) => a.id === 'lds100'), 'střecha má parozábranu');

const wall = K.recommend({ type: 'etics', mode: 'rozmery', perimeter: 40, height: 6, openings: 30, wall: 'cp450' }, ctx);
assert.strictEqual(wall.area, 210);
assert.ok(wall.U <= 0.25);

const fail = K.recommend({ type: 'sikma', mode: 'plocha', area: 50, frameDepth: 100, frameWidth: 80, frameSpacing: 900, maxExtra: 0 }, { ...ctx, level: 'pasivni' });
assert.ok(!fail.ok && fail.warnings.length, 'nedosažitelný cíl hlásí varování');

const agg = K.aggregate([roof, wall]);
agg.insulation.forEach((l) => assert.ok(l.packs * l.perPack >= l.m2 - 1e-9));
console.log('Všechny testy prošly.');

// ploché střechy a podlahy
const flat = K.recommend({ type: 'plocha', mode: 'rozmery', len: 12, wid: 10, deck: 'zb', use: 'nepochozi', fixing: 'kotvena' }, ctx);
assert.ok(flat.ok && flat.U <= 0.16);
const up = flat.layers[0].total; const total = flat.layers.reduce((s, l) => s + l.total, 0);
assert.ok(up >= 60 && up >= total / 3 - 10, 'horní vrstva min. 60 mm a ~1/3 tloušťky');
assert.ok(flat.acc.some((a) => a.id === 'lds35'));
const floor = K.recommend({ type: 'podlaha', mode: 'rozmery', len: 5, wid: 4, floorType: 'beton', load: '200', slab: '160' }, ctx);
assert.strictEqual(floor.layers[0].product, 'ptn');
assert.strictEqual(floor.impact.lnw, 48);
assert.ok(floor.acc.some((a) => a.id === 'edge100' && Math.abs(a.need - 18.9) < 0.01));
console.log('Testy plochých střech a podlah prošly.');
