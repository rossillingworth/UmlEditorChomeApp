/**
 * Created by rillingworth on 17/04/15.
 */

console.log("script loaded");

var App = {

    STATE:{},

    currentFileEntry:null,
    title:"UML Diagram Editor",

    /**
     * HTML ELEMENT References
     */
    buttonOpen:null,
    buttonSave:null,
    textarea:null,

    myCodeMirror:null,
    statusBar:null,

    /**
     * Initialise stuff
     */
    init:function init(){
        App.buttonNew          = document.querySelector("#buttonNew");
        App.buttonOpen         = document.querySelector("#buttonOpen");
        App.buttonSave         = document.querySelector("#buttonSave");
        App.buttonSaveAs       = document.querySelector("#buttonSaveAs");
        App.buttonGenerate     = document.querySelector("#buttonGenerate");

        App.outputTextFileInfo = document.querySelector("#inputFileInfo");
        App.textarea           = document.querySelector("#editor");
        App.statusBar          = document.querySelector("#statusBar");

        App.buttonNew.addEventListener("click",App.file.new);
        App.buttonOpen.addEventListener("click",App.file.choose);
        App.buttonSave.addEventListener("click",App.file.save);
        App.buttonSaveAs.addEventListener("click",App.file.saveAs);
        App.buttonGenerate.addEventListener("click",App.generate);

        App.buttonSave.disabled = true;
        App.buttonSaveAs.disabled = true;
        App.buttonGenerate.disabled = true;

        App.myCodeMirror = CodeMirror.fromTextArea(App.textarea,{
            //theme:"eclipse",
            lineNumbers:true,
            //viewportMargin:Infinity,
            //autofocus:true,
            redraw:function(){console.log("redrawn");}
        });

        App.generateDebounced = _.debounce(App.generate,3000,{leading:false,maxWait:1000,trailing:true});

        // handle editor text changed event
        App.myCodeMirror.on("change",function(){
            App.myCodeMirror.save();
            //todo checkbox on/off
            App.generateDebounced();
            App.log("changed");
        });

        App.log("loaded codemirror");
        App.status("loaded");
    },

    getContents:function(){
        App.myCodeMirror.save();
        return App.textarea.value;
    },

    generate:function generate(){
        App.log("generating img");
        refreshDiagram("diagram",App.getContents());
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
                var config = {type: 'openFile', accepts: App.file.accepts}
                chrome.fileSystem.chooseEntry(config, function(choosen){
                    !!choosen && App.file.load(choosen);
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
                    App.textarea.value = e.target.result;
                    App.myCodeMirror.getDoc().setValue(e.target.result);
                    App.generate();
                    autoresize(App.textarea);
                };
                reader.readAsText(file);
            });
            // use local storage to retain access to this file
            chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(fileEntry)});
            App.currentFileEntry = fileEntry;
            // update display with file info
            App.file.showInfo(fileEntry);
        },
        /**
         * Display File Info
         * @param fileEntry
         */
        showInfo:function showInfo(fileEntry){
            if (fileEntry.isFile) {
                chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
                    App.log("File path:",path);
                });
                fileEntry.getMetadata(function(data) {
                    App.log("File:",data);
                });
                // Title
                App.status("Loaded:" + fileEntry.name);
                App.title(fileEntry.name);
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
            if(App.currentFileEntry){
                chrome.fileSystem.getWritableEntry(App.currentFileEntry,App.file.writeToFile);
            }else{
                console.error("SAVE CALLED IN ERROR: no file allocated")
            }
        },

        /**
         * Save contents As.. to File
         */
        saveAs:function saveAs(){
            console.log("save as..");
            var config = {type: 'saveFile', suggestedName: App.currentFileEntry.name};
            chrome.fileSystem.chooseEntry(config, App.file.writeToFile);
        },

        writeToFile:function(writableEntry){
            myCodeMirror.save();
            var contents = App.getContents();
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
        return window.console && console.log && Function.apply.call(console.log, console, arguments);
    },
    status:function(msg){
        App.statusBar.value = msg;
    },
    title:function title(title){
        document.title = App.title + ": " + title;
    },
    setState:function(state){
        switch (state){
            case "MODIFIED":
                // activate save / saveAs
                break;
            case "SAVED":
                // deactivate save / saveAs
                break;
        }
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
                App.currentFileEntry.file(function(file) {
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

window.addEventListener("load", App.init);

document.addEventListener("keypress",function(e){
    if(e.ctrlKey&&(e.keyCode==10||e.keyCode==13)){
        App.generate();
    }
    autoresize(App.textarea);
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