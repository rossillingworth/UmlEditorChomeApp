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

function getFiles (dir,suffix){
    var files = fs.readdirSync(dir,suffix);
    if(suffix){
        suffix = suffix.split("").reverse().join("");
        files = files.filter(function(f){return f.split("").reverse().join("").indexOf(suffix)==0});
    }
    return files;
}

/**
 * base64 / encode contents
 * push contents to plantUML
 * save image response to directory
 *
 * @param files
 */
function downloadGraphics(files){
    console.log(files);
    files.forEach(function(file,ind,arr){
        // iterate files
        fs.readFile("./"+file,"utf8",function(err,contents){
            // encode
            contents = unescape(encodeURIComponent(contents));
            var encoded = encode64(deflate(contents, 9));
            var src = "http://www.plantuml.com/plantuml/img/"+encoded;
            // file
            var filename = file + ".png";
            var fileObj = fs.createWriteStream("images/"+filename);
            // get & save
            var request = http.get(src, function(response) {
                response.pipe(fileObj);
                console.log("saved",contents.length,filename);
            });
        });
    });
}

var files = getFiles('.',".umle");
downloadGraphics(files);


