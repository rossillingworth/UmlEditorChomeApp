


$ = function(id){ return document.getElementById(id) };

function encode64(data) {
    r = "";
    for (i=0; i<data.length; i+=3) {
        if (i+2==data.length) {
            r +=append3bytes(data.charCodeAt(i), data.charCodeAt(i+1), 0);
        } else if (i+1==data.length) {
            r += append3bytes(data.charCodeAt(i), 0, 0);
        } else {
            r += append3bytes(data.charCodeAt(i), data.charCodeAt(i+1), data.charCodeAt(i+2));
        }
    }
    return r;
}

function append3bytes(b1, b2, b3) {
    c1 = b1 >> 2;
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
    c4 = b3 & 0x3F;
    r = "";
    r += encode6bit(c1 & 0x3F);
    r += encode6bit(c2 & 0x3F);
    r += encode6bit(c3 & 0x3F);
    r += encode6bit(c4 & 0x3F);
    return r;
}

function encode6bit(b) {
    if (b < 10) {
        return String.fromCharCode(48 + b);
    }
    b -= 10;
    if (b < 26) {
        return String.fromCharCode(65 + b);
    }
    b -= 26;
    if (b < 26) {
        return String.fromCharCode(97 + b);
    }
    b -= 26;
    if (b == 0) {
        return '-';
    }
    if (b == 1) {
        return '_';
    }
    return '?';
}

//function refreshDiagram(imgId,contents) {
//    //UTF8
//    contents = unescape(encodeURIComponent(contents));
//    var src = "http://www.plantuml.com/plantuml/img/"+encode64(deflate(contents, 9));
//
//    var remoteImage = new RAL.RemoteImage({
//        src:src,
//        element:$(imgId)
//    });
//
//    RAL.Queue.add(remoteImage);
//
//    RAL.Queue.setMaxConnections(4);
//    RAL.Queue.start();
//}


function refreshDiagram(imgId,contents){

    contents = unescape(encodeURIComponent(contents));
    var src = "http://www.plantuml.com/plantuml/img/"+encode64(deflate(contents, 9));

    var xhr = new XMLHttpRequest();
    xhr.open('GET', src, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
        var img = $(imgId);
        img.src = window.URL.createObjectURL(this.response);
        document.body.appendChild(img);
        console.log("Image loaded");
    };

    xhr.send();

}



//    <form>
//        <textarea id="inflated" cols="64" rows="16">Bob->Alice : hello</textarea>
//        <p>
//            <input type=submit onclick="compress($('inflated').value);return false;">
//                <p>
//                    <img id="im" src=http://www.plantuml.com/plantuml/img/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000>
//                    </form>