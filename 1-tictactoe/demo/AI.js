var AI = (function(winConditions){
  var ai = {};

  function processGameState(gameState, cell){
    var player = 2;
    var newState = gameState.clone();
    if(!newState.setCell(cell, player)){
      console.error("Invalid cell index tested by AI.");
      process.exit(1);
    }
    var state = newState.getState();
    var wins = 0;

    for(var i = 0; i < winConditions.length; i++){
      if(i == cell || state[i] == player || state[i] == 0){
        for(var j = 0; j < winConditions[i].length; j++){
          var firstCell = (winConditions[i][j][0] == cell || state[winConditions[i][j][0]] == player || state[winConditions[i][j][0]] == 0);
          var secondCell = (winConditions[i][j][1] == cell || state[winConditions[i][j][1]] == player || state[winConditions[i][j][1]] == 0);
          var isInCondition = (i == cell || winConditions[i][j][0] == cell || winConditions[i][j][1] == cell);

          if(firstCell && secondCell && isInCondition){
            wins++;

            var cellsTotal = state[i] + state[winConditions[i][j][0]] + state[winConditions[i][j][1]];
            if(cellsTotal == (player * 2)){
              wins++;

              var targetCell = (state[i] == 0) ? i : (state[winConditions[i][j][0]] == 0) ? winConditions[i][j][0] : winConditions[i][j][1];
              wins -= processOpponentState(newState, targetCell);
            }
          }
        }
      }
    }

    return wins;
  }

  function processOpponentState(gameState, cell){
    var player = 1;
    var newState = gameState.clone();
    if(!newState.setCell(cell, player)){
      console.error("Invalid cell index tested by AI in opponent prediction.");
      process.exit(1);
    }

    var state = newState.getState();
    var wins = 0;

    for(var i = 0; i < winConditions.length; i++){
      if(i == cell || state[i] == player || state[i] == 0){
        for(var j = 0; j < winConditions[i].length; j++){
          var firstCell = (winConditions[i][j][0] == cell || state[winConditions[i][j][0]] == player || state[winConditions[i][j][0]] == 0);
          var secondCell = (winConditions[i][j][1] == cell || state[winConditions[i][j][1]] == player || state[winConditions[i][j][1]] == 0);
          var isInCondition = (i == cell || winConditions[i][j][0] == cell || winConditions[i][j][1] == cell);
          var cellsTotal = state[i] + state[winConditions[i][j][0]] + state[winConditions[i][j][1]];

          if(firstCell && secondCell && isInCondition && cellsTotal == (player * 2)){
            wins++;
          }
        }
      }
    }

    return wins;
  }

  function hasImminentWin(gameState, cell, player){
    var newState = gameState.clone();
    if(!newState.setCell(cell, player)){
      console.error("Invalid cell index tested by AI in opponent win pre-scan");
      process.exit(1);
    }

    return newState.hasWinner();
  }

  ai.selectCell = function(gameState){
    var state = gameState.getState();
    var cells = {};
    var opponentWins = [];

    var index = -1;
    var indexes = [];
    while((index = state.indexOf(0, index + 1)) > -1){
      if(hasImminentWin(gameState, index, 2)){
        return index;
      }
      if(hasImminentWin(gameState, index, 1)){
        opponentWins.push(index);
      }
      cells[index] = processGameState(gameState, index);
      indexes.push(index);
    }

    if(opponentWins.length > 0){
      return opponentWins[Math.floor(Math.random() * opponentWins.length)];
    }

    var cell = [indexes[0]];
    var highest = cells[cell];
    for(var i = 1; i < indexes.length; i++){
      if(cells[indexes[i]] > highest){
        cell = [indexes[i]];
        highest = cells[cell];
      }
      else if(cells[indexes[i]] == highest){
        cell.push(indexes[i]);
      }
    }

    return cell[Math.floor(Math.random() * cell.length)];
  }

  return ai;
});
