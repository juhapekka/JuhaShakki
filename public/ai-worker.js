importScripts('board.js', 'moves.js', 'ai.js');

self.onmessage = ({ data }) => {
	const move = chooseSearchedMove(data.position, data.depth);
	self.postMessage(move);
};
