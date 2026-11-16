const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadApp } = require('./helpers/load-app');

function paikka(pieces) {
	return Object.assign(Array(64).fill(null), pieces);
}

function targets(app, board, from) {
	const moves = app.getLegalMoves(board, app.getPieceColor(board[from]));

	return Array.from(moves).filter(move => move.from === from).map(move => move.to).sort((a, b) => a - b);
}

test('kuningas voi siirtyä kaikkiin kahdeksaan viereiseen ruutuun', () => {
	const { app } = loadApp();

	assert.deepEqual(targets(app, paikka({ 27: 'K', 63: 'k' }), 27), [18, 19, 20, 26, 28, 34, 35, 36]);
});

test('kuninkaan siirrot ei kierrä laudan reunan yli', () => {
	const { app } = loadApp();

	assert.deepEqual(targets(app, paikka({ 0: 'K', 63: 'k' }), 0), [1, 8, 9]);
});

test('sotilaattomassa asemassa kuningattaret estävät siirrot vasemmalle', () => {
	const { app } = loadApp();
	const board = paikka({
		0: 'R', 1: 'N', 2: 'B', 3: 'Q', 4: 'K', 5: 'B', 6: 'N', 7: 'R',
		56: 'r', 57: 'n', 58: 'b', 59: 'q', 60: 'k', 61: 'b', 62: 'n', 63: 'r'
	});
	
	assert.equal(board[62], 'n');
	assert.equal(board[61], 'b');
	assert.deepEqual(targets(app, board, 4), [12, 13]);

	board[3] = null;
	assert.deepEqual(targets(app, board, 4), [12, 13]);

	board[59] = null;
	assert.deepEqual(targets(app, board, 4), [3, 11, 12, 13]);
});

test('kuningas ei voi siirtyä sotilaan, ratsun tai kuninkaan uhkaamaan ruutuun', () => {
	const { app } = loadApp();

	for (const board of [
		paikka({ 4: 'K', 63: 'k', 21: 'p' }),
		paikka({ 4: 'K', 63: 'k', 29: 'n' }),
		paikka({ 4: 'K', 20: 'k' })
	]) {
		assert.equal(targets(app, board, 4).includes(12), false);
	}
});

test('kuninkaan siirron tai syönnin paljastama tornin uhka estää siirron', () => {
	const { app } = loadApp();
	
	assert.equal(targets(app, paikka({ 12: 'K', 63: 'k', 8: 'r' }), 12).includes(13), false);
	assert.equal(targets(app, paikka({ 4: 'K', 63: 'k', 12: 'n', 60: 'r' }), 4).includes(12), false);
});

test('tavallisessa aloitusasemassa on 20 laillista siirtoa molemmille pelaajille', () => {
	const { app } = loadApp();

	const boardi = [
		...'RNBQKBNR', ...'PPPPPPPP',
		...Array(32).fill(null),
		...'pppppppp', ...'rnbqkbnr'
	];
	const ennen = [...boardi];

	assert.equal(app.getLegalMoves(boardi, 'valkoinen').length, 20);
	assert.equal(app.getLegalMoves(boardi, 'musta').length, 20);

	assert.deepEqual(boardi, ennen);
});

test('klikkaus korostaa valitun valkoisen nappulan lailliset siirrot', () => {
	const { app, lauta } = loadApp();

	// e2 sotilas voi siirtyä ruutuihin e3 ja e4
	app.handleSquareClick(12);

	const highlighted = lauta.children
		.map((button, index) => button.className.split(' ').includes('target')
		? app.getSquareDisplayOrder()[index] : null)
		.filter(square => square !== null)
		.sort((a, b) => a - b);
	
	assert.deepEqual(highlighted, [20, 28]);

	// toisen pejaana nappulan tai tyhjän ruudun klikkaus ei vaihda valittua nappulaa
	app.handleSquareClick(62);
	app.handleSquareClick(24);
	assert.equal(lauta.children.filter(button => button.className.split(' ').includes('target')).length, 2);
});
