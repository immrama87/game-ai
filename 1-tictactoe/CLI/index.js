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
