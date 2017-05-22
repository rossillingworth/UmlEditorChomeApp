
/**
 * This is a simple collection of useful functions.
 * Either found on the internet or created by me over the years.
 *
 * Everything is name-spaced to make them easy to find
 *
 * if you think I have missed attributing you for a function,
 * just let me know and show me your original publication/blog etc.
 */

/**
 * Why use underscore?
 * simple, because it already works really well
 * so why rebuild the wheel
 *
 * NB: my version of partial binding allows merging arguments
 */
if(!window["_"]){
    throw new Error("JS.js requires the underscore library")
}

// just for fun
// the Y Combinator
function Y(f) {
    return (
        (function (x) {return f(function (v) { return x(x)(v); }); })
            (function (x) {return f(function (v) { return x(x)(v); }); }));
}


var JS = {
    debug:(document.location.hostname == "localhost")?true:false
    ,firstTime:true
    ,debugDetail:5
    ,empty:{}
    ,emptyFunc:function(){}
    ,deprecated:function(name){alert(name + " has been deprecated in favour of underscore");debugger;}
    ,timestamp:function(){return (new Date()).valueOf();}
    ,log:function(msg,lvl){lvl=lvl||5;if (JS.debug && window["console"] && console["log"] && lvl<=JS.debugDetail){console.log(msg);}}
    ,ASSERT:{
        is:function(exp,expected,message){
            if(!(_.isEqual(exp,expected))){
                if(JS.debug){
                    // if you have got here, you have a serious error
                    // use your debugger stack trace to identify the cause
                    debugger;
                }
                throw new Error(message);
            }
        }
        ,isTrue:function(exp,message){
            return JS.ASSERT.is(exp,true,message);
        }
        ,isFalse:function(exp,message){
            return JS.ASSERT.is(exp,false,message);
        }
    }
    ,DOM:{
        /**
         * Wrapper to getElementById
         * also accepts NODEs
         * so allows elements to be passed by ID or NODE
         * @param element
         * @param assert if set to true, function will verify both input and output
         * @return {Element}
         */
        getElement:function(element,assert){
            // assert
            assert && JS.ASSERT.is((_.isString(element) || element.nodeType == 1),true,"getElement: bad element");
            // assign
            var element = (typeof element === "string")?document.getElementById(element):element;
            // assert result
            assert && JS.ASSERT.is(element && element.nodeType == 1,true,"getElement: unable to find element");
            // return element
            return element;
        }
        ,getElementsByClassName:function(className,parent,tag) {
            parent = parent || document;
            tag = tag || "*";
            var classElements = [];
            var els = parent.getElementsByTagName(tag);
            var elsLen = els.length;
            var pattern = new RegExp('(^|\\s)'+className+'(\\s|$)');
            for (i = 0; i < elsLen; i++) {
                if ( pattern.test(els[i].className) ) {
                    classElements.push(els[i]);
                }
            }
            return classElements;
        }
        /**
         * Create an Element and append it to Parent with properties
         * @param {Object} tagname Required eg: div, script, option
         * @param {Object} [attribts] Optional, JSON format properties for element
         * @param {Object} [p] Optional, parent, if set element will be added to this
         */
        ,createElement:function(tagname,attribs,parent){
            var el = document.createElement(tagname);
            if (attribs){_.extend(el,attribs);}
            if (parent) {
                parent = JS.DOM.getElement(parent);
                parent.appendChild(el);
            }
            return el;
        }
        ,show:function(el){
            el = JS.DOM.getElement(el);
            el.style.display = "block";
        }
        ,hide:function(el){
            el = JS.DOM.getElement(el);
            el.style.display = "none";
        },
        /**
         * taken from http://dzone.com/snippets/javascript-function-checks-dom
         * @param obj
         * @return {*}
         */
        isVisible:function(obj)
        {
            if (obj == document) return true

            if (!obj) return false
            if (!obj.parentNode) return false
            if (obj.style) {
                if (obj.style.display == 'none') return false
                if (obj.style.visibility == 'hidden') return false
            }

            //Try the computed style in a standard way
            if (window.getComputedStyle) {
                var style = window.getComputedStyle(obj, "")
                if (style.display == 'none') return false
                if (style.visibility == 'hidden') return false
            }

            //Or get the computed style using IE's silly proprietary way
            var style = obj.currentStyle
            if (style) {
                if (style['display'] == 'none') return false
                if (style['visibility'] == 'hidden') return false
            }

            return JS.DOM.isVisible(obj.parentNode)
        }
        ,
        /**
         * Get an array of all ancestor of element
         * Includes element itself.
         *
         * @param element
         * @return {Array}
         */
        getAncestors:function(element){
            var ancestors = [];
            while(element){
                ancestors.push(element);
                element = element.parentNode;
            }
            return ancestors;
        }
        ,
        getFirstAncestorWho:function(element,filterFunction){
            element = JS.DOM.getElement(element);
            var ancestors = JS.DOM.getAncestors(element);
            var ancestor = _.find(ancestors,filterFunction);
            return ancestor;
        }
        ,DATA:{
            /**
             *
             * @param element
             * @param name
             * @param defaultValue
             * @return {*}
             */
            getDataAttribute:function(element,name,defaultValue){
                var data = element.getAttribute("data-" + name);
                return data || defaultValue;
            }

            /**
             * Make sure to pass a default value, or you will get the config object if argPath fails
             *
             * @param element
             * @param attrName - attribute containing object name (default:"config")
             * @param argPath - sub-object path (optional, null -> returns full config object)
             * @param defaultValue - value returned if config object does NOT exist
             * @return {*}
             */
            ,getConfigObject:function(element, configAttributeName){
                configAttributeName = configAttributeName || "config";
                var configObjName = JS.DOM.DATA.getDataAttribute(element,configAttributeName,undefined);
                var configObj = (configObjName)?JS.OBJECT.getProperty(window,configObjName):undefined;
                return  configObj;
            }
            /**
             *
             * @param element
             * @param configAttributeName
             * @param argPath
             * @param defaultValue
             * @return {*}
             */
            ,getConfigParam:function(element, configAttributeName, argPath, defaultValue){
                configAttributeName = configAttributeName || "config";
                var configObj = JS.DOM.DATA.getConfigObject(element,configAttributeName);
                var returnValue = (configObj && argPath)?JS.OBJECT.getProperty(configObj,argPath):undefined;
                return  returnValue || defaultValue ;
            }
            /**
             * Get data from attribute or element config object
             * @param element
             * @param dataName
             * @return String
             */
            ,getElementData:function(element, dataName, configAttributeName, defaultValue){
                configAttributeName = configAttributeName || "config";
                defaultValue = JS.DOM.DATA.getDataAttribute(element,dataName,defaultValue);
                defaultValue = JS.DOM.DATA.getConfigParam(element,configAttributeName,dataName,defaultValue);
                return defaultValue;
            }
        }
        ,FORM:{
            /**
             * Get an array of all elements in a form
             * @param form
             * @return {Array}
             */
            getFormElements:function(form){
                form = JS.DOM.getElement(form);
                var inputs = JS.ARRAY.fromCollection(form.getElementsByTagName("input"));
                var lists = JS.ARRAY.fromCollection(form.getElementsByTagName("select"));
                var textareas = JS.ARRAY.fromCollection(form.getElementsByTagName("textarea"));
                var allFormElements = [].concat(inputs,lists,textareas);
                return allFormElements;
            }
            ,
            /**
             * Get form data as ....
             * func should build form data to data object
             *
             * @param data "ElementId",Element,[formElements]
             * @param func parse form data -> function(name,value)
             * @return nothing - callback should populate any data requirements
             */
            getFormData:function(data,func){
                if(!_.isArray(data)){
                    data = JS.DOM.FORM.getFormElements(data);
                }
                // loop over element, get value, pass name/value to generator function
                _.each(data,function(element){
                    var n = element.name;
                    var v = JS.DOM.FORM.getValue(element);
                    func(n,v);
                });
            }
            ,
            getFormDataAsJSON:function(data){
                var out = {};
                var f = function(n,v){
                    out[n] = v;
                };
                JS.DOM.FORM.getFormData(data,f);
                return out;
            }
            ,
            /**
             * Get the value of a form element
             * as it would bee seen by the server when submitted
             *
             * @param el
             * @return {*} string value, comma separated multiple values (select/checkbox), or empty string
             */
            getValue:function(el){
                el = JS.DOM.getElement(el);
                var tagName = el.tagName;
                var type = el.type;
                var value = "";
                switch (tagName){
                    case "SELECT":
                        value = [];
                        var options = el.options;
                        for(var i = 0; i < options.length; i++){
                            if(options[i].selected){
                                value.push(options[i].value);
                            }
                        }
                        value = value.join(",");
                        break;
                    case "TEXTAREA":
                    case "OPTION":
                        value = el.value;
                        break;
                    case "INPUT":
                        switch(type){
                            case "text":
                            case "button":
                            case "submit":
                            case "password":
                                value = el.value;
                                break;
                            case "radio":
                                var name = el.name;
                                var radios = document.getElementsByName(name);
                                var activeRadio =_.find(radios,function(radio){return radio.checked;});
                                value = (activeRadio)?activeRadio.value:"";
                                break;
                            case "checkbox":
                                var name = el.name;
                                var checkboxes = document.getElementsByName(name);
                                checkboxes = _.filter(checkboxes,function(box){return box.checked;});
                                checkboxes = _.map(checkboxes,function(box){return box.value});
                                value = checkboxes.join(",");
                                break;
                            default:
                                throw new Error("unknown form INPUT type: " + type);
                                break;
                        }
                        break;
                    default:
                        throw new Error("unknown form element tagName: " + tagName);
                }
                return value;
            },
            disableHiddenFormFields:function(form){
                var children = JS.DOM.FORM.getFormElements(form);
                children = _.each(children,JS.DOM.FORM.disableHiddenElement);
            },
            /**
             * This can be used to stop form elements being submitted if they are NOT visible
             * Ignores hiddne input fields
             *
             * @param element DOM element, or element ID
             */
            disableHiddenElement:function(element){
                element = JS.DOM.getElement(element);
                // ignore hidden inputs
                var tn = element.tagName;
                var type = element.getAttribute("type");
                if(tn == "INPUT" && type && type.toLowerCase()=="hidden"){return;}
                // disable if not visible
                if(JS.DOM.isVisible(element)){
                    element.removeAttribute("disabled");
                }else{
                    element.setAttribute("disabled","disabled");
                }
            }
        }
    }
    ,STRING:{
        reverse:function(str){return str.split("").reverse().join("");}
        ,
        /**
         * remove spaces from either side of a string
         * @param str
         * @return {*}
         */
        trim:function(str){return str.replace(/^\s+|\s+$/g, '');}
        /**
         * Simple string format
         * eg: format("my string %1 great %2","is",2)
         * @param string
         * @param [values]
         */
        ,format:function(string) {
            var args = arguments;
            //alert("%([1-" + arguments.length + "])");
            var pattern = new RegExp("%([1-" + arguments.length + "])", "g");
            return String(string).replace(pattern, function(match, index) {
                return args[index];
            });
        }
        ,startsWith:function(haystack,needle){
            JS.ASSERT.is(_.isString(haystack),true,"startWith: haystack is not a string");
            JS.ASSERT.is(_.isString(needle),true,"startWith: needle is not a string");
            return haystack.indexOf(needle) == 0;
        }
    }
    ,COOKIE:{
        read:function(n,defaultValue) {
            var c = document.cookie;
            if (c) {
                var i = c.indexOf(n + '=');
                if (i > -1) {
                    var j = c.indexOf(';', i);
                    return c.substring(i + n.length + 1, ((j<0)?c.length:j) );
                }
            }
            return defaultValue;
        }
        ,write:function(name,value,days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                expires = "; expires="+date.toGMTString();
            }
            document.cookie = name+"="+value+expires+"; path=/";
        }
    }
    ,JSON:{
        toCookie:function(jsonObject,cookieName /*,[daysTillCookieExpires]*/){
            var daysTillCookieExpires = arguments[2];
            var stringObject = JSON.stringify(jsonObject); // convert json to string
            var base64Object = JS.BASE64.encode(stringObject); //String to base64
            JS.COOKIE.write(cookieName,base64Object,daysTillCookieExpires); // store cookie
        }
        ,fromCookie:function(cookieName){
            var base64Object = JS.COOKIE.read(cookieName,"e30="); // get cookie or default = {}
            var stringObject = JS.BASE64.decode(base64Object); // convert base64 to string
            var jsonObject = JSON.parse(stringObject); // convert string to json
            return jsonObject;
        }
    }
    ,ARRAY:{
        fromCollection:function(collectionObj){
            try{
                // IE8 has broken this...!
                return Array.prototype.slice.call(collectionObj)
            }catch(ex){
                //so we need this
                var arr = [];
                for(var i = 0; i < collectionObj.length ; i++){
                    arr.push(collectionObj[i]);
                }
                return arr;
            }
        }
        ,remove:function(array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        }
        ,recursiveFunctionCallGenerator:function(func,recursiveFunc,thisArg){
            recursiveFunc = recursiveFunc || _.each;
            return function(el,ind,arr){
                if(el instanceof Array){
                    return recursiveFunc(el,JS.ARRAY.recursiveFunctionCallGenerator(func,recursiveFunc,thisArg));
                }else{
                    return func.call(thisArg,el);
                }
            }
        }
        ,FILTERS:{
            /**
             * generate filter function
             * verifies iterated element attribute isEqual to value
             * NB: is case sensitive
             */
            isAttribute:function (name,value /** [,value...] **/){
                var values = JS.ARRAY.fromCollection(arguments).slice(1);
//                console.log(values);
                return function(el,ind,arr){
                    return el[name] && _.reduce(values, function(start,val){
//                        console.log(el[name] + " ?==? " + val);
                        return start || el[name]==val;
                    },false);
                };
            }
            /**
             * Return a function to filter an array
             * @param {Object} text to test array[index]
             */
            ,startsWith:function(text){
                return function(el,ind,arr){
                    JS.log("Testing[" + arr[ind]+ "]");
                    return (arr[ind].indexOf(text,0) === 0);
                };
            }
            ,log:function(el,ind,arr){
                JS.log(ind + " = " + arr[ind]);
            }
        }
        ,MAP:{}

    }
    ,BASE64:{
        key_Str:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        ,encode:function(input) {
            var keyStr = JS.BASE64.key_Str;
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) + keyStr.charAt(enc4);
            } while (i < input.length);

            return output;
        }
        ,decode:function(input) {
            var keyStr = JS.BASE64.key_Str;
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            } while (i < input.length);

            return output;
        }
    }
    ,OBJECT:{
        /**
         * Get an object property,
         * allows a property chain in the name
         * @param object
         * @param name
         * @return {*}
         */
        getProperty:function(object,name){
            JS.ASSERT.isTrue(_.isObject(object),".JS.OBJECT.getProperty: ["+object+"] is not an object");
            JS.ASSERT.isTrue(_.isString(name),".JS.OBJECT.getProperty: ["+name+"] is not a string");
            name = name.split(".");
            object = object || window;
            while(name.length){
                object = (object)?object[name.shift()]:name.shift(),undefined;
            }
            return object;
        }
        ,
        /**
         * Set a property on an object
         *
         * Can be used to guarantee a namespace exists.
         * eg: JS.OBJECT.setProperty(window,"my.long.name.space.object")
         *
         * @param object
         * @param path property name, allows a chain of property names (eg: "foo.bar.meg.mog")
         * @param value optional, defaults to an empty object
         * @param extend optional, use to inject instead of overwrite value, defaults to false
         * @return {*}
         */
        setProperty:function(object,path,value,extend){
            // todo: regex validate path
            JS.ASSERT.isTrue((arguments.length >= 2),"setProperty must have at least 2 arguments");
            path = path.split(".");
            value = value || {};
            extend = extend || false;

            while(path.length){
                var n = path.shift();
                if(object[n] == undefined){
                    object[n] = {};
                }
                if(!(path.length)){
                    if(extend && _.isObject(object[n])){
                        object[n] = _.extend(object[n],value);
                    }else{
                        object[n] = value;
                    }
                }
                object = object[n];
            }
            return object;
        }
        ,createFromArgPairs:function(){
            JS.ASSERT.isTrue((arguments.length % 2 == 0),"createFromArgPairs: unpaired arguments can not be used to populate an object");
            var args = JS.ARRAY.fromCollection(arguments);
            var obj = {};
            while(args.length > 0){
                var key = args.shift();
                var value = args.shift();
                obj[key] = value;
            }
            return obj;
        }
        ,recursiveFunctionCallGenerator:function(func,recursiveFunc,thisArg){
            recursiveFunc = recursiveFunc || _.each;
            return function(el,ind,arr){
                if(el instanceof Object){
                    return recursiveFunc(el,JS.ARRAY.recursiveFunctionCallGenerator(func,recursiveFunc,thisArg));
                }else{
                    return func.call(thisArg,el);
                }
            }
        }
        ,
        /**
         * Walk all the nodes in an Object,
         * apply functions to leafs and nodes
         * @param k
         * @param v
         * @param f
         */
        walk:function walk(k, v, nodeFunc,leafFunc) {
            var
                nodeFunc = nodeFunc || JS.emptyFunc;
            leafFunc = leafFunc || JS.emptyFunc;
            if (v && typeof v === 'object') {
                nodeFunc(k);
                for (var i in v) {
                    if (v.hasOwnProperty(i)) {
                        JS.OBJECT.walk(k + "." + i, v[i],nodeFunc,leafFunc);
                    }
                }
            }else{
                leafFunc(k);
            }
            return;
        }
        ,
        /**
         * Use this to document all the leave nodes in an Object
         * eg: JS.OBJECT.document(JS,"JS")
         *
         * @param obj
         * @param objName
         * @param sep
         * @return {String}
         */
        document:function(obj,objName,sep){
            objName = objName || "Object";
            sep = sep || "\n";
            var a = [];
            var f = function(s){a.push(s);};
            JS.OBJECT.walk(objName,obj,null,f);
            return a.join(sep);
        }
    }
    ,FUNCTION:{
        /**
         * partial function with binding
         * allows pre-population of function arguments
         * allows specification of injectable values using undefined
         * adds remaining arguments to function call
         */
        partial:function partial(f,args /*,thisp*/){
//            var f = this, args = Array.prototype.slice.call(arguments);
            var thisp = arguments[3];
            return function(){
                var args2 = Array.prototype.slice.call(arguments);
                var args3 = [];
                for(var i = 0; i < args.length; i++ ){ // replace undefined arguments
                    args3[i] = (args[i]===undefined)?args2.shift():args[i];
                }
                args3 = args3.concat(args2); // add remaining arguments
                return f.apply(thisp || this, args3); // now call func in current scope with joined arguments
            };
        },
        /**
         * Similar to partial, except arguments override rather than merge.
         *
         * @param f
         * @param args
         * @return {Function}
         */
        overwrite:function overwrite(f,args/*,thisp*/){
            var thisp = arguments[3] || this;
            JS.ASSERT.isTrue(_.isFunction(f),"JS.Function.overwrite: 1st argument is not a function");
            return function(){
                var args2 = Array.prototype.slice.call(arguments);
                var args3 = [];
                var l = Math.max(args.length,args2.length);
                for(var i = 0; i < l; i++ ){
                    args3[i] = (args[i]===undefined)?args2[i]:args[i];
                }
                return f.apply(thisp || this, args3);
            }

        }

    }
    ,
    /**
     * Useful regular expressions I have collected
     */
    REGEX:{}
};

