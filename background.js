/**
 * Launch App when clicked
 * ?? todo: can be used to pass data?
 */
chrome.app.runtime.onLaunched.addListener(function(someData) {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 800,
            'height': 500
        }
    },function(win){
        console.log("Window:",win);
        win.contentWindow.someData = someData;
    });
});

/**
 * this never seems to run
 */
chome.runtime.onSuspend.addListener(function(){
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

