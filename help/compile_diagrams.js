/**
 * Created by ross on 23/04/2015.
 */

// NODEjs tool script

// iterate over umle files
// send each one to PlantUML server
// save response in file /help/images/xxx.png

var fs = require("fs");
var http = require('http');

eval(fs.readFileSync('../js/rawdeflate.js', 'utf8'));
eval(fs.readFileSync('../js/plantuml.js', 'utf8'));

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        //var name = dir + '/' + files[i];
        //if (fs.statSync(name).isDirectory()){
        //    getFiles(name, files_);
        //} else {
            files_.push(files[i]);
        //}
    }
    return files_;
}

function downloadGraphics(files){
    files.forEach(function(file,ind,arr){
        console.log(file);
        // open file
        fs.readFile("./"+file,"utf8",function(err,contents){
            console.log(contents);
            contents = unescape(encodeURIComponent(contents));
            console.log(contents);
            var encoded = encode64(deflate(contents, 9));
            console.log(encoded);
            var src = "http://www.plantuml.com/plantuml/img/"+encoded;
            console.log(src);

            var fileObj = fs.createWriteStream(file+".png");
            var request = http.get(src, function(response) {
                response.pipe(fileObj);
            });

        });

        // base64 / encode contents
        // push contents to plantUML
        // save image response to directory

    });
}

var files = getFiles('.');
files = files.filter(function(f){return f.split("").reverse().join("").indexOf("elmu.")==0});
console.log(files);
downloadGraphics(files);


