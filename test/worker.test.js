const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { createContext, runInContext } = require('node:vm');
const { loadApp } = require('./helpers/load-app');

function currentBoard(app) {
	return Array.from(runInContext('board', app));
}

function playWhiteMove(app, from = 12, to = 28) {
	app.handleSquareClick(from);
	app.handleSquareClick(to, true);
}

test('worker lataa pelilogiikan ja löytää kuningattaren syönnin ilman käyttöliittymää', () => {
	const responses = [];
	const worker = createContext({ postMessage: move => responses.push(structuredClone(move)) });
	worker.self = worker;

	worker.importScripts = (...filenames) => {
		for (const filename of filenames) {
			const path = require.resolve(`../public/${filename}`);
			runInContext(readFileSync(path, 'utf8'), worker, { filename: path });
		}
	};

	runInContext(readFileSync(require.resolve('../public/ai-worker.js'), 'utf8'), worker, {
		filename: require.resolve('../public/ai-worker.js')
	});


	const position = Object.assign(Array(64).fill(null), { 0: 'K', 63: 'k', 40: 'r', 24: 'Q' });
	const before = [...position];
	worker.onmessage({ data: { position, depth: 1 } });
	assert.deepEqual(responses, [{ from: 40, to: 24 }]);
	assert.deepEqual(position, before);
});

test('pelaajan vuoro lukitaan odotuksen ja laskennan ajaksi ja palautuu workerin vastattua', () => {
	const { app, workers, timers, runTimers, statusElement } = loadApp();
	playWhiteMove(app);

	const beforeReply = currentBoard(app);
	assert.equal(workers.length, 0);
	assert.equal(timers.size, 1);
	
	app.makePlayerMove({ from: 11, to: 27 });
	app.handleSquareClick(11);
	assert.equal(runInContext('selectedSquare', app), null);
	assert.deepEqual(currentBoard(app), beforeReply);

	runTimers();
	assert.equal(workers.length, 1);
	
	const worker = workers[0];
	assert.deepEqual(worker.messages[0].position, beforeReply);
	
	app.makeComputerMove();
	assert.equal(workers.length, 1);
	
	app.handleSquareClick(11);
	assert.equal(runInContext('selectedSquare', app), null);

	worker.respond({ from: 52, to: 36 });
	assert.equal(worker.terminated, true);
	assert.equal(currentBoard(app)[52], null);
	assert.equal(currentBoard(app)[36], 'p');
	assert.equal(runInContext('historia.length', app), 2);
	assert.match(statusElement.textContent, /Sun vuoro/);
	
	app.handleSquareClick(11);
	assert.equal(runInContext('selectedSquare', app), 11);
});

test('uusi peli peruu myös vielä käynnistymättömän tietokonevuoron', () => {
	const { app, workers, timers, runTimers } = loadApp();
	
	playWhiteMove(app);
	app.resetGame();
	assert.equal(timers.size, 0);
	
	runTimers();

	assert.equal(workers.length, 0);
	assert.deepEqual(currentBoard(app), Array.from(app.createInitialBoard()));
});

test('uusi peli lopettaa workerin eikä vanha vastaus häiritse uuden pelin hakua', () => {
	const { app, workers, runTimers, statusElement } = loadApp();
	playWhiteMove(app);

	runTimers();

	const oldWorker = workers[0];
	app.resetGame();
	assert.equal(oldWorker.terminated, true);

	playWhiteMove(app, 11, 27);
	
	runTimers();
	
	const newWorker = workers[1];
	const beforeReply = currentBoard(app);

	
	// simuloidaan ennen lopetusta jonoon ehtinyt vastaus ja virhe
	oldWorker.respond({ from: 52, to: 36 });
	oldWorker.onerror();
	assert.deepEqual(currentBoard(app), beforeReply);
	assert.equal(newWorker.terminated, false);
	assert.equal(runInContext('historia.length', app), 1);
	assert.match(statusElement.textContent, /Tietokoneen vuoro/);

	newWorker.respond({ from: 52, to: 36 });
	assert.equal(currentBoard(app)[36], 'p');
	assert.equal(currentBoard(app)[27], 'P');
});

test('workerin virhe näyttää ilmoituksen ja uuden pelin voi aloittaa', () => {
	const { app, workers, runTimers, statusElement } = loadApp();
	playWhiteMove(app);
	
	runTimers();

	workers[0].onerror();
	assert.equal(workers[0].terminated, true);
	assert.match(statusElement.textContent, /epäonnistui/);
	
	app.handleSquareClick(11);
	assert.equal(runInContext('selectedSquare', app), null);
	
	app.resetGame();
	app.handleSquareClick(12);
	assert.equal(runInContext('selectedSquare', app), 12);
});

test('workerin luomisen epäonnistuminen ei jätä peliä odottamaan vastausta', () => {
	const { app, runTimers, statusElement } = loadApp();
	app.Worker = class {
		constructor() { throw new Error('Workerin käynnistys estetty'); }
	};
	
	playWhiteMove(app);
	assert.doesNotThrow(() => runTimers());
	assert.match(statusElement.textContent, /epäonnistui/);
	assert.equal(runInContext('isComputerThinking', app), false);
});
