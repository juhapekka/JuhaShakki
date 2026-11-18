const { readFileSync } = require('node:fs');
const { createContext, runInContext } = require('node:vm');

// tässä pitää olla sama latausjärjestys kuin index.html:ssä
// app.js käynnistää pelin viimeisenä
const scripts = ['board.js', 'moves.js', 'ai.js', 'ui.js', 'app.js'].map(filename => ({
	filename,
	source: readFileSync(require.resolve(`../../public/${filename}`), 'utf8')
}));

// Testeille korvikeselain :) käyttöliittymän elementit pitää lisää tänne
function loadApp(difficulty = 'vaikea') {
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
		document: {
			querySelector: selector => elements[selector] ?? null,
			createElement: () => ({})
		}
	});
	for (const { filename, source } of scripts) {
		runInContext(source, app, { filename });
	}
	return { app, lauta, statusElement, difficultyElement, newGameElement };
}

module.exports = { loadApp };
