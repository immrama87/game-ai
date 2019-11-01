var GameState = (function(state){
  state = state || [0,0,0,0,0,0,0,0,0];
  const winConditions = [
    [
      [1,2],  //Top Row
      [3,6],  //Left Column
      [4,8]   //Right-Down Diagonal
    ],
    [
      [4,7]   //Center Column
    ],
    [
      [5,8],  //Right Column
      [4,6]   //Left-Down Diagonal
    ],
    [
      [4,5]   //Center Row
    ],
    [],
    [],
    [
      [7,8]   //Bottom Row
    ]
  ];

  var gs = {};

  gs.hasEmptyCells = function(){
    return state.indexOf(0) > -1;
  }

  gs.hasWinner = function(){
    var i;
    for(i = 0; i < winConditions.length; i++){
      var token;
      if((token = state[i]) != 0){
        var j;
        for(j = 0; j < winConditions[i].length; j++){
          var cells = winConditions[i][j];
          if(state[cells[0]] == token && state[cells[1]] == token){
            return token;
          }
        }
      }
    }

    return 0;
  }

  gs.setCell = function(cell, player){
    if(state[cell] == 0){
      state[cell] = player;
      return true;
    }
    return false;
  }

  gs.getState = function(){
    return state;
  }

  gs.clone = function(){
    return new GameState(state.slice(0)); //Need to slice the array so it's not passing a reference to the parent state.
  }

  gs.getWinConditions = function(){
    return winConditions;
  }

  return gs;
});
