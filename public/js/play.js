const generateCell = (id) => {
  let cell = document.createElement("td");
  if (id < 10) {
    id = `0_${id}`;
  }
  cell.id = id;
  return cell;
};

const getClassFor = (pieceID) => {
  let pieces = {
    'B': 'bomb',
    'F': 'flag',
    'S': 'spy',
    'O': 'opponent',
    'X': 'lake',
    '2': 'scout',
    '3': 'miner',
    '4':'sergeant',
    '5':'lieutenant',
    '6':'captain',
    '7':'major',
    '8':'colonel',
    '9': 'general',
    '10': 'marshal',
    'O_B': 'bomb-O',
    'O_F': 'flag-O',
    'O_S': 'spy-O',
    'O_2': 'scout-O',
    'O_3': 'miner-O',
    'O_4':'sergeant-O',
    'O_5':'lieutenant-O',
    'O_6':'captain-O',
    'O_7':'major-O',
    'O_8':'colonel-O',
    'O_9': 'general-O',
    'O_10': 'marshal-O'
  };
  return pieces[pieceID];
};

const highlightMoves = (potentialMoves) => {
  potentialMoves.freeMoves.forEach(function(move) {
    let pos = document.getElementById(move);
    pos.classList.add('free-move');
  });
  potentialMoves.attackMoves.forEach(function(move) {
    let pos = document.getElementById(move);
    pos.classList.add('attacking-move');
  });
};

const removeHighlight = (moves) => {
  if (moves) {
    moves = moves.attackMoves.concat(moves.freeMoves);
    moves.forEach(function(posID) {
      let move = document.getElementById(posID);
      move.classList.remove('attacking-move');
      move.classList.remove('free-move');
    });
  }
};

let potentialMoves;

const getLocation = (event) => {
  let target = event.target;
  if (target.tagName == 'IMG') {
    target = target.parentNode;
  }
  let postData = `location=${target.id}`;
  const reqListener = function() {
    if (this.responseText) {
      removeHighlight(potentialMoves);
      potentialMoves = JSON.parse(this.responseText);
      return highlightMoves(potentialMoves);
    }
    setTimeout(() => {
      removeHighlight(potentialMoves);
    }, 500);
  };
  const onFail = function() {};
  doXhr('/selectedLoc', 'POST', reqListener, postData, onFail);
};

const drawGrid = (containerId, numOfRows, numOfCols, initialID, idGrowth) => {
  let grid = document.getElementById(containerId);
  for (let rows = 0; rows < numOfRows; rows++) {
    let row = generateRow(initialID, numOfCols);
    initialID += idGrowth;
    grid.appendChild(row);
  }
  grid.addEventListener('click', getLocation);
};

const appendImage = (baseCell, id, imgSrcDirectory) => {
  let basePosition = document.getElementById(baseCell.id);
  let classForPieceId = getClassFor(id);
  if (!basePosition.classList.contains('attacking-move')) {
    basePosition.className = '';
  }
  if (basePosition.classList.contains('attacking-move')) {
    basePosition.classList.add('attacking-move');
    return basePosition.classList.add(classForPieceId);
  }
  basePosition.className = classForPieceId;
};

const updateEmptyCell = (cell) => {
  if (cell.className) {
    if (cell.classList.contains('free-move')) {
      cell.className = 'free-move';
      return;
    }
    cell.className = '';
  }
};

const showBattlefield = (battlefield, imgSrcDirectory) => {
  let locations = Object.keys(battlefield);
  locations.forEach(function(location) {
    let cell = document.getElementById(location);
    if (battlefield[location] == "E") {
      return updateEmptyCell(cell);
    }
    appendImage(cell, battlefield[location], imgSrcDirectory);
  });
};

const sureToLeave = () => {
  document.getElementById('leave').style.display = 'block';
};

const hidePopup = () => {
  document.getElementById('leave').style.display = 'none';
};

const rematch = () => {
  document.getElementById('leave-battle').style.display = 'none';
  let playAgain = document.querySelector('#play-again');
  playAgain.style.display = 'block';
  document.getElementById("turn-msg").style.display = 'none';
  let grid = document.querySelector("#battlefield-table");
  grid.removeEventListener('click', getLocation);
};

const announceWinner = (gameData) => {
  if(!gameData.winner){
    document.querySelector('.draw').style.display = 'block';
  }else{
    document.querySelector(`.${gameData.winner}`).style.display = 'block';
  }
};