// #############################################
// ###### Utility functions#####################
// #############################################


// if TM Functions can check for THIS
// then use THIS if available
// or pass value into function
// therefore can be used to extend String
// or called directly
// ie: JS.STRING.reverse(myString)
// or given a schortcut
// ie: var reverse = JS.STRING.reverse;
// or wrapped in a partial
// var logFormat = JS.STRING.format.partial("Time:%1, Log:%2")

// ?? all node querying functions shoudl return an ARRAY?
// that way all node processing functions can expect an array
// or change 1 node into an array of 1 node

// use foldr to generate a boolean, instead of using filter?



//Sizzle( String selector, DOMElement|DOMDocument context )
//
//The primary method of calling Sizzle ? pass in a selector and an optional context (if no context is provided the root ?document? is used). Runs the specified selector and returns an array of matched DOMElements.
//Sizzle( String selector, DOMElement|DOMDocument context, Array results )
//
//An alternative to the previous method of calling Sizzle ? pass in an existing array and the results will be appended on to that array.
//Sizzle.matches( String selector, Array<DOMElement> set )
//
//Takes in a set of DOMElements, filters them against the specified selector, and returns the results. The selector can be a full selector (e.g. ?div > span.foo?) and not just a fragment.



// JS.FUNCTION.cascade, like dojo.connect
//##############################################
// pass results of first function to second etc, then to third, etc
// this can be used with partial to create cascades of utility functions
// ie: trim -> split.partial(",") -> join("|")
// also allows verify functions to be added at start / end
// NB: throw exceptions when bad errors...!


