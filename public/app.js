//alert("Hello world!");

/*
    <h2>♙♘♗♖♕♔</h2>
    <h2>♟♞♝♜♛♚</h2>
*/

const boardElement = document.querySelector('#board');

//lauta
let board;


function getSquareDisplayOrder() {
  const squares = [];

  // 8 rivi on eka jolloin valkoset tulee alariviin
  for (let r = 7; r >= 0; r -= 1)
    for (let ff = 0; ff < 8; ff += 1)
        squares.push(ff + r * 8);

  return squares;
}

function squareName(square) {
  return String.fromCharCode(97 + (square & 7)) + ((square >> 3) + 1);
}

function createSquareButton(square) {
  const piece = null;
  const isLightSquare = ((square & 7) + (square >> 3)) % 2 === 0;

  const button = document.createElement('button');
  button.className = [
    'square',
    isLightSquare ? 'light' : 'dark',
  ].filter(Boolean).join(' ');
  button.textContent = '';
  return button;
}

function renderBoard() {
  boardElement.replaceChildren();
  for (const square of getSquareDisplayOrder()) {
    boardElement.append(createSquareButton(square));
  }
}

renderBoard();