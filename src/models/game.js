const Battlefield = require('./battlefield.js');
const Player = require('./player.js');
const Pieces=require('./pieces.js');
let team = 'red';
let currentPlayerId = 0;
class Game {
  constructor(id){
    this.id=id;
    this.players = [];
    this.currentPlayerId = 0;
    this.battlefield = new Battlefield();
    this.pieces = new Pieces();
    this.playerCounts = 0;
    this.readyStatus = false;
    this.gameType = 'quickGame';
  }
  getId(){
    return this.id;
  }
  addPlayer(playerName){
    let id=this.currentPlayerId;
    let player=new Player(playerName,id);
    this.players.push(player);
    this.currentPlayerId++;
    return player;
  }
  setBattlefieldFor(currentPlayerId,placedArmyPos){
    this.createPiecesFor(team); 
    this.battlefield.setField(this.pieces,placedArmyPos);
  }
  createPiecesFor(){
    this.pieces.loadPieces(this.gameType,team);
  }
  updateStatus(){
    this.playerCounts++;
    if(this.playerCounts==2){
      this.readyStatus = true;
    }
  }
  hasAllPlyingPieces(){
    let positions = Object.keys(this.battlefield.placedPositions);
    let piecesCount = positions.length;
    return piecesCount==10;
  }
}
module.exports =Game;
