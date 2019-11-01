const gameState = new GameState();

const ai = new AI(gameState.getWinConditions());

const stateTokens = ['-', 'X', 'O']; //State tokens to display the state of a game board cell
var currentPlayer = 0;

function render(){
  var state = gameState.getState();
  var gameboard = "";

  var i, separator;
  for(i = 0; i < state.length; i++){
    separator = ((i + 1) % 3 == 0) ? '\n' : '|';
    gameboard += stateTokens[state[i]] + separator;
  }
  GameConsole.write(gameboard);

  var winner;
  if((winner = gameState.hasWinner()) > 0){
    GameConsole.write(`Player ${winner} wins!`);
  }

  if(gameState.hasEmptyCells()){
    currentPlayer = (currentPlayer + 1) % 2; //Make sure we're clamping it so there are only 2 players.
    if(currentPlayer == 0){
      promptForColumn();
    }
    else {
      doAITurn();
    }
  }
  else {
    GameConsole.write("There are no remaining moves to play. Stalemate!!!");
  }
}

function validateInput(str){
  var num = parseInt(str);
  if(isNaN(num)){
    return false; //If the string is not parseable as an int, fail
  }
  if(num < 1 || num > 3){
    return false; //Makes sure the int is between 1 and 3
  }

  return num - 1; //0-index our number here
}

function promptForColumn(){
  GameConsole.prompt("Enter a column: ")
    .then(function resolved(column){
      column = validateInput(column);
      if(column === false){
        GameConsole.write("Column input must be a valid number between 1 and 3.");
        promptForColumn();
        return false;
      }

      promptForRow(column);
    });
}

function promptForRow(column){
  GameConsole.prompt("Enter a row: ")
    .then(function resolved(row){
      row = validateInput(row);
      if(row === false){
        GameConsole.write("Row input must be a valid number between 1 and 3.");
        promptForRow(column);
        return false;
      }

      var cell = (row * 3) + column;
      if(gameState.setCell(cell, currentPlayer + 1)){
        render();
      }
      else {
        GameConsole.write("The selected cell has already been played on. A cell must be empty in order to be played.");
        promptForColumn();
      }
    });
}

function doAITurn(){
  var cell = ai.selectCell(gameState);
  if(gameState.setCell(cell, currentPlayer + 1)){
    var column = cell % 3;
    var row = (cell - column) / 3;

    GameConsole.write(`AI selects cell at column ${column + 1} and row ${row + 1}.`);
    render();
  }
  else {
    doAITurn();
  }
}

$(document).ready(promptForColumn);