const getFirstCellId = function(team) {
  let firstRow = document.querySelector(`#${team}`).childNodes[1];
  return firstRow.childNodes[0].id;
};

const incrementId = function(id) {
  let next = +(id.split('_').join(''))+1;
  return next.toString().split('').join('_');
};

const getHoriPath = function(initial, last) {
  let path = [];
  let prevPos = initial.yCor;
  let currentPos = last.yCor;
  do {
    path.push(`${initial.xCor}_${prevPos}`);    
    if (prevPos < currentPos) {
      prevPos++;
    } else {
      prevPos--;
    }
  } while (currentPos != prevPos);
  return path;
};

const getVertPath = function(initial, last) {
  let path = [];
  let prevPos = initial.xCor;
  let currentPos = last.xCor;
  do {
    path.push(`${prevPos}_${initial.yCor}`);    
    if (prevPos < currentPos) {
      prevPos++;
    } else {
      prevPos--;
    }
  } while (currentPos != prevPos);
  return path;
};

let getCoordinate = function(id) {
  return {
    xCor: +id[0],
    yCor: +id[2]
  };
};

let isSameRow = function(first, second) {
  return first.xCor == second.xCor;
};

const getPath = function(positions) {
  let initial = positions[0];
  let last = positions[1];
  let prev = getCoordinate(initial);
  let current = getCoordinate(last);
  if (isSameRow(prev, current)) {
    return getHoriPath(prev, current);
  }
  return getVertPath(prev, current);
};

const updateKilledPieces = function(cellId,pieceId,count,team){
  let pieceClass = getClassFor(team+pieceId);
  document.getElementById(cellId).className = pieceClass;
  document.getElementById(cellId).classList.add('count');
  document.getElementById(cellId).innerText = count;
};

const showCapturedArmy = function(army, team, cellId) {
  let killedPieces = Object.keys(army);
  killedPieces.forEach(pieceId => {
    let count = army[pieceId];
    updateKilledPieces(cellId,pieceId,count,team);
    cellId = incrementId(cellId);
  });
};

const showKilledPieces = (killedPieces, myArmy, oppArmy) => {
  let troopsLost = killedPieces[myArmy];
  let troopsCaptured = killedPieces[oppArmy];
  let firstRedCell = getFirstCellId('troops-lost');
  let firstBlueCell = getFirstCellId('troops-captured');
  showCapturedArmy(troopsLost, '', firstRedCell);
  showCapturedArmy(troopsCaptured, 'O_', firstBlueCell);
};

const highlightFreeMoves = (updatedLocs) => {
  let path = getPath(updatedLocs);
  path.forEach((pos) => {
    document.getElementById(pos).classList.add('start-move');
  });
  document.getElementById(updatedLocs[1]).classList.add('last-move');
};

let freeMoves = [];

const deemphasizeFreeMoves = () => {
  if (freeMoves.length > 0) {
    let path = getPath(freeMoves);
    path.forEach((pos) => {
      document.getElementById(pos).classList.remove('start-move');
    });
    document.getElementById(freeMoves[1]).classList.remove('last-move');
  }
};

const updateBattlefield = (gameData, myArmy, oppArmy) => {
  let battlefield = gameData['battlefield'];
  let killedPieces = gameData['killedPieces'];
  showBattlefield(battlefield, myArmy);
  killedPieces && showKilledPieces(killedPieces, myArmy, oppArmy);
};

const changePosition = function(positions){
  let startPos = positions[0];
  let piece = document.getElementById(startPos);
  let pieceClass = piece.className;
  let secondPos = positions[1];
  let newLoc = document.getElementById(secondPos);
  newLoc.className = pieceClass;
  piece.removeAttribute('class');
};

const getFirstEmptyCell = function(table){
  let firstCellId = table.querySelector('tr td:first-child').id;  
  let firstEmptyCell;
  do {
    firstEmptyCell = table.querySelector(`tr [id="${firstCellId}"]`);
    firstCellId = incrementId(firstCellId);
  } while (!firstEmptyCell.innerText=="");
  return firstEmptyCell;
};

const updateTroops = function(pieceClass,capturedTroops){
  let capturedPiece = capturedTroops.querySelector(`.${pieceClass}`);
  if(capturedPiece){
    ++capturedPiece.innerText;
    return;
  }
  let firstEmptyCell = getFirstEmptyCell(capturedTroops);
  firstEmptyCell.className = pieceClass;
  firstEmptyCell.classList.add('count');
  firstEmptyCell.innerText=1;
};

