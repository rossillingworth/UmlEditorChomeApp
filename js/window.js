/**
 * Created by rillingworth on 17/04/15.
 */

console.log("script loaded");

var App = {

    STATE:{
        EMPTY:901,
        EDITING:903,
        HORIZONTAL:904,
        VERTICAL:905
    },

    currentFileEntry:null,
    title:"UML Diagram Editor",
    emptyImage:"data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
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
        App.initFunctions();
        App.initBindings();
        App.status("Initializing...");
        App.initCodeMirror();
        App.initListeners();
        App.setState(App.STATE.EMPTY);
        App.status("Application ready");
    },

    initFunctions:function initFunctions(){
        //App._generate = App.generate;
        App.generateDebounced = _.debounce(App.generate,3000,{leading:false,maxWait:1000,trailing:true});
    },

    initBindings:function initButtons(){
        App.buttonNew          = document.querySelector("#buttonNew");
        App.buttonOpen         = document.querySelector("#buttonOpen");
        App.buttonSave         = document.querySelector("#buttonSave");
        App.buttonSaveAs       = document.querySelector("#buttonSaveAs");
        App.buttonGenerate     = document.querySelector("#buttonGenerate");
        App.buttonHorizontal   = document.querySelector("#buttonHorizontal");
        App.buttonVertical     = document.querySelector("#buttonVertical");
        App.buttonHelp         = document.querySelector("#buttonHelp");

        App.editorContainer    = document.querySelector("#editorContainer");
        App.textarea           = document.querySelector("#editor");
        App.statusBar          = document.querySelector("#statusBar");
    },

    initCodeMirror:function initCodeMirror(){
        App.myCodeMirror = CodeMirror.fromTextArea(App.textarea,{
            //theme:"eclipse",
            lineNumbers:true,
            //viewportMargin:Infinity,
            //autofocus:true,
            redraw:function(){console.log("redrawn");}
        });
        // handle editor text changed event
        App.myCodeMirror.on("change",function(){
            App.myCodeMirror.save();
            //todo checkbox on/off
            App.generateDebounced();
            App.log("changed");
        });
    },

    initListeners:function initListeners(){
        App.buttonNew.addEventListener("click",function(){App.setState(App.STATE.EMPTY)});
        App.buttonOpen.addEventListener("click",App.file.choose);
        App.buttonSave.addEventListener("click",App.file.save);
        App.buttonSaveAs.addEventListener("click",App.file.saveAs);
        App.buttonGenerate.addEventListener("click",App.generate);

        App.buttonHorizontal.addEventListener("click",function(){App.setState(App.STATE.HORIZONTAL)});
        App.buttonVertical.addEventListener("click",function(){App.setState(App.STATE.VERTICAL)});
        // help
        App.buttonHelp.addEventListener("click",function(){
            chrome.app.window.create('windowHelp.html');//, optionsDictionary, callback);
        });
        // CTRL+ENTER -> regen image
        document.addEventListener("keypress",function(e){
            if(e.ctrlKey&&(e.keyCode==10||e.keyCode==13)){
                App.generate();
            }
        });
    },

    getContents:function(){
        App.myCodeMirror.save();
        return App.textarea.value;
    },

    generate:function generate(){
        App.log("generating img");
        if(App.state==App.STATE.EDITING){
            App.status("image loading...")
            refreshDiagram(App.getContents(),"diagram",function(){App.status("image loaded")});
        }else{
            App.log("Generating Blocked");
        }
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
            //try{
                var config = {type: 'openFile', accepts: App.file.accepts}
                chrome.fileSystem.chooseEntry(config, function(choosenFileEntry){
                    App.log("Choosen",choosenFileEntry);
                    if(choosenFileEntry.isFile){
                        FileSystem.load(choosenFileEntry,App.file.loadSuccess,App.error);
                    }
                });
            //}catch(e){
            //    App.error(e);
            //}
        },
        loadSuccess:function load(data,fileEntry){
            App.log("Loading:",fileEntry);
            App.textarea.value = data;
            App.myCodeMirror.getDoc().setValue(data);
            App.generate();
            //
            chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(fileEntry)});
            App.currentFileEntry = fileEntry;
            App.file.showInfo(fileEntry);
            App.setState(App.STATE.EDITING);
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
            App.myCodeMirror.save();
            var contents = App.getContents();
            var blob = new Blob([contents], {type: 'text/plain'});
            FileSystem.writeFileEntry(writableEntry, blob, function(e) {
                console.log('Write complete :)',writableEntry.name);
                App.status("File saved: " + writableEntry.name)
            });
        }

    },

    /**
     *
     */
    log:function log(){
        return window.console && console.log && Function.apply.call(console.log, console, arguments);
    },
    error:function log(){
        return window.console && console.error && Function.apply.call(console.error, console, arguments);
    },
    status:function(msg){
        App.statusBar.value = msg;
    },
    title:function title(title){
        document.title = App.title + ": " + title;
    },
    setState:function(state){
        App.log("State:",state);
        switch (state){
            case App.STATE.EMPTY:
                // de-activate save / saveAs
                App.buttonSave.disabled = true;
                App.buttonSaveAs.disabled = true;
                App.buttonGenerate.disabled = true;
                App.textarea.value = "";
                App.myCodeMirror.getDoc().setValue("");
                $("diagram").src = App.emptyImage;
                App.title("");
                App.state = state;
                break;
            case App.STATE.EDITING:
                App.buttonSave.removeAttribute("disabled");
                App.buttonSaveAs.disabled = false;
                App.buttonGenerate.disabled = false;
                App.state = state;
                break;
            case App.STATE.HORIZONTAL:
                App.editorContainer.style.maxWidth = "50%";
                App.editorContainer.style.width = "50%";
                $("diagram").style.maxWidth = "49%";
                App.buttonHorizontal.style.backgroundColor = "LIGHTGREY";
                App.buttonVertical.style.backgroundColor = "buttonface";
                break;
            case App.STATE.VERTICAL:
                App.editorContainer.style.maxWidth = "100%";
                App.editorContainer.style.width = "100%";
                $("diagram").style.maxWidth = "100%";
                App.buttonHorizontal.style.backgroundColor = "buttonface";
                App.buttonVertical.style.backgroundColor = "LIGHTGREY";
                break;
            default:
                throw Error("UNKNOWN STATE:" + state);
        }
    }
};



window.addEventListener("load", App.init);



