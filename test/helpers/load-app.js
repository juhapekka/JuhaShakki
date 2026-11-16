const { readFileSync } = require('node:fs');
const { createContext, runInContext } = require('node:vm');

const source = readFileSync(require.resolve('../../public/app.js'), 'utf8');

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
	runInContext(source, app);
	return { app, lauta, statusElement, difficultyElement, newGameElement };
}

module.exports = { loadApp };
