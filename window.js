/**
 * Created by rillingworth on 17/04/15.
 */

console.log("script loaded");

var PlantUml = {

    currentFileEntry:null,
    title:"UML Diagram Editor",

    /**
     * HTML ELEMENT References
     */
    buttonOpen:null,
    buttonSave:null,
    outputTextFileInfo:null,
    textarea:null,
    logTextarea:null,

    /**
     * Initialise stuff
     */
    init:function init(){
        PlantUml.buttonNew          = document.querySelector("#buttonNew");
        PlantUml.buttonOpen         = document.querySelector("#buttonOpen");
        PlantUml.buttonSave         = document.querySelector("#buttonSave");
        PlantUml.buttonSaveAs       = document.querySelector("#buttonSaveAs");
        PlantUml.buttonGenerate     = document.querySelector("#buttonGenerate");

        PlantUml.outputTextFileInfo = document.querySelector("#inputFileInfo");
        PlantUml.textarea           = document.querySelector("#editor");
        PlantUml.logTextarea        = document.querySelector("#log");

        PlantUml.buttonNew.addEventListener("click",PlantUml.file.new);
        PlantUml.buttonOpen.addEventListener("click",PlantUml.file.choose);
        PlantUml.buttonSave.addEventListener("click",PlantUml.file.save);
        PlantUml.buttonSaveAs.addEventListener("click",PlantUml.file.saveAs);
        PlantUml.buttonGenerate.addEventListener("click",PlantUml.generate);

        PlantUml.log("loaded");
    },

    generate:function generate(){
        refreshDiagram("diagram",PlantUml.textarea.value);
    },

    /**
     * File functions
     */
    file:{
        accepts: [{
            mimeTypes: ['text/*'],
            extensions: ['txt','seq']
        }],

        choose:function choose(){
            console.log("Choose file");
            try{
                var config = {type: 'openFile', accepts: PlantUml.file.accepts}
                chrome.fileSystem.chooseEntry(config, function(choosen){
                    !!choosen && PlantUml.file.load(choosen);
                });
            }catch(e){
                console.log(e);
            }
        },
        load:function load(fileEntry){
            console.log("LoadFile",fileEntry);
            fileEntry.file(function(file){
                var reader = new FileReader();
                reader.onerror = function(e){console.error(e)};
                reader.onload = function(e) {
                    PlantUml.textarea.value = e.target.result;
                    autoresize(PlantUml.textarea);
                };
                reader.readAsText(file);
            });
            // use local storage to retain access to this file
            chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(fileEntry)});
            PlantUml.currentFileEntry = fileEntry;
            // update display with file info
            PlantUml.file.showInfo(fileEntry);
        },
        /**
         * Display File Info
         * @param fileEntry
         */
        showInfo:function showInfo(fileEntry){
            if (fileEntry.isFile) {
                chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
                    PlantUml.log("File path:",path);
                });
                fileEntry.getMetadata(function(data) {
                    PlantUml.log("File Size",data.size);
                    console.log("File:",data);
                });
                // Title
                PlantUml.outputTextFileInfo.value = fileEntry.name;
                document.title = PlantUml.title + ": " + fileEntry.name;
            }
            else {
                document.querySelector('#file_path').value = theEntry.fullPath;
                document.querySelector('#file_size').textContent = "N/A";
            }
        },

        /**
         * Save contents to currently selected file
         */
        save:function save(){
            console.log("save..");
            if(PlantUml.currentFileEntry){
                chrome.fileSystem.getWritableEntry(PlantUml.currentFileEntry,PlantUml.file.writeToFile);
            }else{
                console.error("SAVE CALLED IN ERROR: no file allocated")
            }
        },

        /**
         * Save contents As.. to File
         */
        saveAs:function saveAs(){
            console.log("save as..");
            var config = {type: 'saveFile', suggestedName: PlantUml.currentFileEntry.name};
            chrome.fileSystem.chooseEntry(config, PlantUml.file.writeToFile);
        },

        writeToFile:function(writableEntry){
            var contents = PlantUml.textarea.value;
            var blob = new Blob([contents], {type: 'text/plain'});
            FileSystem.writeFileEntry(writableEntry, blob, function(e) {
                console.log('Write complete :)',writableEntry.name);
            });
        }

    },

    /**
     *
     */
    log:function log(){
        _.forEach(arguments,function(m){
            PlantUml.logTextarea.value = PlantUml.logTextarea.value + "\n" + m.toString();
            // todo: scroll to bottom
        });
    }
}

/**
 *
 * Wrapper for CHROME filesystem access methods from GOOGLE
 *
 */
var FileSystem = {
    /**
     * Write to a file
     *
     * @param writableEntry
     * @param opt_blob
     * @param callback
     */
    writeFileEntry:function writeFileEntry(writableEntry, opt_blob, callback) {
        if (!writableEntry) {
            output.textContent = 'Nothing selected.';
            return;
        }

        writableEntry.createWriter(function(writer) {

            writer.onerror = function(e){console.error(e);};
            writer.onwriteend = callback;

            // If we have data, write it to the file. Otherwise, just use the file we
            // loaded.
            if (opt_blob) {
                writer.truncate(opt_blob.size);
                FileSystem.waitForIO(writer, function() {
                    writer.seek(0);
                    writer.write(opt_blob);
                });
            } else {
                PlantUml.currentFileEntry.file(function(file) {
                    writer.truncate(file.fileSize);
                    waitForIO(writer, function() {
                        writer.seek(0);
                        writer.write(file);
                    });
                });
            }
        }, function(e){console.error(e);});
    },

    /**
     * Callback for IO
     *
     * @param writer
     * @param callback
     */
    waitForIO:function waitForIO(writer, callback) {
        // set a watchdog to avoid eventual locking:
        var start = Date.now();
        // wait for a few seconds
        var reentrant = function() {
            if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
                setTimeout(reentrant, 100);
                return;
            }
            if (writer.readyState===writer.WRITING) {
                console.error("Write operation taking too long, aborting!"+
                    " (current writer readyState is "+writer.readyState+")");
                writer.abort();
            }
            else {
                callback();
            }
        };
        setTimeout(reentrant, 100);
    }
}

window.addEventListener("load", PlantUml.init);

document.addEventListener("keypress",function(e){
    if(e.ctrlKey&&(e.keyCode==10||e.keyCode==13)){
        PlantUml.generate();
    }
    autoresize(PlantUml.textarea);
});

/**
 * Fit textarea to text
 * Delay allows for screen update to complete
 *
 * @param textarea
 */
function autoresize(textarea) {
    setTimeout(function(){
        //height
        textarea.style.height = '0px';     //Reset height, so that it not only grows but also shrinks
        textarea.style.height = (textarea.scrollHeight) + 'px';    //Set new height
        // width
//        textarea.style.width = '0px';     //Reset width, so that it not only grows but also shrinks
//        textarea.style.width = (textarea.scrollWidth-10) + 'px';    //Set new width

    },1);
}