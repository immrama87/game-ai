const fs = require('fs');
const stream = require('stream');
const util = require('util');
const path = require('path');
const Markdown = require('markdown-to-html').GithubMarkdown;
const md = new Markdown();
md.bufmax = 2048;
const opts = {highlight: true};

var args = Array.from(process.argv);
var arg;

var filename,
    template,
    title,
    output;

args.shift();
args.shift();//Remove the first two arguments which are always node's runtime location and the file to run

while((arg = args.shift()) != null){
  switch(arg){
    case "-f":
    case "--file":
      filename = args.shift();
      break;
    case "-T":
    case "--template":
      template = args.shift();
      break;
    case "-t":
    case "--title":
      title = args.shift();
      break;
    case "-o":
    case "--output":
      output = args.shift();
      break;
    case "-h":
    case "--help":
      usage();
      break;
    default:
      if(filename == undefined)
        filename = arg;
      break;
  }
}

if(filename == undefined || title == undefined || template == undefined || output == undefined){
  console.log("");
  if(filename == undefined)
    console.log("No filename argument present");
  if(title == undefined)
    console.log("No title argument present");
  if(template == undefined)
    console.log("No template argument present");
  if(output == undefined)
    console.log("No output argument present");

  usage(1);
}


const ReaderStream = function(){
  this.data = "";
  stream.Writable.call(this);
}
util.inherits(ReaderStream, stream.Writable);
ReaderStream.prototype._write = function(chunk, encoding, done){
  this.data += chunk;
  done();
}

const reader = new ReaderStream();

md.once('end', function(){
  var fileContents = fs.readFileSync(path.join(__dirname, template), "utf8");
  var titleIndex;
  while((titleIndex = fileContents.indexOf("{title}")) > -1){
    fileContents = fileContents.substring(0, titleIndex) +
      title +
      fileContents.substring(titleIndex + ("{title}").length);
  }

  var mdIndex;
  while((mdIndex = fileContents.indexOf("{markdown}")) > -1){
    fileContents = fileContents.substring(0, mdIndex) +
      reader.data +
      fileContents.substring(mdIndex + ("{markdown}").length);
  }

  fs.writeFile(path.join(__dirname, output), fileContents, "utf8", function(err){
    if(err){
      console.error(`Error generating file: ${err}`);
      process.exit(1);
    }

    console.log(`File ${path.join(__dirname, output)} created successfully.`);
    process.exit();
  });
});

md.render(path.join(__dirname, filename), opts, function(err){
  if(err){
    console.error(`Error processing markdown: ${err}`);
    process.exit(1);
  }

  md.pipe(reader)
});

function usage(code){
  code = code || 0;
  console.log("");
  console.log("node blog-create [[-f --filename] [-t --title] [-T --template] [-o --output]] [filename]");
  console.log("\t-f --filename filename\tThe file to convert to a blog entry");
  console.log("\t-t --title\t\tThe title for the blog post");
  console.log("\t-T --template\t\tThe template file to use for formatting");
  console.log("\t-o --output\t\tThe output file to create");
  console.log("\t-h --help\t\tShow this usage dialog");
  console.log("");
  process.exit(code);
}