const updateKilledPieceCount = function(killedPieces){
  let lostTroop = document.getElementById('troops-lost');
  let capturedTroops = document.getElementById('troops-captured');
  killedPieces.forEach(killedPiece=>{
    let piece = document.getElementById(killedPiece);
    let pieceClass = piece.className.split(' ')[0];
    if(pieceClass.endsWith('-O')){
      updateTroops(pieceClass,capturedTroops);
      return;
    }  
    updateTroops(pieceClass,lostTroop);
  });
};

const updateBattlePosition = function(killedPiecesPos,movePositions){
  if(killedPiecesPos.length==2){
    document.getElementById(killedPiecesPos[0]).removeAttribute('class');
    document.getElementById(killedPiecesPos[1]).removeAttribute('class');
    return;
  }
  let killPiecePos = movePositions.find(pos=>pos==killedPiecesPos[0]);  
  document.getElementById(killPiecePos).removeAttribute('class');
  if(killPiecePos == movePositions[1]){
    let pieceClass = document.getElementById(movePositions[0]).className;
    document.getElementById(killPiecePos).className = pieceClass;
    document.getElementById(killPiecePos).classList.remove('start-move');
    document.getElementById(movePositions[0]).removeAttribute('class');
  }
};

const revealBattlePiece = function(revealPiece){
  let revealPos = revealPiece.loc;
  let pieceClass = getClassFor(revealPiece.pieceId);
  document.getElementById(revealPos).className = pieceClass;
};

const hideBattlePiece = function(revealedPieces){
  revealedPieces.forEach(revealPiece=>{
    let piece = document.getElementById(revealPiece);
    if(!piece){
      return;
    }
    let pieceClass = piece.className;
    if(pieceClass.endsWith('-O')){
      piece.removeAttribute('class');
      piece.className ='opponent';
    } 
  });
};

const showRevealedBattlefield = function(myArmy,oppArmy){
  let reqListener = function() {
    let gameData = JSON.parse(this.responseText);
    updateBattlefield(gameData, myArmy, oppArmy);
  };
  doXhr('/revealedBattlefield', 'POST', reqListener, null, () => {});
};

const updateChanges = (gameData, myArmy, oppArmy) => {
  let status = gameData.status;
  let killedPieces = gameData['killedPieces'];
  let revealPiece = gameData['revealPiece'];
  let turnBox = document.getElementById('turn-msg');
  if(gameData.turnMsg.includes('You')){
    turnBox.classList.add('your-turn');
  }else {
    turnBox.classList.remove('your-turn');
  }
  turnBox.innerText = `${gameData.turnMsg}`;
  deemphasizeFreeMoves();
  if (gameData.moveType=='freeMove' && gameData.updatedLocs.length>0) {
    freeMoves = gameData.updatedLocs;
    changePosition(freeMoves);
    highlightFreeMoves(freeMoves);
  }
  if(gameData.moveType=='battle' && killedPieces.length>0){
    revealBattlePiece(revealPiece);
    setTimeout(()=>{
      updateKilledPieceCount(killedPieces);
      updateBattlePosition(killedPieces,gameData.updatedLocs);
      hideBattlePiece(gameData.updatedLocs);
    },1000);
  }
  if (status.gameOver) {
    setTimeout(()=>{
      showRevealedBattlefield(myArmy,oppArmy);
      announceWinner(status);
    },1000);
    clearInterval(interval);
    rematch();
  }
};

let interval;
let timeStamp =1000;
const initiatePolling = function(myArmy,oppArmy){
  const applyChanges = function(){
    if(this.responseText){
      timeStamp = new Date().getTime();
      let gameData = JSON.parse(this.responseText); 
      updateChanges(gameData,myArmy,oppArmy);  
    }
  };
  let callBack =() => {
    let data = `timeStamp=${timeStamp}`;
    doXhr('/battlefieldChanges', 'POST', applyChanges, data, () => {});
  };
  interval = setInterval(callBack, 1000);
};

const setBattlefield = function(myArmy, oppArmy) {
  let reqListener = function() {
    let gameData = JSON.parse(this.responseText);
    updateBattlefield(gameData, myArmy, oppArmy);
  };
  doXhr('/battlefield', 'POST', reqListener, null, () => {});
  initiatePolling(myArmy,oppArmy);
};