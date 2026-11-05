const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { createContext, runInContext } = require('node:vm');

const source = readFileSync(require.resolve('../public/app.js'), 'utf8');

function loadApp() {
	const lauta = {
		children: [],
		replaceChildren() { this.children = []; },
		append(button) { this.children.push(button); }
	};
	const app = createContext({
		document: {
			querySelector: () => lauta,
			createElement: () => ({})
		}
	});

	runInContext(source, app);
	
	return { app, lauta };
}

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

test('kuninkaan siirrot eivät kierrä laudan reunan yli', () => {
	const { app } = loadApp();

	assert.deepEqual(targets(app, paikka({ 0: 'K', 63: 'k' }), 0), [1, 8, 9]);
});

test('nykyisessä aloitusasemassa kuningattaret estävät siirrot vasemmalle', () => {
	const { app } = loadApp();
	const board = app.createInitialBoard();
	
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

test('tavallisessa aloitusasemassa on 20 laillista siirtoa kummallekin värille', () => {
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

test('klikkaus korostaa valitun valkoisen nappulan lailliset kohteet', () => {
	const { app, boardElement } = loadApp();

	app.handleSquareClick(4);

	const highlighted = boardElement.children
		.map((button, index) => button.className.split(' ').includes('target')
		? app.getSquareDisplayOrder()[index] : null)
		.filter(square => square !== null)
		.sort((a, b) => a - b);
	
	assert.deepEqual(highlighted, [12, 13]);

	app.handleSquareClick(62);
	assert.equal(boardElement.children.some(button => button.className.split(' ').includes('target')), false);

	app.handleSquareClick(24);
	assert.equal(boardElement.children.some(button => button.className.split(' ').includes('target')), false);
});
