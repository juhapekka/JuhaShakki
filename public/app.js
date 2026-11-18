const boardElement = document.querySelector('#board');
const statusElement = document.querySelector('#status');

//lauta
let board;
let selectedSquare = null;
let historia;
let isGameFinished;

// Laudalla on shakkikoodit ('P', 'n, jne) Tehdään taulut missä
// on koko nimet mitkä yhdistää shakkikoodit näkyviin merkkeihin
const PIECE_GLYPHS = Object.freeze({
  valkoinenSotilas: '♙',
  valkoinenHevonen: '♘',
  valkoinenLahetti: '♗',
  valkoinenTorni: '♖',
  valkoinenKuningatar: '♕',
  valkoinenKuningas: '♔',
  mustaSotilas: '♟',
  mustaHevonen: '♞',
  mustaLahetti: '♝',
  mustaTorni: '♜',
  mustaKuningatar: '♛',
  mustaKuningas: '♚'
});

const PIECE_NAMES = Object.freeze({
  p: 'Sotilas',
  n: 'Hevonen',
  b: 'Lahetti',
  r: 'Torni',
  q: 'Kuningatar',
  k: 'Kuningas'
});

// nappuloiden arvostus
const PIECE_VALUES = Object.freeze({
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0
});

const VAIKEUS_ASETUKSET = Object.freeze({
  helppo: { nimi: 'Helppo', syvyys: 0 },
  normaali: { nimi: 'Normaali', syvyys: 1 },
  vaikea: { nimi: 'vaikea', syvyys: 2 }
});

const difficultyElement = document.querySelector('#vaikeus');

function getSquareDisplayOrder() {
  const squares = [];

  // 8 rivi on eka jolloin valkoset tulee alariviin
  for (let r = 7; r >= 0; r -= 1)
    for (let ff = 0; ff < 8; ff += 1)
        squares.push(ff + r * 8);

  return squares;
}

function getPieceGlyph(piece) {
  if (!piece)
    return '';

  const colorName = getPieceColor(piece);
  const pieceName = PIECE_NAMES[piece.toLowerCase()];
  return PIECE_GLYPHS[`${colorName}${pieceName}`];
}

function isWhiteTargetSquare(square) {
  if (selectedSquare == null)
    return false;

  return getLegalMoves(board, 'valkoinen').some(move => move.from == selectedSquare && move.to == square);
}


function createSquareButton(square) {
  const piece = board[square];
  const colorName = getPieceColor(piece);
  const isLightSquare = (column(square) + row(square)) % 2 === 0;
  const isSelected = selectedSquare === square;
  const isTarget = isWhiteTargetSquare(square);

  if (isSelected)
      console.log("isSelected");

  const button = document.createElement('button');
  button.className = [
    'square',
    isLightSquare ? 'light' : 'dark',
    isSelected ? 'selected' : '',
    isTarget ? 'target' : '',
    piece ? 'piece' : '',
    piece ? `${colorName}-nappula` : ''
  ].filter(Boolean).join(' ');
  button.textContent = getPieceGlyph(piece);
  button.onclick = () => handleSquareClick(square, isTarget);
  return button;
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

function asetaVaikeus() {
  return VAIKEUS_ASETUKSET[difficultyElement.value];
}

function makeComputerMove() {
  if (isGameFinished || checkForGameEnd('musta'))
    return;

  vaikeus = asetaVaikeus();


  //console.log("syvyys " + vaikeus.syvyys);
  move = chooseSearchedMove(vaikeus.syvyys);

  if (!move)
    return;

  board = applyMove(board, move);
  
  historia.push(encodeMove(move.from, move.to));

  statusElement.textContent = `Tietokone pleasi ${moveToString(move)}. Sun vuoro.`;
  renderBoard();
  checkForGameEnd('valkoinen');
}

function makePlayerMove(move) {
  board = applyMove(board, move);
  historia.push(encodeMove(move.from, move.to));
  selectedSquare = null;
  renderBoard();

  if (!checkForGameEnd('musta')) {
    statusElement.textContent = 'Tietokoneen vuoro...';
    setTimeout(makeComputerMove, 280);
  }

  /*
  for (const x of historia) {
    console.log(" " + (x&0x3f) + " " + (x>>6));
  }
  */
}

function handleSquareClick(square, isTarget) {
  if (isGameFinished)
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

function renderBoard() {
  boardElement.replaceChildren();
  for (const square of getSquareDisplayOrder()) {
    boardElement.append(createSquareButton(square));
  }
}

function resetGame() {
  historia = [];
  isGameFinished = false;
  selectedSquare = null;
  vaikeus = asetaVaikeus();
  statusElement.textContent = `Sun siirto, sä pelaat valkoisilla. ${vaikeus.nimi} vaikeus aste.`;
  board = createInitialBoard();
  renderBoard();
}

document.querySelector('#uusipeli').onclick = resetGame;
resetGame();