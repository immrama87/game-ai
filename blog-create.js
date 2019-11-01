const fs = require('fs');
const stream = require('stream');
const util = require('util');
const path = require('path');
const https = require('https');

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

const mdContents = fs.readFileSync(path.join(__dirname, filename), "utf8");
const postData = JSON.stringify({text: mdContents, mode: "gfm", context: "github/immrama87"});

const httpsOpts = {
  method: 'POST',
  host: 'api.github.com',
  path: '/markdown',
  port: '443',
  headers: {
    'Content-Type': "application/json",
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': "immrama87"
  }
};

const req = https.request(httpsOpts, function(res){
  var data = "";
  res.setEncoding('utf8');

  res.on('data', function(chunk){
    data += chunk;
  });

  res.on('end', function(){
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
        data +
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
});

req.on('error', function(err){
  console.error(`Error occurred retrieving MD data from GitHub: ${err}`);
  process.exit(1);
});

req.write(postData);
req.end();

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
