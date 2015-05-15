/**
	Define and instantiate your enyo.Application kind in this file.  Note,
	application rendering should be deferred until DOM is ready by wrapping
	it in a call to enyo.ready().
*/


enyo.kind({
    name: "UMLEditor",
    kind: "FittableRows",
    fit: true,
    components:[
        {kind: "onyx.Toolbar", content: "Hello World"},
        {kind: "enyo.Scroller", fit: true, components: [
            {name: "main", classes: "nice-padding", allowHtml: true}
        ]},
        {kind: "onyx.Toolbar", components: [
            {kind: "onyx.Button", content: "Tap me", ontap: "helloWorldTap"}
        ]}
    ],
    helloWorldTap: function(inSender, inEvent) {
        this.$.main.addContent("The button was tapped.<br/>");
    }
});

enyo.ready(function () {
        var container = document.getElementById("container");
        console.log("container",container);
        var app = new UMLEditor({name: "app"});
        app.renderInto(document.body);
});

console.log("loaded");