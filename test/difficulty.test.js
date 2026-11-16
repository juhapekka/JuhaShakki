const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadApp } = require('./helpers/load-app');

test('uusi peli näyttää valitun vaikeusasteen statustekstissä', () => {
	const { statusElement, difficultyElement, newGameElement } = loadApp();

	assert.match(statusElement.textContent, /vaikea/i);

	difficultyElement.value = 'normaali';
	newGameElement.onclick();
	assert.match(statusElement.textContent, /Normaali/);
});

test('tietokone lukee valitun vaikeusateen ja käyttää oikeaa hakusyvyyttä', () => {
	const { app, difficultyElement } = loadApp();
	let hakusyvyys;
	
	// Katotaan haulle menevä syvyys ilman hakua
	app.chooseSearchedMove = syvyys => {
		hakusyvyys = syvyys;
		return undefined;
	};

	for (const [vaikeus, odotettuSyvyys] of [['helppo', 0], ['normaali', 1], ['vaikea', 2]]) {
		hakusyvyys = undefined;
		difficultyElement.value = vaikeus;
		app.makeComputerMove();
		assert.equal(hakusyvyys, odotettuSyvyys, vaikeus);
	}
});
