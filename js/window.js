/**
 * Created by rillingworth on 17/04/15.
 */

console.log("script loaded");

var App = {

    STATE:{
        START:900,
        EMPTY:901,
        EDITING:903,
        HORIZONTAL:904,
        VERTICAL:905
    },

    currentFileEntry:null,
    titleBase:"UML Diagram Editor",
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
        App.state.setState(App.STATE.EMPTY);
        App.status("Application ready");
        App.file.loadLocal('demo/demo_sequence.umle');
    },

    initFunctions:function initFunctions(){
        App.editor.generateDebounced = _.debounce(App.editor.generate,3000,{leading:false,maxWait:1000,trailing:true});
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
            App.log("change detected");
            App.myCodeMirror.save();
            App.state.setState(App.STATE.EDITING);
            //debugger;
            var el = JS.DOM.getElement("checkboxGenerateAuto",true);
            var val = JS.DOM.FORM.getValue(el);
            if(val == "true"){
                App.log("update image triggered");
                App.editor.generateDebounced();
            }
        });
    },

    initListeners:function initListeners(){
        App.buttonNew.addEventListener("click",function(){App.state.setState(App.STATE.EMPTY)});
        App.buttonOpen.addEventListener("click",App.file.choose);
        App.buttonSave.addEventListener("click",App.file.save);
        App.buttonSaveAs.addEventListener("click",App.file.saveAs);
        App.buttonGenerate.addEventListener("click",App.editor.generate);

        App.buttonHorizontal.addEventListener("click",function(){App.state.setState(App.STATE.HORIZONTAL)});
        App.buttonVertical.addEventListener("click",function(){App.state.setState(App.STATE.VERTICAL)});
        // help
        App.buttonHelp.addEventListener("click",function(){
            App.showHelp();
        });
        // CTRL+ENTER -> regen image
        document.addEventListener("keypress",function(e){
            if(e.ctrlKey&&(e.keyCode==10||e.keyCode==13)){
                App.editor.generate();
            }
        });
    },

    editor:{
        getContents:function(){
            App.myCodeMirror.save();
            return App.textarea.value;
        },
        setContents:function setContents(text){
            App.myCodeMirror.getDoc().setValue(text);
            App.myCodeMirror.save();
        },
        makeEditable:function makeEditable(){
            App.state.setState(App.STATE.EDITING);
            App.editor.generate();
        },
        generate:function generate(){
            App.log("generating img");
            if(App.state.state==App.STATE.EDITING){
                App.status("loading diagram...")
                refreshDiagram(App.editor.getContents(),"diagram",function(){App.status("diagram updated")});
            }else{
                App.log("Generating Blocked");
            }
        }
    },



    showHelp:function(){
        // Set new window to be offset from current window.
//        var newWindowOffset = 100;
//        var innerBounds = chrome.app.window.current().innerBounds;
//
//        innerBounds.left = (innerBounds.left + newWindowOffset) % (screen.width - innerBounds.width);
//        innerBounds.top = (innerBounds.top + newWindowOffset) % (screen.height - innerBounds.height);
//        var optionsDictionary = {};
//        optionsDictionary.innerBounds = {};
//        optionsDictionary.innerBounds.left = innerBounds.left;
//        optionsDictionary.innerBounds.top = innerBounds.top;
//        optionsDictionary.innerBounds.width = innerBounds.width;
//        optionsDictionary.innerBounds.height = innerBounds.height;
        //
        chrome.app.window.create('windowHelp.html');//, optionsDictionary);//, callback);
    },

    /**
     * File functions
     */
    file:{
        accepts: [{
            mimeTypes: ['text/*'],

            extensions: ['txt','seq','uml']
        }],

        loadLocal:function(filepath){
            var xhr = new XMLHttpRequest();
            xhr.open('GET', filepath, true);
            xhr.responseType = 'blob';
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var blob = new Blob([this.response], {type: 'text/html'});

                    FileSystem.readBlobToText(blob, function(text){
                        App.editor.setContents(text);
                        App.editor.makeEditable();
                    });
                }
            };
            xhr.send();
        },

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
            chrome.storage.local.set({'chosenFile': chrome.fileSystem.retainEntry(fileEntry)});
            App.currentFileEntry = fileEntry;
            App.file.showInfo(fileEntry);
            App.editor.setContents(data);
            App.editor.makeEditable();
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
                App.status("No file, please choose one");
                App.file.saveAs();
            }
        },

        /**
         * Save contents As.. to File
         */
        saveAs:function saveAs(){
            console.log("save as..");
            var suggestedName = (App.currentFileEntry && App.currentFileEntry.name)?App.currentFileEntry.name:"mydiagram.uml";
            var config = {type: 'saveFile', suggestedName: suggestedName};
            try{
                chrome.fileSystem.chooseEntry(config, App.file.writeToFile);
                App.log(chrome.runtime.lastError);
            }catch(e){
                App.log(e);
            }
        },

        writeToFile:function(writableEntry){
            App.myCodeMirror.save();
            var contents = App.editor.getContents();
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
        App["timeoutId"] && clearTimeout(App.timeoutId);
        App.timeoutId = setTimeout(function(){App.statusBar.value = "";},5000);
    },
    title:function title(additionalText){
        document.title = App.titleBase + ": " + additionalText;
    },

    state:{
        state:undefined, // current state
        setState:function(state){
            App.log("State:",state);
            switch (state){
                case App.STATE.EMPTY:
                    // de-activate save / saveAs
//                debugger;
                    App.textarea.value = "";
                    App.myCodeMirror.getDoc().setValue("");
                    $("diagram").src = App.emptyImage;
                    App.title("");
                    App.state.state = state;
                    App.currentFileEntry = undefined;
                    App.buttonSave.setAttribute("disabled","disabled");
                    App.buttonSaveAs.disabled = true;//setAttribute("disabled","disabled");
                    App.buttonGenerate.disabled = true;//setAttribute("disabled","disabled");
                    break;
                case App.STATE.EDITING:
                    App.buttonSave.disabled = false;//removeAttribute("disabled");
                    App.buttonSaveAs.disabled = false;//removeAttribute("disabled");
                    App.buttonGenerate.disabled = false;//removeAttribute("disabled");
                    App.state.state = state;
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
    }
};



window.addEventListener("load", App.init);


