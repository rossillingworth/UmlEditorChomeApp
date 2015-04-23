/**
 * Launch App when clicked
 * ?? todo: can be used to pass data?
 */
chrome.app.runtime.onLaunched.addListener(function(someData) {
    chrome.app.window.create('window.html#demo/demo_sequence.umle', {
        'bounds': {
            'top':0,
            'left':0,
            'width': 1280,
            'height': 800
        }
//        'frameOptions':{
//            'type':'chrome',
//            'activeColor':'GREEN',
//            'inactiveColor':'RED'
//        }
    },function(win){
        console.log("Window:",win);
        win.contentWindow.someData = someData;
    });
});

/**
 * this never seems to run
 */
chrome.runtime.onSuspend.addListener(function(){
    console.log("Suspending");
    return false;
})



/**************************************************************
 ******** TODO
 **************************************************************
 * TODO: add commands for keyboard shortcuts
 * TODO: add context menus
 */

chrome.commands.onCommand.addListener(function(command) {
    console.log('Command:', command);
});

