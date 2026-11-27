const { readFileSync } = require('node:fs');
const { createContext, runInContext } = require('node:vm');

// tässä pitää olla sama latausjärjestys kuin index.html:ssä
// app.js käynnistää pelin viimeisenä
// Absoluuttinen tiedostopolku yhdistää vm-koodin kattavuusraportissa lähdetiedostoon.
const scripts = ['board.js', 'moves.js', 'ai.js', 'ui.js', 'app.js'].map(filename => ({
	filename: require.resolve(`../../public/${filename}`),
	source: readFileSync(require.resolve(`../../public/${filename}`), 'utf8')
}));

// Testeille korvikeselain :) käyttöliittymän elementit pitää lisää tänne
function loadApp(difficulty = 'normal') {
	const workers = [];
	const timers = new Map();
	let nextTimerId = 1;
	// worker ja ajastimet käynnistetään testeissä hallitusti
	class TestWorker {
		constructor(filename) {
			this.filename = filename;
			this.messages = [];
			this.terminated = false;
			workers.push(this);
		}
		postMessage(message) { this.messages.push(structuredClone(message)); }
		terminate() { this.terminated = true; }
		respond(move) { this.onmessage({ data: structuredClone(move) }); }
	}
	function runTimers() {
		const callbacks = [...timers.values()];
		timers.clear();
		for (const callback of callbacks)
			callback();
	}

	const lauta = {
		children: [],
		replaceChildren() { this.children = []; },
		append(button) { this.children.push(button); }
	};
	const statusElement = { textContent: '' };
	const difficultyElement = { value: difficulty };
	const newGameElement = {};
	const elements = {
		'#board': lauta,
		'#status': statusElement,
		'#vaikeus': difficultyElement,
		'#uusipeli': newGameElement
	};
	const app = createContext({
		Worker: TestWorker,
		setTimeout: callback => {
			const id = nextTimerId++;
			timers.set(id, callback);
			return id;
		},
		clearTimeout: id => timers.delete(id),
		document: {
			querySelector: selector => elements[selector] ?? null,
			createElement: () => ({})
		}
	});
	for (const { filename, source } of scripts) {
		runInContext(source, app, { filename });
	}
	return { app, lauta, statusElement, difficultyElement, newGameElement, workers, timers, runTimers };
}

module.exports = { loadApp };
