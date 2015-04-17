/**
 * Created by rillingworth on 17/04/15.
 */

console.log("script loaded");

var PlantUml = {

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
        PlantUml.buttonOpen         = document.querySelector("#buttonOpen");
        PlantUml.buttonSave         = document.querySelector("#buttonSave");
        PlantUml.outputTextFileInfo = document.querySelector("#inputFileInfo");
        PlantUml.textarea           = document.querySelector("#editor");
        PlantUml.logTextarea        = document.querySelector("#log");

        PlantUml.buttonOpen.addEventListener("click",PlantUml.file.choose);
        PlantUml.buttonSave.addEventListener("click",PlantUml.file.save);

        PlantUml.log("loaded");
    },

    /**
     * File functions
     */
    file:{
        accepts: [{
            mimeTypes: ['text/*'],
            extensions: ['js', 'css', 'txt', 'html', 'xml', 'tsv', 'csv', 'rtf']
        }],

        choose:function load(){
            console.log("choosing file");
            var config = {type: 'openFile', accepts: PlantUml.file.accepts}
            chrome.fileSystem.chooseEntry(config, function(theEntry) {
                if (!theEntry) {
                    PlantUml.log('No file selected');
                    return;
                }
                // use local storage to retain access to this file
                chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(theEntry)});
                PlantUml.file.load(theEntry);
            });
        },
        load:function loadFile(fileEntry){
            console.log("LoadFile",fileEntry);
            fileEntry.file(function(file) {
                PlantUml.file.readAsText(fileEntry, function(result) {
                    PlantUml.textarea.value = result;
                });
                //saveFileButton.disabled = false; // allow the user to save the content
                PlantUml.file.showInfo(fileEntry);
            });
        },
        /**
         * Read file contents as Text
         * @param fileEntry
         * @param callback called with file contents
         */
        readAsText:function readAsText(fileEntry, callback) {
            fileEntry.file(function(file) {
                var reader = new FileReader();
                reader.onerror = function(e){console.error(e)};
                reader.onload = function(e) {
                    callback(e.target.result);
                };
                reader.readAsText(file);
            });
        },
        /**
         * Display File Info
         * @param fileEntry
         */
        showInfo:function showFileInfo(fileEntry){
            if (fileEntry.isFile) {
                chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
                    PlantUml.log("File path:",path);
                });
                fileEntry.getMetadata(function(data) {
                    PlantUml.log("File Size",data.size);
                    console.log("File:",data);
                });
            }
            else {
                document.querySelector('#file_path').value = theEntry.fullPath;
                document.querySelector('#file_size').textContent = "N/A";
            }
        },
        /**
         * Save contents to File
         */
        save:function save(){
            console.log("save");
            var config = {type: 'saveFile', suggestedName: chosenEntry.name};
            chrome.fileSystem.chooseEntry(config, function(writableEntry) {
                var blob = new Blob([textarea.value], {type: 'text/plain'});
                writeFileEntry(writableEntry, blob, function(e) {
                    output.textContent = 'Write complete :)';
                });
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

window.addEventListener("load", PlantUml.init);