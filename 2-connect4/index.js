const readline = require('readline');
const cli = require('./CLI')(readline.createInterface({
  input: process.stdin,
  output: process.stdout
}));

const gameState = require('./GameState')();
const tokens = ["-", "X", "O"];

var player = 0;

function render(){
  var state = gameState.getState();
  var gameBoard = "";
  var i, separator;
  for(i = 0; i < state.length; i++){
    separator = ((i + 1) % 7 == 0) ? "\n" : "|";
    gameBoard += tokens[state[i]] + separator;
  }

  cli.write(gameBoard);
  player = (player + 1) % 2;
}

function getColumn(){
  cli.prompt("Enter a column: ")
    .then(function (answer){
      var column = validateColumn(answer);
      if(column === false){
        cli.write("Column must be a valid number between 1 and 7.");
        getColumn();
        return false;
      }

      if(gameState.addToColumn(column, player + 1)){
        render();
        var winner;
        if((winner = gameState.hasWinner(column)) > 0){
          cli.write(`Player ${winner} wins!`);
          process.exit();
        }

        getColumn();
      }
      else {
        cli.write("This column is full. Please play a different column.");
        getColumn();
      }
    });
}

function validateColumn(str){
  var column = parseInt(str);

  if(isNaN(column)){
    return false;
  }

  if(column < 1 || column > 7){
    return false;
  }

  return column - 1;
}

getColumn();
