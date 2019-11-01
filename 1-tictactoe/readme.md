# Learning by Doing: Game AI
## Tic Tac Toe

### Introduction
AI development is a complicated but fascinating process. A simple game like Tic Tac Toe is a perfect starting point because the ruleset is extremely basic and the results of any processing can be immediately visualized, giving us the opportunity to quickly evaluate how successful or unsuccessful our AI is. Finally, as the movie _War Games_ showed, Tic Tac Toe is a game in which two players who are consistently making the optimal move will always end in stalemate, giving us a clearly defined goal for the final state of our AI.

### Part 1: Initial Setup
Before we can start working on AI, we need to have at least a minimally working Tic Tac Toe game. The requirements for this are:

* A renderer which is capable of consuming or tracking a game state and generating the visual representation of the game board.
* A simple CLI that collects row and column inputs and outputs the rendered game board and any system messages.
* Input validation to ensure that column and row input are both numeric and within the correct bounds.
* A game loop which tracks which of the two players is currently playing.

To start our project folder should contain just an index.js file and (optionally) package.json file.

#### The Game Board
Generating our gameboard is fairly straightforward, we just need something that outputs 3 columns and 3 rows, each with 3 possible states (neutral, player 1 and player 2). In our index.js file, we can do this with:

```javascript
var state = [0,0,0,0,0,0,0,0,0]; //Pre-initialize a state array with 9 elements
const stateTokens = ['-', 'X', 'O']; //State tokens to display the state of a game board cell

function render(){
  var gameboard = "";

  var i, separator;
  for(i = 0; i < state.length; i++){
    separator = ((i + 1) % 3 == 0) ? '\n' : '|';
    gameboard += stateTokens[state[i]] + separator;
  }
  console.log(gameboard);
}

render();
```

Running `node index` now will give us output that should look like

