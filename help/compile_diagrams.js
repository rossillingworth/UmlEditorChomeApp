/**
 * Created by ross on 23/04/2015.
 */

// NODEjs tool script

// iterate over umle files
// send each one to PlantUML server
// save response in file /help/images/xxx.png

var fs = require("fs");

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

var files = getFiles('.');
files = files.filter(function(f){return f.split("").reverse().join("").indexOf("elmu.")==0});

console.log(files);