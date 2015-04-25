

function profileOn(){
    console.log("Profiling starting");
    console.profile("UMLEditorStartup");
}

function genProfileOff(milliseconds){
    milliseconds = milliseconds || 10000;
    return function(e){
        setTimeout(function(){
            console.log("Profiling ending");
            console.profileEnd();
        },milliseconds);
    };
}

profileOn();

window.addEventListener("load", genProfileOff());