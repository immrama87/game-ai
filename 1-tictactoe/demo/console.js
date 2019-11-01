window.GameConsole = (function(){
  var buffer = [];

  var gc = {};
  var stdin = "";

  gc.render = function(){
    $(".console").html("&gt;" + buffer.join("<br />&gt;") + stdin);

    $(".console").scrollTop($(".console")[0].scrollHeight);
  }
  gc.write = function(str){
    buffer.push(str.replace(/\n/g, "<br />&nbsp;"));
    gc.render();
  }
  gc.prompt = function(str){
    buffer.push(str);
    gc.render();

    return getInput();
  }

  function getInput(){
    return new Promise(function(resolve){
      function handleInput(evt){
        if(evt.which == 13){
          resolve(stdin);
          var last = buffer.pop();
          last += stdin;
          buffer.push(last);
          stdin = "";
          window.removeEventListener('keydown', handleInput);
        }
        else {
          if(evt.which == 8){
            stdin = stdin.substring(0, stdin.length - 1);
          }
          else {
            var char = String.fromCharCode(evt.keyCode);
            if(/[a-zA-Z0-9]/.test(char)){
              stdin+=char;
            }
          }
          gc.render();
        }
      }

      window.addEventListener('keydown', handleInput);
    });
  }

  function handleInput(evt, resolve){

  }

  return gc;
})();

$(document).ready(function(){
  GameConsole.render();
});
