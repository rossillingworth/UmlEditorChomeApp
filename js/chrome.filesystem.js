/**
 *
 * Wrapper for CHROME filesystem access methods from GOOGLE
 *
 */
var FileSystem = {

    load:function load(readableFileEntry,callbackSuccess,callbackError){
        console.log("LoadFile1",readableFileEntry);
        JS.ASSERT.isTrue(readableFileEntry.isFile,"BAD File entry");
        JS.ASSERT.isTrue(_.isFunction(callbackSuccess),"Missing SUCCESS Callback");
        // setup a default error handler
        callbackError = callbackError || function(e){console.error(e)};
        // get data
        console.log("LoadFile2",readableFileEntry);
        readableFileEntry.file(function(file){
            var reader = new FileReader();
            reader.onerror = callbackError;
            reader.onload = function(e) {
                var data = e.target.result;
                callbackSuccess(data,readableFileEntry);
            };
            reader.readAsText(file);
        });
    },


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