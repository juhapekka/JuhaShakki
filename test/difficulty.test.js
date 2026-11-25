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
	const { app, difficultyElement, workers } = loadApp();

	for (const [vaikeus, odotettuSyvyys] of [['easy', 0], ['normal', 2], ['difficult', 5]]) {
		difficultyElement.value = vaikeus;
		app.makeComputerMove();
		const worker = workers.at(-1);
		assert.equal(worker.filename, 'ai-worker.js');
		assert.equal(worker.messages[0].depth, odotettuSyvyys, vaikeus);
		assert.deepEqual(worker.messages[0].position, Array.from(app.createInitialBoard()));
		app.resetGame();
	}
});
