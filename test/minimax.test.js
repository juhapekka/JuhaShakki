const assert = require('node:assert/strict');
const { test } = require('node:test');
const { runInContext } = require('node:vm');
const { loadApp } = require('./helpers/load-app');

function paikka(pieces) {
	return Object.assign(Array(64).fill(null), pieces);
}

test('arviointi on mustan näkökulmasta ja suosii keskustaa', () => {
	const { app } = loadApp();

	assert.equal(app.evaluateSituationForBlack(app.createInitialBoard()), 0);
	assert.equal(app.evaluateSituationForBlack(paikka({ 0: 'K', 63: 'k', 27: 'q' })), 900);
	assert.equal(app.evaluateSituationForBlack(paikka({ 0: 'K', 63: 'k', 27: 'Q' })), -900);

	for (const tyyppi of ['p', 'n', 'b']) {
		const reunassa = app.evaluateSituationForBlack(paikka({ 8: tyyppi }));
		const keskustassa = app.evaluateSituationForBlack(paikka({ 27: tyyppi }));

		assert.ok(keskustassa > reunassa, `${tyyppi} hyötyy keskustasta`);
	}
});



test('nolla syvyydellä minimax palauttaa nykyisen aseman arvion', () => {
	const { app } = loadApp();

	const tilanne = paikka({ 0: 'K', 63: 'k', 40: 'r', 24: 'Q' });

	assert.equal(app.minimaxab(tilanne, 'musta', 0), -400);
	assert.equal(app.minimaxab(tilanne, 'valkoinen', 0), -400);
});


test('musta maksimoi ja valkoinen minimoi pisteitä syömällä vastustajan nappulan', () => {
	const { app } = loadApp();

	// musta voi syödä kuningattaren a4, valkoinen tornin a6
	const tilanne = paikka({ 0: 'K', 63: 'k', 40: 'r', 24: 'Q' });
	const ennen = [...tilanne];

	assert.equal(app.minimaxab(tilanne, 'musta', 1), 500);
	assert.equal(app.minimaxab(tilanne, 'valkoinen', 1), -900);
	assert.deepEqual(tilanne, ennen);
});

test('minimax tunnistaa matin ja patin hakusyvyyden rajalla', () => {
	const { app } = loadApp();
	
	// a8 kuningas on matissa: vastustajan kuningatar b7 ja kuningas c6
	const mustaMatissa = paikka({ 56: 'k', 49: 'Q', 42: 'K' });
	const valkoinenMatissa = paikka({ 56: 'K', 49: 'q', 42: 'k' });
	
	// kuningatar c7 sulkee pakoruudut uhkaamatta a8: patti
	const patti = paikka({ 56: 'k', 50: 'Q', 42: 'K' });


	for (const syvyys of [0, 2]) {
		assert.equal(app.minimaxab(mustaMatissa, 'musta', syvyys), -100000 - syvyys);
		assert.equal(app.minimaxab(valkoinenMatissa, 'valkoinen', syvyys), 100000 + syvyys);
		assert.equal(app.minimaxab(patti, 'musta', syvyys), 0);
	}
});

test('siirtohaku valitsee ilmaisen kuningattaren eikä muuta alkuperäistä lautaa', () => {
	const { app } = loadApp();
	const board = paikka({ 0: 'K', 63: 'k', 40: 'r', 24: 'Q' });
	const ennen = [...board];
	app.testBoard = board;
	runInContext('board = testBoard', app);
	const move = app.chooseSearchedMove(1);
	assert.equal(move.from, 40);
	assert.equal(move.to, 24);
	assert.deepEqual(board, ennen);
});

test('alpha-beta karsii turhat haarat molemmilla väreillä muuttamatta tulosta', () => {
	for (const vuoro of ['musta', 'valkoinen']) {
		const { app } = loadApp();
		
		const kerroin = vuoro == 'musta' ? 1 : -1;
		const arvioidut = [];

		// mustalle: max(min(3, 5), min(2, 100)) = 3.
		// valkoisella käytetään vastalukuja: min(max(-3, -5), max(-2, -100)) = -3.
		const tila = {
			lapaset: [
				{ lapaset: [{ pisteet: 3 * kerroin }, { pisteet: 5 * kerroin }] },
				{ lapaset: [{ pisteet: 2 * kerroin }, { pisteet: 100 * kerroin }] },
			]
		};

		// mini tunnettu hakupuu testaa karsinnan ilman shakkisääntöjä
		app.getLegalMoves = solmu => (solmu.lapaset || [{}]).map(tulos => ({ tulos }));
		app.applyMove = (solmu, move) => move.tulos;

		app.evaluateSituationForBlack = solmu => {
			arvioidut.push(solmu.pisteet);
			return solmu.pisteet;
		};

		assert.equal(app.minimaxab(tila, vuoro, 2), 3 * kerroin);
		assert.deepEqual(arvioidut, [3 * kerroin, 5 * kerroin, 2 * kerroin]);
	}
});
