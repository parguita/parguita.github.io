var http = require('http');
var fs = require('fs');
var qs = require('querystring');

const {MongoClient} = require('mongodb');
const url ="mongodb+srv://victor_01:D5n6eWXkDxc8XH6@cluster0.qmwae.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(url, {useUnifiedTopology:true});

main();

function main(){
  http.createServer(function (req, res) {
    console.log("Running server");
    if(req.url == "/"){
      file = "form.html";
      fs.readFile(file, function(err, txt){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write("Welcome to the Ticker <br/>");
        res.write(txt);
        res.end();
      })
    }
    else if(req.url == "/process"){
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write("Process the form <br/>");
      pdata = "";
      req.on("data", data => {
        pdata += data.toString();
      });
      req.on("end", () => {
        parse1(pdata,res);
      });
      req.on("close", function(err){console.log("here!")});
      //res.end();
    }
    else {
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write("Unknown page request");
      res.end();
    }
  }).listen(8080);
}

async function allTheData(pdata, res){
  pdata = qs.parse(pdata);
  console.log(pdata);
  theQuery = {ticker:pdata['textInput']};
  // theQuery2 = {ticker:pdata['inputType']};
  console.log(theQuery);
  await client.connect();

  var dbo = await client.db("companies");
  var collection = await dbo.collection("companies");

  result = await collection.find(theQuery);
  await result.toArray(function(err, items){
    console.log(items);
    res.write("<br/>");
    if(err){
      throw( new Error(err));
    }
    items.forEach(function(item){
      res.write(item.name + " , " + item.ticker + "<br/>");
    });
    client.close();
    console.log("finished");
  });
}

async function parse1(pdata, res){
  try{
    let promise = await allTheData(pdata, res);
    console.log("promised");
  }
  catch(err){
    console.log(err);
  }
}
