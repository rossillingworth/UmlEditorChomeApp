

var EXCEPTION = {
    on:true
    ,debug:true
    ,when:function(condition,message){
        if(!!condition){
            if(EXCEPTION.debug){
                alert(message);
                // if you have got here, you have a contract failure
                // Use your debugger stack trace to identify the cause
                debugger;
            }
            throw new Error(message);
        }
    }
};
function forIn(scope,data,callback){
    scope = scope || this;
    EXCEPTION.when(typeof(callback)!="function","Callback is NOT a function");
    var data = [].concat(data);
    for(var index in data){
        var element = data[index];
        callback(element,index,data);
    }
}
var TM = {
    debug:true
    ,debugDetail:5
    // log levels: 0:FATAL, 1:WARNING, 2:INFO, 3:DEBUG, 4:MORE, 5:EVERYTHING
    ,log:function(msg,lvl){lvl=lvl||5;if (TM.debug && window["console"] && lvl<=TM.debugDetail){console.log(msg);}}
    /**
     * NB: source & target now revered order
     * TODO: will need to retro fix other functions calling this
     */
    ,extend:function (target /*,[source],[source]*/ ){
        //if(!target){target = this;}
        var sources = TM.ARRAY.fromCollection(arguments).slice(1);
        for(var index in sources){
            var source = sources[index];
            for(var propName in source){
                if(source.hasOwnProperty(propName)){
                    try{
                        TM.log("applying prop["+propName+"]",5);
                        if("childNodes,events,tagName".indexOf(propName)>=0){
                            TM.log(TM.STRING.format("Skipping: %1",propName));
                            continue;
                        }
                        TM.debug && EXCEPTION.when(target[propName]==undefined,TM.STRING.format("attribute %1 is NOT valid",propName));
                        if(typeof(source[propName]) == 'object'){
                            if(target[propName] == undefined){target[propName]={};}
                            TM.log("recurse into " + propName);
                            TM.extend(target[propName], source[propName]);
                        }else{
                            try{target[propName] = source[propName];}catch(exc){TM.log("error:" + exc.message,0);}
                        }
                    }catch(ex){
                        // ignore errors, uncomment for debugging
                        TM.log("error extending object: " + ex.message);
                    }
                }
            }
        }
        return target;
    }
    ,DOM:{
        getElement:function(el){
            return (typeof el === "string")?document.getElementById(el):el;
        }
        ,createElement:function(attribs,p){
            // create element
            EXCEPTION.when((!attribs.tagName),"tagName missing");
            TM.log(TM.STRING.format("creating %1",attribs.tagName),3);
            var df = document.createDocumentFragment();
            var el = document.createElement(attribs.tagName);
            df.appendChild(el);
            TM.extend(el, attribs);
            // create children
            if(attribs.childNodes){
                for(var n in attribs.childNodes){
                    TM.DOM.createElement(attribs.childNodes[n],el);
                }
            }
            // attach events
            // TODO: refactor to allow multiple events of a type?
            if(attribs.events){
                for(var eventName in attribs.events){
                    forIn(this,attribs.events[eventName],function(handlerFunc){
                        TM.DOM.addEvent(el,eventName,handlerFunc);
                    });
                }
            }
            // attach to parent
            if (p) {
                p = TM.DOM.getElement(p);
                p.appendChild(df);
            }
            return el;
        }
        ,remove: function(el) {
            var el = TM.DOM.getElement(el);
            el.parentNode.removeChild(el);
        }
        /**
         * add event handlers to elements
         * TM.DOM.addEvent(element,eventType,callbackFunction)
         * TM.DOM.addEvent([elements],eventType,callbackFunction)
         */
        ,addEvent:(function( window, document ) {
            if ( document.addEventListener ) {
                return function( elem, type, cb ) {
                    if ( (elem && !elem.length) || elem === window ) {
                        elem.addEventListener(type, cb, false );
                    }
                    else if ( elem && elem.length ) {
                        var len = elem.length;
                        for ( var i = 0; i < len; i++ ) {
                            TM.DOM.addEvent( elem[i], type, cb );
                        }
                    }
                };
            }
            else if ( document.attachEvent ) {
                return function ( elem, type, cb ) {
                    if ( (elem && !elem.length) || elem === window ) {
                        elem.attachEvent( 'on' + type, function() { return cb.call(elem, window.event) } );
                    }
                    else if ( elem.length ) {
                        var len = elem.length;
                        for ( var i = 0; i < len; i++ ) {
                            TM.DOM.addEvent( elem[i], type, cb );
                        }
                    }
                };
            }
        })( this, document )
        /**
         * John Resigs 2005 event handler function
         * can probably be improved
         */
        ,removeEvent:function removeEvent( obj, type, fn ) {
            if ( obj.detachEvent ) {
                obj.detachEvent( 'on'+type, obj[type+fn] );
                obj[type+fn] = null;
            } else {
                obj.removeEventListener( type, fn, false );
            }
        }
    }
    ,ARRAY:{
        fromCollection:function(collectionObj){
            try{
                // IE8 has broken this...!
                return Array().slice.call(collectionObj);
            }catch(ex){
                //so we need this
                var arr = [];
                for(var i = 0; i < collectionObj.length ; i++){
                    arr.push(collectionObj[i]);
                }
                return arr;
            }
        }
    }
    ,STRING:{
        format:function(string) {
            var args = arguments;
            //alert("%([1-" + arguments.length + "])");
            var pattern = new RegExp("%([1-" + arguments.length + "])", "g");
            return String(string).replace(pattern, function(match, index) {
                return args[index];
            });
        }
    }
};
