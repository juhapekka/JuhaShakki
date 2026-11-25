let computerWorker = null;
let computerMoveTimer = null;
let isComputerThinking = false;

// Uusi/valmistunut haku canceloi myös workerin
function cancelComputerMove() {
	clearTimeout(computerMoveTimer);
	computerMoveTimer = null;

	if (computerWorker)
		computerWorker.terminate();

	computerWorker = null;
	isComputerThinking = false;
}

function handleComputerError() {
	cancelComputerMove();
	isGameFinished = true;
	statusElement.textContent = 'Laskenta epäonnistui, aloita uusi peli!';
}

function checkForGameEnd(sideToMove) {
	const legalMoves = getLegalMoves(board, sideToMove);

	if (legalMoves.length)
		return false;

	const king = sideToMove == 'valkoinen' ? 'K' : 'k';
	const kingSquare = board.indexOf(king);
	const isCheckmate = isSquareAttacked(board, kingSquare, getOpponentColor(sideToMove));

	isGameFinished = true;

	if (isCheckmate) {
		statusElement.textContent = sideToMove == 'valkoinen' ? 'Matti - tietokone voitti' : 'Matti - sä voitit';
	} else {
		statusElement.textContent = 'Tasapeli.';
	}

	return true;
}

function makeComputerMove() {
	if (isGameFinished || computerWorker || checkForGameEnd('musta'))
		return;

	const difficulty = getSelectedDifficulty();
	isComputerThinking = true;
	statusElement.textContent = 'Tietokoneen vuoro...';

	try {
		const worker = new Worker('ai-worker.js');
		computerWorker = worker;

		worker.onmessage = ({ data: move }) => {
		// Jo lopetetun haun tulos ei saa muuttaa uuden pelin lautaa.
		if (computerWorker !== worker)
			return;

		cancelComputerMove();

		if (!move) {
			checkForGameEnd('musta');
			return;
		}

		board = applyMove(board, move);
		historia.push(encodeMove(move.from, move.to));
		statusElement.textContent = `Tietokone pleasi ${moveToString(move)}. Sun vuoro.`;
		renderBoard();
		checkForGameEnd('valkoinen');
		};

		worker.onerror = () => {
		if (computerWorker === worker)
			handleComputerError();
		};

		worker.postMessage({ position: board, depth: difficulty.depth });
	} catch {
		handleComputerError();
	}
}

function makePlayerMove(move) {
	if (isGameFinished || isComputerThinking)
		return;

	board = applyMove(board, move);
	historia.push(encodeMove(move.from, move.to));
	selectedSquare = null;
	renderBoard();

	if (!checkForGameEnd('musta')) {
		isComputerThinking = true;
		statusElement.textContent = 'Tietokoneen vuoro...';
		computerMoveTimer = setTimeout(() => {
		computerMoveTimer = null;
		makeComputerMove();
		}, 280);
	}

	/*
	for (const x of historia) {
		console.log(" " + (x&0x3f) + " " + (x>>6));
	}
	*/
	}

	function handleSquareClick(square, isTarget) {
	if (isGameFinished || isComputerThinking)
		return;

	if (selectedSquare != null && isTarget) {
		const selectedMove = getLegalMoves(board, 'valkoinen').find(move => move.from == selectedSquare && move.to == square);
		makePlayerMove(selectedMove);
		return;
	}

	if (getPieceColor(board[square]) == 'valkoinen') {
		selectedSquare = square;
		renderBoard();
	}

}

function resetGame() {
	cancelComputerMove();
	historia = [];
	isGameFinished = false;
	selectedSquare = null;
	const difficulty = getSelectedDifficulty();
	statusElement.textContent = `Sun siirto, sä pelaat valkoisilla. ${difficulty.name} vaikeus aste.`;
	board = createInitialBoard();
	renderBoard();
}

document.querySelector('#uusipeli').onclick = resetGame;
resetGame();
