/**
	Define and instantiate your enyo.Application kind in this file.  Note,
	application rendering should be deferred until DOM is ready by wrapping
	it in a call to enyo.ready().
*/


enyo.kind({
    name: "UMLEditor",
    kind: "FittableRows",
    fit: true,
    classes:"onyx",
    components:[
        {kind: "onyx.Toolbar", components:[

            {kind: "onyx.MenuDecorator", components: [
                {content: "File"},
                {kind: "onyx.Tooltip", content: "Tap to open..."},
                {kind: "onyx.Menu", scrolling:false, components: [
                    {content: "New"},
                    {kind:"onyx.Submenu",content:"New",components:[
                        {content:"Action"},
                        {content:"Sequence"}
                    ]},
                    {components:[
                        {kind: "onyx.MenuDecorator", components: [
                            {content: "New...>"},
                            {kind: "onyx.Tooltip", content: "Tap to open..."},
                            {kind: "onyx.Menu", components: [
                                {content: "PlantUML"},
                                {content: "About"}
                            ]}
                        ]}
                    ]},
                    {content: "Open"},
                    {classes: "onyx-menu-divider"},
                    {content: "Save"},
                    {content: "Save As"},
                    {classes: "onyx-menu-divider"},
                    {content: "Print"}
                ]}
            ]},

            {kind: "onyx.MenuDecorator", components: [
                {content: "View"},
                {kind: "onyx.Tooltip", content: "Tap to open..."},
                {kind: "onyx.Menu", components: [
                    {components:[
                        {content: "Refresh"},
                        {kind:"onyx.ToggleButton",content:"Refresh",value:true}
                    ]},
                    {classes: "onyx-menu-divider"},
                    {content: "Horizontal"},
                    {content: "Vertical"}
                ]}
            ]},

            {kind: "onyx.MenuDecorator", components: [
                {content: "Help"},
                {kind: "onyx.Tooltip", content: "Tap to open..."},
                {kind: "onyx.Menu", components: [
                    {content: "PlantUML"},
                    {content: "About"}
                ]}
            ]}


        ]},

        // TODO: add helpers on LHS

//        {kind:"FittableColumns",fit:true,components:[
//            {kind: "enyo.Scroller", fit: false, components: [
//                {content:"x"},
//                {content:"y"}
//            ]},
//            {kind: "enyo.Scroller", fit: true, components: [
//
//            ]},
//        ]},

        {kind:"Panels",fit:true,arrangerKind:"CarouselArranger",components:[
            {content:"Editor",style:"width:50%;background-color:green;"},
            {content:"[]",style:"background-color:gray;"},
            {content:"Image",style:"background-color:yellow;"}
        ]},

//        {kind: "enyo.Scroller", fit: true, components: [
//            {name: "main", classes: "nice-padding", allowHtml: true}

//        ]},
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