var GameState = (function(state){
  var gs = {};
  state = state || initializeState();

  function initializeState(){
    var _state = [];
    var x, y;
    for(x = 0; x < 7; x ++){
      for(y = 0; y < 6; y ++){
        _state.push(0);
      }
    }

    return _state;
  }

  gs.addToColumn = function(column, player){
    var index = column;

    if(state[index] != 0){
      return false;
    }

    while(state[index + 7] == 0){
      index = index + 7;
    }

    state[index] = player;
    return true;
  }

  gs.getState = function(){
    return state;
  }

  gs.hasWinner = function(columnNum){
    var index = columnNum;
    var cellState = 0;
    while((cellState = state[index]) == 0){
      index += 7;
    }
    var toMatch = Array(4).fill(cellState).join("");

    var x = index % 7;
    var y = (index - x) / 7;

    var column = [];
    var i;
    for(i = 0; i < 6; i ++){
      column.push(state[x + (i * 7)]);
    }

    if(column.join("").indexOf(toMatch) > -1){
      return cellState;
    }

    var row = [];
    for(i = 0; i < 7; i ++){
      row.push(state[(y * 7) + i]);
    }

    if(row.join("").indexOf(toMatch) > -1){
      return cellState;
    }

    var diagRSub = y - x;
    var diagRx = Math.max(diagRSub * -1 , 0);
    var diagRy = Math.max(diagRSub, 0);
    var diagRDiff = Math.min(6 - diagRx, 5 - diagRy);

    if(diagRDiff >= 3){
      var diagRs = diagRy * 7 + diagRx;
      var diagR = [];

      for(i = 0; i <= diagRDiff; i ++){
        diagR.push(state[diagRs + 8 * i]);
      }

      if(diagR.join("").indexOf(toMatch) > -1){
        return cellState;
      }
    }

    var diagLSub = y - (6 - x);
    var diagLx = Math.max(diagLSub * -1, 0);
    var diagLy = Math.max(diagLSub, 0);
    var diagLDiff = Math.min(6 - diagRx, 5 - diagRy);

    if(diagLDiff >= 3){
      var diagLs = diagLy * 7 + (6 - diagLx);
      var diagL = [];

      for(i = 0; i <= diagLDiff; i ++){
        diagL.push(state[diagLs + 6 * i]);
      }

      if(diagL.join("").indexOf(toMatch) > -1){
        return cellState;
      }
    }

    return 0;
  }

  return gs;
});

module.exports = GameState;