![Initial Game Rendering](https://raw.githubusercontent.com/immrama87/game-ai/master/1-tictactoe/images/Screen%20Shot%202019-10-23%20at%203.23.20%20PM.png)

#### The CLI
Now that we have a game board to play on, it's time to start collecting input from the player to play our Tic Tac Toe game. We're going to create a simple CLI, built around a readline interface that will simply write arbitrary string data and prompt the player for input.

We will first create a new directory in our project folder called "CLI" and inside this new directory create a file called index.js. The contents of this file should be:

```javascript
var CLI = (function(interface /** Readline.Interface **/){
  var cli = {};
  cli.write = function(str){
    interface.write("\n" + str + "\n");
  };

  cli.prompt = function(question){
    return new Promise(function(resolve, reject){
      interface.question(question, function(answer){
        resolve(answer);
      });
    });
  };

  return cli;
});

module.exports = CLI;
```

This new CLI class, and the _readline_ library, will now need to be **require**d in our main /index.js file so that we can use it to collect our player inputs. At the top of the file we need to add:

```javascript
const readline = require('readline');
const cli = require('./CLI')(readline.createInterface({
  input: process.stdin,
  output: process.stdout
}));

```

and we'll need to add the following functions to collect our inputs:

```javascript
function promptForColumn(){
  cli.prompt("Enter a column: ")
    .then(function resolved(column){
      promptForRow(column);
    });
}

function promptForRow(column){
  cli.prompt("Enter a row: ")
    .then(function resolved(row){
      var cell = ((row - 1) * 3) + (column - 1);
      state[cell] = 1;
      render();
    });
}
```

Finally, we'll replace the call to the **render** function with a call to the new **promptForColumn** function and the complete /index.js file should look like:

```javascript
const readline = require('readline');
const cli = require('./CLI')(readline.createInterface({
  input: process.stdin,
  output: process.stdout
}));

var state = [0,0,0,0,0,0,0,0,0]; //Pre-initialize a state array with 9 elements
const stateTokens = ['-', 'X', 'O']; //State tokens to display the state of a game board cell

function render(){
  var gameboard = "";

  var i, separator;
  for(i = 0; i < state.length; i++){
    separator = ((i + 1) % 3 == 0) ? '\n' : '|';
    gameboard += stateTokens[state[i]] + separator;
  }
  cli.write(gameboard);
}

function promptForColumn(){
  cli.prompt("Enter a column: ")
    .then(function resolved(column){
      promptForRow(column);
    });
}

function promptForRow(column){
  cli.prompt("Enter a row: ")
    .then(function resolved(row){
      var cell = ((row - 1) * 3) + (column - 1);
      state[cell] = 1;
      render();
    });
}

promptForColumn();
```

Now, we have a game (sort of)! If we run `node index` now, we should see something like

![First round with player input](https://github.com/immrama87/game-ai/blob/master/1-tictactoe/images/Screen%20Shot%202019-10-23%20at%203.25.54%20PM.png?raw=true)

The game takes our inputs for a column and row and outputs an updated game board with an 'X' in the selected space, so we've got two of our four boxes checked. We still need input validation, because at this point the player can enter string data or overload the **state** array because we are simply trusting that their input is valid. The game also only works once, so it's currently impossible to win, lose or draw.

First, let's tackle the easier input validation problem, then we can wrap everything up in a game loop. We'll need to add the following to /index.js:

```javascript
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
```

This function will serve 3 purposes. First, we make sure that the input is actually an integer, second we make sure that it fits within the bounds of the game board and finally we 0-index the result that we pass back so that the math later will look a little cleaner.

Now that we have the function, we'll need to update the **promptForColumn** and **promptForRow** functions to validate input before continuing, as such:

```javascript
function promptForColumn(){
  cli.prompt("Enter a column: ")
    .then(function resolved(column){
      column = validateInput(column);
      if(column === false){
        cli.write("Column input must be a valid number between 1 and 3.");
        promptForColumn();
        return false;
      }

      promptForRow(column);
    });
}

function promptForRow(column){
  cli.prompt("Enter a row: ")
    .then(function resolved(row){
      row = validateInput(row);
      if(row === false){
        cli.write("Row input must be a valid number between 1 and 3.");
        promptForRow(column);
        return false;
      }

      var cell = (row * 3) + column;
      state[cell] = 1;
      render();
    });
}
```

Now that we have the CLI working and we're validating our inputs, all that's left is to make it loop so that we can actually fill up the game board.

First, in the initial variable declarations, we need to add a variable to track which player is currently playing (otherwise we'll only have 'X's on the board). Let's call it currentPlayer and set it to 0 initially.

```javascript
var currentPlayer = 0;
```

Now in the **promptForRow** function, instead of hardcoding the updated state for a cell to 1, let's use our new *currentPlayer* variable.

```javascript
state[cell] = currentPlayer + 1;
```

Finally, to get it all to loop, we'll add the following to the end of the **render** function:

```javascript
currentPlayer = (currentPlayer + 1) % 2; //Make sure we're clamping it so there are only 2 players.
promptForColumn();
```

Now, if we run `node index` we should see something like

![Game loops and tracks player](https://github.com/immrama87/game-ai/blob/master/1-tictactoe/images/Screen%20Shot%202019-10-23%20at%203.51.53%20PM.png?raw=true)

At this point our /index.js should look like:

```javascript
const readline = require('readline');
const cli = require('./CLI')(readline.createInterface({
  input: process.stdin,
  output: process.stdout
}));

var state = [0,0,0,0,0,0,0,0,0]; //Pre-initialize a state array with 9 elements
const stateTokens = ['-', 'X', 'O']; //State tokens to display the state of a game board cell
var currentPlayer = 0;

function render(){
  var gameboard = "";

  var i, separator;
  for(i = 0; i < state.length; i++){
    separator = ((i + 1) % 3 == 0) ? '\n' : '|';
    gameboard += stateTokens[state[i]] + separator;
  }
  cli.write(gameboard);

  currentPlayer = (currentPlayer + 1) % 2; //Make sure we're clamping it so there are only 2 players.
  promptForColumn();
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
  cli.prompt("Enter a column: ")
    .then(function resolved(column){
      column = validateInput(column);
      if(column === false){
        cli.write("Column input must be a valid number between 1 and 3.");
        promptForColumn();
        return false;
      }

      promptForRow(column);
    });
}

function promptForRow(column){
  cli.prompt("Enter a row: ")
    .then(function resolved(row){
      row = validateInput(row);
      if(row === false){
        cli.write("Row input must be a valid number between 1 and 3.");
        promptForRow(column);
        return false;
      }

      var cell = (row * 3) + column;
      state[cell] = currentPlayer + 1;
      render();
    });
}

promptForColumn();
```

and our /CLI/index.js should look like:

```javascript
var CLI = (function(interface /** Readline.Interface **/){
  var cli = {};
  cli.write = function(str){
    interface.write("\n" + str + "\n");
  };

  cli.prompt = function(question){
    return new Promise(function(resolve, reject){
      interface.question(question, function(answer){
        resolve(answer);
      });
    });
  };

  return cli;
});

module.exports = CLI;
```

#### Game States
We're almost to the point where we can start programming some AI for our Tic Tac Toe game, but there's a couple of problems that still need to be dealt with. The biggest one is that there's no way to win or lose the game and there's no validation that tokens are only placed in empty cells. For the sake of keeping /index.js clean, as well as to help us out when we start building our AI, we're going to offload this functionality into a new GameState class. So let's start by creating a new GameState directory in our project folder and create an index.js file in this new directory, with the following contents:

```javascript
var GameState = (function(state){
  state = state || [0,0,0,0,0,0,0,0,0];

  var gs = {};

  gs.setCell = function(cell, player){
    state[cell] = player;
  }

  gs.getState = function(){
    return state;
  }

  return gs;
});

module.exports = GameState;
```

This new class doesn't actually provide us any new functionality yet, but it does give us what we already have in an external method call that we can more easily modify without turning /index.js into spaghetti.

Now, in /index.js, we'll need to **require** this new class, right below where we're **require**ing readline and CLI, and then replace the line

```javascript
var state = [0,0,0,0,0,0,0,0,0]; //Pre-initialize a state array with 9 elements
```

with

```javascript
const gameState = new GameState();
```

And finally we'll need to modify the **render** and **promptForRow** functions to use the new GameState object instead of the hardcoded array, so at the beginning of the **render** function we'll add:

```javascript
var state = gameState.getState();
```

and modify the line

```javascript
state[cell] = currentPlayer + 1;
```

in **promptForRow** to

```javascript
gameState.setCell(cell, currentPlayer + 1);
```

and we're all set to start building some state checks into our game.

The easiest state check we can build is the stalemate check. All we're looking for here is a state in which all cells on the game board have a token placed, so we'll add a new function the GameState class, **hasEmptyCells**, which will perform this check:

```javascript
gs.hasEmptyCells = function(){
  return state.indexOf(0) > -1;
}
```

Now, in the **render** function in /index.js we can use this new check to determine if we should be moving along to the next player or displaying a stalemate message, by making a modification to the lines

```javascript
currentPlayer = (currentPlayer + 1) % 2; //Make sure we're clamping it so there are only 2 players.
promptForColumn();
```

to read

```javascript
if(gameState.hasEmptyCells()){
  currentPlayer = (currentPlayer + 1) % 2; //Make sure we're clamping it so there are only 2 players.
  promptForColumn();
}
else {
  cli.write("There are no remaining moves to play. Stalemate!!!");
  process.exit();
}
```

Testing this, we should end up with something that looks like this

![Stalemate condition reached](https://github.com/immrama87/game-ai/blob/master/1-tictactoe/images/Screen%20Shot%202019-10-23%20at%204.51.04%20PM.png?raw=true)

And now our game has its first end condition (even if it is the most boring one...)! We do still have the issue that players can overwrite their opponent's tokens, so before we build in a win condition, let's make sure players can't cheat first.

Currently, the GameState class is simply taking a cell and placing the requested token, but we need it to make sure that cell is empty first, which as we just saw is dead simple, so we just need to add a simple condition to the **setCell** method, to read:

```javascript
gs.setCell = function(cell, player){
  if(state[cell] == 0){
    state[cell] = player;
    return true;
  }
  return false;
}
```

This has now additionally given the **setCell** method a boolean return value that we can use in the game loop to determine if the placement of the token was successful, so in the **promptForRow** function, we'll replace the simple

```javascript
gameState.setCell(cell, currentPlayer + 1);
render();
```

with

```javascript
if(gameState.setCell(cell, currentPlayer + 1)){
  render();
}
else {
  cli.write("The selected cell has already been played on. A cell must be empty in order to be played.");
  promptForColumn();
}
```

Running `node index` now and trying to play the same cell twice should end up prompting the error message above, like this

![Cell availability check fails](https://github.com/immrama87/game-ai/blob/master/1-tictactoe/images/Screen%20Shot%202019-10-23%20at%204.31.51%20PM.png?raw=true)

Now we're finally ready to build in a win condition. First we need to figure out what that means, in Tic Tac Toe, it's simply any full row, column or diagonal that is filled with the same token. In our GameState class, we can quantify these with a new multi-dimensional array that will allow us to check an initial cell on the game board and check all available win conditions related to that cell.

```javascript
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
```

With this array we can walk the first level of the array and, using the same index, check the game board for a token on that cell and if found, we can then check the secondary arrays to see if those cells contain the same token. The code for this in the GameState class would look like:

```javascript
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
```

Now we just need to link this code into our game loop, by adding it to the end of the render loop before the check for a stalemate, as it should be possible to completely fill the board and win on the same move:

```javascript
var winner;
if((winner = gameState.hasWinner()) > 0){
  cli.write(`Player ${winner} wins!`);
  process.exit();
}
```

Now running `node index` and playing a game out to a win will give us something like

![First win condition achieved!](https://github.com/immrama87/game-ai/blob/master/1-tictactoe/images/Screen%20Shot%202019-10-23%20at%204.55.39%20PM.png?raw=true)

And with that, we have a working multiplayer (couch co-op!) Tic Tac Toe game.

At this point, we should have a /index.js file that looks like:

```javascript
const readline = require('readline');
const cli = require('./CLI')(readline.createInterface({
  input: process.stdin,
  output: process.stdout
}));
const GameState = require('./GameState');

const gameState = new GameState();
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
  cli.write(gameboard);

  var winner;
  if((winner = gameState.hasWinner()) > 0){
    cli.write(`Player ${winner} wins!`);
    process.exit();
  }

  if(gameState.hasEmptyCells()){
    currentPlayer = (currentPlayer + 1) % 2; //Make sure we're clamping it so there are only 2 players.
    promptForColumn();
  }
  else {
    cli.write("There are no remaining moves to play. Stalemate!!!");
    process.exit();
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
  cli.prompt("Enter a column: ")
    .then(function resolved(column){
      column = validateInput(column);
      if(column === false){
        cli.write("Column input must be a valid number between 1 and 3.");
        promptForColumn();
        return false;
      }

      promptForRow(column);
    });
}

function promptForRow(column){
  cli.prompt("Enter a row: ")
    .then(function resolved(row){
      row = validateInput(row);
      if(row === false){
        cli.write("Row input must be a valid number between 1 and 3.");
        promptForRow(column);
        return false;
      }

      var cell = (row * 3) + column;
      if(gameState.setCell(cell, currentPlayer + 1)){
        render();
      }
      else {
        cli.write("The selected cell has already been played on. A cell must be empty in order to be played.");
        promptForColumn();
      }
    });
}

promptForColumn();
```

and a /GameState/index.js file that looks like:

```javascript
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

  return gs;
});

module.exports = GameState;
```

### Part 2: A Basic AI
Now that we have a playable game, it's time to teach it to play itself. We'll start with a fairly simple, brute-force AI that plays out every possible permutation of a game state and categorizes them based on potential wins vs. potential losses. Before we do that, though, let's just get a dumb "AI" running that randomly picks a cell to place its token on.

To start, we'll need to create a new directory, called AI, with a index.js file in our project folder. The index.js for our dumb AI will look like:

```javascript
var AI = (function(){
  var ai = {};

  ai.selectCell = function(gameState){
      var state = gameState.getState();

      var empty = [];
      var index = -1;
      while((index = state.indexOf(0, index)) > -1){
        empty.push(index);
      }

      var emptyIndex = Math.floor(Math.random() * empty.length);
      return empty[emptyIndex];
  }

  return ai;
});

module.exports = AI;
```

Now that we have a blind-firing AI, we'll need to do some reconfiguring of /index.js to enable the AI to play. Currently after a token is placed, we're just requesting input to place the next. Now that we have an "AI" we'll need to query it half the time.

To do this, we'll first need to **require** our new AI class like:

```javascript
const ai = require('./AI')();
```

Next, we'll need a function that uses the AI to select a cell using the *selectCell* method, like:

```javascript
function doAITurn(){
  var cell = ai.selectCell(gameState);
  if(gameState.setCell(cell, currentPlayer + 1)){
      render();
  }
  else {
      doAITurn();
  }
}
```

and then in the **render** function, we'll modify the code that restarts the loop to check which player should play next by changing:

```javascript
currentPlayer = (currentPlayer + 1) % 2; //Make sure we're clamping it so there are only 2 players.
promptForColumn();
```

to

```javascript
currentPlayer = (currentPlayer + 1) % 2; //Make sure we're clamping it so there are only 2 players.
if(currentPlayer == 0){
  promptForColumn();
}
else {
  doAITurn();
}
```

Now, when we run `node index` we're going to be trading turns with our new AI.

But it's not very fun. We have to actively try to lose at this point since the AI is just blindly throwing darts at the game board. So let's make it a little more fun and get our AI scoring all of the moves using the brute force method described previously.

We're going to do a little setup to make this possible, mainly by creating a method that enables the AI to clone a game state. So, we modify the /GameState/index.js file to include a new **clone** method:

```javascript
gs.clone = function(){
  return new GameState(state.slice(0)); //Need to slice the array so it's not passing a reference to the parent state.
}
```

Now, back to our AI in /AI/index.js, we'll need a function that can be recursively called to iterate over all of the possible game state permutations and score them based on potential wins and losses.

This will end up looking like:

```javascript
function processGameState(gameState, cell, moves){
    moves = moves || 0;
    var player = (moves % 2 == 0) ? 2 : 1;
    var newState = gameState.clone();

    var wins = 0;
    if(newState.setCell(cell, player)){
      if(newState.hasWinner()){
        if(player == 2){
          return 1;
        }
        else {
          return -1;
        }
      }
      else if(newState.hasEmptyCells()){
        var state = newState.getState();
        var index = -1;
        while((index = state.indexOf(0, index + 1)) > -1){
          wins += processGameState(newState, index, moves + 1);
        }

        return wins;
      }
      else {
        return 0;
      }
    }
    else {
        //This shouldn't be possible since the indexes were preprocessed in ai.selectCell
        console.error("Invalid cell index tested by AI.");
        process.exit(1);
    }
}
```

There's a fair bit to unpack here. First, our AI is going to be figuring out who is currently playing based on the number of moves that have occurred (even numbered moves will always be the AI since it is always initiating this check), next it places the appropriate token in the requested cell and checks if it triggered a win condition. If there was a win, this is reported back to the caller to increment or decrement a win counter. If no win occurred, but there are still moves remaining it will begin to recursively check all remaining moves for wins/losses. Finally it passes the accumulated win counter back up to the caller.

Now, we'll need to include this new functionality in the **selectCell** method, like:

```javascript
ai.selectCell = function(gameState){
    var state = gameState.getState();
    var cells = {};

    var index = -1;
    var indexes = [];
    while((index = state.indexOf(0, index + 1)) > -1){
      cells[index] = processGameState(gameState, index);
      indexes.push(index);
    }

    var cell = indexes[0];
    var highest = cells[cell];
    for(var i = 1; i < indexes.length; i++){
      if(cells[indexes[i]] > highest){
        cell = indexes[i];
        highest = cells[cell];
      }
    }

    return cell;
}
 ```

 And that's it. Since /index.js is already pointed at that **selectCell** method, and expects an integer return value, we're good to start testing. At this point, the files we've changed in our project should contain:

 `/index.js`
 ```javascript
 const readline = require('readline');
const cli = require('./CLI')(readline.createInterface({
  input: process.stdin,
  output: process.stdout
}));
const GameState = require('./GameState');
const gameState = new GameState();

const ai = require('./AI')();

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
  cli.write(gameboard);

  var winner;
  if((winner = gameState.hasWinner()) > 0){
    cli.write(`Player ${winner} wins!`);
    process.exit();
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
    cli.write("There are no remaining moves to play. Stalemate!!!");
    process.exit();
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
  cli.prompt("Enter a column: ")
    .then(function resolved(column){
      column = validateInput(column);
      if(column === false){
        cli.write("Column input must be a valid number between 1 and 3.");
        promptForColumn();
        return false;
      }

      promptForRow(column);
    });
}

function promptForRow(column){
  cli.prompt("Enter a row: ")
    .then(function resolved(row){
      row = validateInput(row);
      if(row === false){
        cli.write("Row input must be a valid number between 1 and 3.");
        promptForRow(column);
        return false;
      }

      var cell = (row * 3) + column;
      if(gameState.setCell(cell, currentPlayer + 1)){
        render();
      }
      else {
        cli.write("The selected cell has already been played on. A cell must be empty in order to be played.");
        promptForColumn();
      }
    });
}

function doAITurn(){
  var cell = ai.selectCell(gameState);
  if(gameState.setCell(cell, currentPlayer + 1)){
    var column = cell % 3;
    var row = (cell - column) / 3;

    cli.write(`AI selects cell at column ${column + 1} and row ${row + 1}.`);
    render();
  }
  else {
    doAITurn();
  }
}

promptForColumn();
```

`/AI/index.js`

```javascript
var AI = (function(){
  var ai = {};

  function processGameState(gameState, cell, moves){
    moves = moves || 0;
    var player = (moves % 2 == 0) ? 2 : 1;
    var newState = gameState.clone();

    var wins = 0;
    if(newState.setCell(cell, player)){
      if(newState.hasWinner()){
        if(player == 2){
          return 1;
        }
        else {
          return -1;
        }
      }
      else if(newState.hasEmptyCells()){
        var state = newState.getState();
        var index = -1;
        while((index = state.indexOf(0, index + 1)) > -1){
          wins += processGameState(newState, index, moves + 1);
        }

        return wins;
      }
      else {
        return 0;
      }
    }
    else {
        //This shouldn't be possible since the indexes were preprocessed in ai.selectCell
        console.error("Invalid cell index tested by AI.");
        process.exit(1);
    }
  }

  ai.selectCell = function(gameState){
    var state = gameState.getState();
    var cells = {};

    var index = -1;
    var indexes = [];
    while((index = state.indexOf(0, index + 1)) > -1){
      cells[index] = processGameState(gameState, index);
      indexes.push(index);
    }

    var cell = indexes[0];
    var highest = cells[cell];
    for(var i = 1; i < indexes.length; i++){
      if(cells[indexes[i]] > highest){
        cell = indexes[i];
        highest = cells[cell];
      }
    }

    return cell;
  }

  return ai;
});

module.exports = AI;
```

everything else, except for the **GameState#clone** method should be the same as it was at the end of part 1.

### Part 3: The Best Offense?
At this point, if you've played a game against your AI, you'll have probably noticed that it does not quite hit the mark we were shooting for. If you're not sure what that means, try playing a game with the following moves:

**Move 1:** Column 1, Row 1

*AI selects cell at column 2 and row 2*

**Move 2:** Column 3, Row 3

*AI selects cell at column 3 and row 1*

**Move 3:** Column 1, Row 3

*AI selects cell at column 1 and row 2*

**Move 4:** Column 2, Row 3

*Player 1 Wins!*

Obviously, this is not what we want. The goal for our AI is that it will always be able to force either a stalemate or a loss. As it turns out our brute force method of evaluating every permuation of the game from its current state is not only the least efficient manner of categorizing the strength of any particular move, but it's also generating a subpar result.

What's happening is that our AI is missing critical information in order to determine its best move, in terms of both its efficiency and its efficacy. At this point we've only given our AI the ability to evaluate the current state and determine what moves are available, then ask the GameState instance to tell it whether or not any given move will produce a win state. We haven't actually taught it how to win, just how to tell if it *has* won. Teaching it how to win opens up our options pretty substantially, because it also gives it the ability to evaluate whether or not it can force its opponent's hand. If we were to replay the game above, but pick a different cell on the AI's second move, we'll see:

**Move 1:** Column 1, Row 1

*AI selects cell at column 2 and row 2*

**Move 2:** Column 3, Row 3

*AI selects cell at column 1 and row 2*

Here the AI has created a situation where, if the player were to play the same cell as before (Column 1, Row 3), the AI can play the cell at column 3 and row 2 and win the game, forcing the player to play that cell. Continuing this game with ideal (or forced) moves, we see:

**Move 3:** Column 3, Row 2

*AI selects cell at column 3 and row 1*

**Move 4:** Column 1, Row 3

*AI selects cell at column 2 and row 3*

**Move 5:** Column 2, Row 1

There are no remaining moves to play. Stalemate!!!

This is more like it! The simulated AI in the above example has forced a stalemate by taking control of the player's next move and ensuring that they either play the required blocking move or lose on the AI's next move.

So, how do we teach our AI to employ a similar strategy?

First, we need to make it more efficient, because as it stands the **processGameState** algorithm executes with a time-complexity of O(n!) and adding additional categorization will cause the real-time execution of each AI move to most likely become noticable to the player (also, there's really no need to be that inefficient). To do this, the AI is going to need to be aware of the win conditions for the game.

By using the same win conditions that are already present in the GameState class, we can rewrite our algorithm to look at the number of win conditions that remain available for any given space to come to the same answer. Using the opening move of the example games, we would get:

||C1|C2|C3|
|---|---|---|---|
|**R1**|X|1|2|
|**R2**|1|3|2|
|**R3**|2|2|2|

So our AI would still play the cell at column 2 and row 2, because its column, its row and one of the diagonals still remain completely open, leaving 3 win states available. To achieve this, we must first expose the **winConditions** array in the GameState class (ideally through a getter method so it can't be modified to cheat) like so:

```javascript
gs.getWinConditions = function(){
    return winConditions;
}
```

then, in our AI class, modify the "constructor" to require this as a parameter:

```javascript
var AI = (function(winConditions){
```

Finally, in /index.js, modify our AI instantiation to:

```javascript
const ai = require('./AI')(gameState.getWinConditions());
```
_Note: If during testing, you receive an error about gameState being undefined, check the order of your **require**s and instance declarations._

Now that we've passed the knowledge of how to win on to our AI, we can modify the **processGameState** function to:

```javascript
function processGameState(gameState, cell){
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
          }
        }
      }
}

    return wins;
    }
```

First, we remove the **moves** counter, because it is no longer necessary. Next, we've been able to significantly simplified our AI state testing logic by testing first if the "index" cell for each win condition is either the one which is being played, empty or already played with the AI's token, then checking whether or not the first and second cells stored in the array at that index are also either the cell being played, already owned by the AI or empty. Finally we need to ensure that the cell is actually one of the three cells in that win condition, since the other three conditions do not preclude the possibility that this is not the case. We end up getting the exact same results as before, but we've managed to do it with an algorithm which will execute with a time-complexity of simply O(n) because we've removed all of the recursion in the original brute-force method. If you play a game now, you'll notice that the AI's second move changes to Column 2, Row 1, which is a technically correct move, but it's selecting it for the wrong reasons as you'll see below (keep in mind that Column 2, Row 1 will be the first cell evaluated).

Now, it's time to teach our AI how to play some offense. The simplest way to do this would be to iterate the wins counter an additional time if it's determined that placing a token on a cell will setup the player to secure a win condition on the next turn. Applying this to the example game on the move where the AI's loss was secured, however, would result in:

||C1|C2|C3|
|---|---|---|---|
|**R1**|X|2|2|
|**R2**|2|O|2|
|**R3**|2|2|X|

with equal value assigned to each cell, so if the AI were to then select randomly from the seemingly equal cells it has a 33% chance to select a corner cell which will force a loss in two turns. However, since all of these moves are forcing the opponent's next move, we can add a lookahead to evaluate the strength of that move in the opponent's favor and subtract that score from the score of the cell. This will end up looking like:


||C1|C2|C3|
|---|---|---|---|
|**R1**|X|1|0|
|**R2**|1|O|1|
|**R3**|0|1|X|

This is exactly what we're looking for! First, we're going to need a new function to process the opponent's outlook, since all we are looking for is win conditions which the opponent is only one cell away from playing in order to secure. This will be:

```javascript
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
```

This looks nearly identical to the **processGameState** function, with the addition of the **cellsTotal** variable. We are using this new variable in order to find how many "token points" are set for win condition that the AI is evaluating. If this is equal to twice the current player's token value then, as we've also determined that it is a win condition the current player can still claim, we can be certain that there are two tokens played and we are examining a win condition which is one move away from being secured.

Now, we need to do something similar with **processGameState**, and additionally call our new function to decrement the wins counter. This will only be required when the win condition is valid for the played cell, so we can add it to the final conditional block, like:

```javascript
if(firstCell && secondCell && isInCondition){
    wins++;

    var cellsTotal = state[i] + state[winConditions[i][j][0]] + state[winConditions[i][j][1]];
    if(cellsTotal == (player * 2)){
        wins++;

        var targetCell = (state[i] == 0) ? i : (state[winConditions[i][j][0]] == 0) ? winConditions[i][j][0] : winConditions[i][j][1];
        wins -= processOpponentState(newState, targetCell);
    }
}
```

Now, if we run `node index`, we should be able to get the results we were expecting, at least for one extra move. Now, the original example plays out like:

**Move 1:** Column 1, Row 1

*AI selects cell at column 2 and row 2*

**Move 2:** Column 3, Row 3

*AI selects cell at column 2 and row 1*

**Move 3:** Column 2, Row 3

*AI selects cell at column 3 and row 1*

**Move 4:** Column 1, Row 3

Player 1 wins!

And here's the problem: with its 3rd move, the AI has now left open a position which secures a win for its opponent. Based on what we've taught the AI so far after the opponent's 3rd move, all remaining spaces will evaluate equally to:

||C1|C2|C3|
|---|---|---|---|
|**R1**|X|O|1|
|**R2**|1|O|1|
|**R3**|1|X|X|

The AI is now able to force an opponent's move, but is not yet able to see when it should be forced to play one of its own. To handle this, we'll add a simple preprocessing function to find any win conditions that only require one cell to be secured:

```javascript
function hasImminentWin(gameState, cell, player){
    var player = 1;
    var newState = gameState.clone();
    if(!newState.setCell(cell, player)){
        console.error("Invalid cell index tested by AI in opponent win pre-scan");
        process.exit(1);
    }

    return newState.hasWinner();
}
```

In the **selectCell** method, we'll start by adding a new array, **opponentWins** (although we could get away with simply an int here, it's best not to make any assumptions) and in the while loop for testing available cells in the **selectCell** method, we'll prepend the game state processing with a check for imminent win conditions. The AI will then prioritize the cells in the following order:
1. Win secured for AI (since it doesn't matter if the opponent can win next turn if they've already lost)
2. Win secured for the opponent
3. Processed, ideal move

```javascript
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
```

And before we process the cell win values, we'll need to add:

```javascript
if(opponentWins.length > 0){
    return opponentWins[Math.floor(Math.random() * opponentWins.length)];
}
```

And now, if we replay the game we'll get:

**Move 1:** Column 1, Row 1

*AI selects cell at column 2 and row 2*

**Move 2:** Column 3, Row 3

*AI selects cell at column 2 and row 1*

**Move 3:** Column 2, Row 3

*AI selects cell at column 1 and row 3*

**Move 4:** Column 3, Row 1

*AI selects cell at column 3 and row 2*

**Move 5:** Column 1, Row 2

There are no remaining moves to play. Stalemate!!!

And, if we misplay:

**Move 1:** Column 1, Row 1

*AI selects cell at column 2 and row 2*

**Move 2:** Column 3, Row 3

*AI selects cell at column 2 and row 1*

**Move 3:** Column 3, Row 1

*AI selects cell at column 2 and row 3*

Player 2 wins!

We've now taught the AI to keep itself from losing and to also punish opponent mistakes. We've done what we set out to. There are a couple of things that could be done to enhance this, like allowing the player to select whether they go first or second and allowing the AI to choose which cell to play when more than one exists which is considered "ideal" for the current state, but I'll leave that as homework for the reader since it doesn't have any effect on the core AI logic.

For reference, the files in our project directory should contain:

`/index.js`
```javascript
const readline = require('readline');
const cli = require('./CLI')(readline.createInterface({
  input: process.stdin,
  output: process.stdout
}));
const GameState = require('./GameState');
const gameState = new GameState();

const ai = require('./AI')(gameState.getWinConditions());

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
  cli.write(gameboard);

  var winner;
  if((winner = gameState.hasWinner()) > 0){
    cli.write(`Player ${winner} wins!`);
    process.exit();
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
    cli.write("There are no remaining moves to play. Stalemate!!!");
    process.exit();
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
  cli.prompt("Enter a column: ")
    .then(function resolved(column){
      column = validateInput(column);
      if(column === false){
        cli.write("Column input must be a valid number between 1 and 3.");
        promptForColumn();
        return false;
      }

      promptForRow(column);
    });
}

function promptForRow(column){
  cli.prompt("Enter a row: ")
    .then(function resolved(row){
      row = validateInput(row);
      if(row === false){
        cli.write("Row input must be a valid number between 1 and 3.");
        promptForRow(column);
        return false;
      }

      var cell = (row * 3) + column;
      if(gameState.setCell(cell, currentPlayer + 1)){
        render();
      }
      else {
        cli.write("The selected cell has already been played on. A cell must be empty in order to be played.");
        promptForColumn();
      }
    });
}

function doAITurn(){
  var cell = ai.selectCell(gameState);
  if(gameState.setCell(cell, currentPlayer + 1)){
    var column = cell % 3;
    var row = (cell - column) / 3;

    cli.write(`AI selects cell at column ${column + 1} and row ${row + 1}.`);
    render();
  }
  else {
    doAITurn();
  }
}

promptForColumn();
```

`/AI/index.js`
```javascript
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

module.exports = AI;
```

`/CLI/index.js`
```javascript
var CLI = (function(interface /** Readline.Interface **/){
  var cli = {};
  cli.write = function(str){
    interface.write("\n" + str + "\n");
  };

  cli.prompt = function(question){
    return new Promise(function(resolve, reject){
      interface.question(question, function(answer){
        resolve(answer);
      });
    });
  };

  return cli;
});

module.exports = CLI;
```

`/GameState/index.js`
```javascript
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

module.exports = GameState;
```
