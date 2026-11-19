const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadApp } = require('./helpers/load-app');

test('uusi peli näyttää valitun vaikeusasteen statustekstissä', () => {
	const { statusElement, difficultyElement, newGameElement } = loadApp();

	assert.match(statusElement.textContent, /Normaali/);

	difficultyElement.value = 'difficult';
	newGameElement.onclick();
	assert.match(statusElement.textContent, /vaikea/i);
});

test('tietokone lukee valitun vaikeusateen ja käyttää oikeaa hakusyvyyttä', () => {
	const { app, difficultyElement } = loadApp();
	let hakusyvyys;
	
	// Katotaan haulle menevä syvyys ilman hakua
	app.chooseSearchedMove = (position, depth) => {
		assert.deepEqual(Array.from(position), Array.from(app.createInitialBoard()));
		hakusyvyys = depth;
		return undefined;
	};

	for (const [vaikeus, odotettuSyvyys] of [['easy', 0], ['normal', 1], ['difficult', 2]]) {
		hakusyvyys = undefined;
		difficultyElement.value = vaikeus;
		app.makeComputerMove();
		assert.equal(hakusyvyys, odotettuSyvyys, vaikeus);
	}
});
