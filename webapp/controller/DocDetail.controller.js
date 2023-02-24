sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "../model/formatter",
  "sap/m/MessagePopoverItem",
  "sap/m/Link",
  "sap/ui/model/json/JSONModel"
  ], function (Controller, formatter, MessagePopover, MessagePopoverItem, Link, JSONModel) {
"use strict";
var oLink = new Link({
text: "",
href: "",
target: "_blank"
});

var oMessageTemplate = new MessagePopoverItem({
type: '{type}',
title: '{title}',
description: '{description}',
subtitle: '{subtitle}',
counter: '{counter}'
//    link: oLink
});

var oMessagePopover = new MessagePopover({
items: {
path: '/items',
template: oMessageTemplate
}
});


return Controller.extend("zprelimdoc.controller.DocDetail", {
formatter : formatter,
hasChanges : false,
oClonedObject : {},

onInit : function () {
var that = this;
this.oModel = new sap.ui.model.odata.v2.ODataModel( "/sap/opu/odata/SAP/ZPRELIMDOC_SRV",
{ useBatch : true,
defaultBindingMode : sap.ui.model.BindingMode.TwoWay });

this.metaModel = new sap.ui.model.odata.v2.ODataModel( "/sap/opu/odata/SAP/ZPRELIMDOC_META_SRV",
{ useBatch : true } );
this.metaModel.setSizeLimit(999);

this.getView().setModel(this.oModel, "odata");

var langModel = new sap.ui.model.json.JSONModel();
this.getView().setModel(langModel, "lang");

var templateModel = new sap.ui.model.json.JSONModel();
this.getView().setModel(templateModel, "templateModel");


var jModel = new sap.ui.model.json.JSONModel();
jModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
jModel.setProperty("/Status1", sap.ui.core.ValueState.None);
jModel.setProperty("/Status2", sap.ui.core.ValueState.None);
jModel.setProperty("/Status3", sap.ui.core.ValueState.None);
jModel.setProperty("/Status4", sap.ui.core.ValueState.None);
jModel.setProperty("/Status5", sap.ui.core.ValueState.None);
jModel.setProperty("/Status6", sap.ui.core.ValueState.None);
jModel.setProperty("/Status7", sap.ui.core.ValueState.None);
jModel.setProperty("/Status8", sap.ui.core.ValueState.None);
jModel.setProperty("/Status9", sap.ui.core.ValueState.None);
jModel.setProperty("/Status10", sap.ui.core.ValueState.None);

this.getView().setModel(jModel);

this.oClonedObject = null;

var oUiModel = sap.ui.getCore().getModel("UIModel");

if(!oUiModel){
oUiModel = new sap.ui.model.json.JSONModel();
oUiModel.setData({"DetailsErrors": false, "finalized" : false, "saved" : false});
sap.ui.getCore().setModel(oUiModel, "UIModel");
}
oUiModel.setProperty("/finalized", false);
oUiModel.setProperty("/saved", false);
oUiModel.setProperty("/hasChanges", false);

var that = this;

var oBindingModel = new sap.ui.model.Binding(jModel,"/",jModel.getContext("/"));
oBindingModel.attachChange(function(){

if(!that.oClonedObject){
return;
}
if(this.oModel.oData.Status1){
that.oClonedObject.Status1 = this.oModel.oData.Status1;
}
if(this.oModel.oData.Status2){
that.oClonedObject.Status2 = this.oModel.oData.Status2;
}
if(this.oModel.oData.Status3){
that.oClonedObject.Status3 = this.oModel.oData.Status3;
}
if(this.oModel.oData.Status4){
that.oClonedObject.Status4 = this.oModel.oData.Status4;
}
if(this.oModel.oData.Status5){
that.oClonedObject.Status5 = this.oModel.oData.Status5;
}
if(this.oModel.oData.Status6){
that.oClonedObject.Status6 = this.oModel.oData.Status6;
}
if(this.oModel.oData.Status7){
that.oClonedObject.Status7 = this.oModel.oData.Status7;
}
if(this.oModel.oData.Status8){
that.oClonedObject.Status8 = this.oModel.oData.Status8;
}
if(this.oModel.oData.Status9){
that.oClonedObject.Status9 = this.oModel.oData.Status9;
}
if(this.oModel.oData.Status10){
that.oClonedObject.Status10 = this.oModel.oData.Status10;
}
sap.ui.getCore().getModel("UIModel").setProperty("/hasChanges",
!that.equals(this.oModel.oData, that.oClonedObject));
if(!that.equals(this.oModel.oData, that.oClonedObject)){
}
});

this.getView().setModel(this.metaModel, "meta");

var oBus = sap.ui.getCore().getEventBus();

oBus.subscribe("nav", "listitem", this.onItemNavigated, this);
oBus.subscribe("nav", "back", this.onNavBack, this);
oBus.subscribe("model", "save_cur", this.onCurrentModelSave, this);
oBus.subscribe("model", "sonder", this.onSonderClicked, this);
oBus.subscribe("model", "disable", this.onDisableSwitch, this);

},

getClonedObject : function(object){
return JSON.parse(JSON.stringify(object));
},

equals : function(obj1, obj2){
return JSON.stringify(obj1) === JSON.stringify(obj2);
},

onDisableSwitch : function(channelId, eventId, model){


var metaModel = this.getView().getModel();

metaModel.setProperty("/Active", !model.data.set);
},

onSonderClicked : function(channelId, eventId, data){

this.getView().byId("mslMatGroup").setEnabled(data.data.set);

},

onNavBack : function(){
this.getView().getModel().setData({});
},

onCurrentModelSave : function(channelId, eventId, data, skipCheck, antos){
sap.ui.getCore().getModel("UIModel").setProperty("/DetailsErrors", false);

if(!skipCheck){
var validateRes = this.validateForm();
if ( !validateRes.result ){
sap.m.MessageBox.show(validateRes.text,{
 icon: sap.m.MessageBox.Icon.ERROR,
 title: "Fehler bei Validierung"});

sap.ui.getCore().getModel("UIModel").setProperty("/DetailsErrors", true);

return false;
}
}

var mdocArray = sap.ui.getCore().mdocArray;
this.jModel = this.getView().getModel();

var that = this;

var ds = this.jModel.getData();
if ( !ds.hasOwnProperty('DocContent') ) return true;

if(!antos || ds.DcSelected === "X"){
 this.onDocDetailGet();
}

if ( $.grep(mdocArray, function (e) { return e.DocContent == that.jModel.getData().DocContent } ).length == 0 )
{
if ( this.jModel.getData().DocContent ) {
mdocArray.push( JSON.parse(JSON.stringify(that.jModel.getData())));  }
}
else
{ $.each(mdocArray, function (e) {
if ( e.DocContent == that.jModel.getData().DocContent )
{ e = JSON.parse(JSON.stringify(that.jModel.getData())); }
})
}


var langAssignments = this.getView().getModel("lang").getData().langAssignments;
$.each(langAssignments, function(idx,obj){
var langArray = $.map(obj.Langs, function(o) { return o.Value; } )
sap.ui.getCore().langHandler.updateLangus(obj.DocContent, langArray);
});

return true;

},

langRead : function(oDocContent, item) {
var langModel = this.getView().getModel("lang");

var langHandler = sap.ui.getCore().langHandler;
if(!langHandler){
return;
}
langHandler.allLangs = sap.ui.getCore().allLangs;
langHandler.setDocContent(oDocContent, item.Vbeln, item.Posnr);


$.each(langHandler.myAssignments, function(i,o) {
var curr = o;
var map = $.map(sap.ui.getCore().allDCont, function(o) { if ( o.Value == curr.DocContent ) return o.Text } );
if (map.length > 0) { o.Text = map[0] };
});


langModel.setData({ langItems: langHandler.myItems,
           langValues: langHandler.myValues,
           allItems: sap.ui.getCore().allLangs,
           langAssignments: langHandler.myAssignments,
           isTopLevel: langHandler.isTopLevel });

},

onItemNavigated : function(channelId, eventId, model) {
var that  = this;
var bSkip = false;
var antos = false;
if(model.data.skipCheck){
 bSkip = model.data.skipCheck;
}
if(model.data.antos){
 antos = model.data.antos;
}
if(that.oDocListItem && that.oDocListItem.DcSelected === ""){
 bSkip = true;
}

that.resetFormLayout();

var bus = sap.ui.getCore().getEventBus();
bus.publish("model","sonder", {id:"DocList", data: {set: model.data.item.DcOption == "2"? true : false }});
var viewMModel = this.getView().getModel();
var bActive = viewMModel.getProperty("/SDDocCont_MetaSet/Active");

var oUiModel = sap.ui.getCore().getModel("UIModel");

if(!oUiModel){
oUiModel = new sap.ui.model.json.JSONModel();
oUiModel.setData({"DetailsErrors": false});
sap.ui.getCore().setModel(oUiModel, "UIModel");
}

var bFinalized = oUiModel.getProperty("/finalized");

if(bFinalized){
bActive = false;
}

if(bActive == true){
 bus.publish("model","disable", {id: "Details", data: {set: model.data.item.DcSelected == ""? true: false}});
}else{
 //bus.publish("model","disable", {id: "Details", data: {set: +model.data.item.DcOption == "0"? true: false}});
 bus.publish("model","disable", {id: "Details", data: {set: true}});
 //bSkip = true;
}

//
if(!this.onCurrentModelSave(null, null, null, bSkip, antos)){
var bus = sap.ui.getCore().getEventBus();
bus.publish("nav", "selectlist", {
id: "DocItems",
data: {
item:   that.oDocListItem
}
});
return; // Validation not succeeded
}

this.oDocListItem = model.data.item;
var jModel = this.getView().getModel();

var mdocArray = sap.ui.getCore().mdocArray;

var availModel = $.grep(mdocArray, function (e) { return e.DocContent == model.data.item.DocContent } );

this.langRead(model.data.item.DocContent, model.data.item);

var cmbPlansEfs = that.getView().byId("cmbPlansEfs");
var cmbSddcStatus = that.getView().byId("cmbSddcStatus");
var cmbDokart = that.getView().byId("cmbDokart");
var cmbPlansCre = that.getView().byId("cmbPlansCre");
var cmbPlansIfs = that.getView().byId("cmbPlansIfs");
var cmbPenal = that.getView().byId("cmbPenal");

if ( availModel.length > 0 ) {

var fldFinalDate = that.getView().byId("fldFinalDate");
var fldPrelimDate = that.getView().byId("fldPrelimDate");
cmbPlansEfs.unbindProperty("enabled", false);
cmbPlansEfs.setEnabled(true);
cmbPlansEfs.bindProperty("enabled", {path:'/Active'});

fldFinalDate.unbindProperty("enabled", false);
fldFinalDate.setEnabled(true);
fldFinalDate.bindProperty("enabled", {path:'/Active'});

fldPrelimDate.unbindProperty("enabled", false);
fldPrelimDate.setEnabled(true);
fldPrelimDate.bindProperty("enabled", {path:'/Active'});

if(this.getView().getModel().getProperty("/Active") === false){
 availModel[0].Active = this.getView().getModel().getProperty("/Active");
}

this.oClonedObject = this.getClonedObject(availModel[0]);

that.jModel.setData( availModel[0] );

cmbPlansEfs.setSelectedKey(cmbPlansEfs.getSelectedKey());
cmbSddcStatus.setSelectedKey(cmbSddcStatus.getSelectedKey());
cmbDokart.setSelectedKey(cmbDokart.getSelectedKey());
cmbPlansCre.setSelectedKey(cmbPlansCre.getSelectedKey());
cmbPlansIfs.setSelectedKey(cmbPlansIfs.getSelectedKey());
cmbPenal.setSelectedKey(cmbPenal.getSelectedKey());


setTimeout(function(){   }, 500);
that.onDocDetailSet();
//that.prepareForm();
that.validateForm();


var oOdataModel = that.getView().getModel("odata");

var bTemplateVisited = that.jModel.getProperty("/TemplVisited");

if(bTemplateVisited){
var oMetaModel = that.getView().getModel("meta");


var tblTemplate = availModel[0].SDDocCont_TemplSet.results;
var templateModel = that.getView().getModel("templateModel");
templateModel.setData(tblTemplate);

var cmbProfile1 = that.getView().byId("cmbProfile1");
   if(availModel[0].SDDocCont_TemplSet.results.length >= 1){
     cmbProfile1.setVisible(true);

     oMetaModel.read("/TemplateTextsSet",{
       json: true,
           filters: [new sap.ui.model.Filter('DocContent', 'EQ', availModel[0].SDDocCont_TemplSet.results[0].DocContent),
                 new sap.ui.model.Filter('Vbeln', 'EQ', availModel[0].SDDocCont_TemplSet.results[0].Vbeln),
                 new sap.ui.model.Filter('Posnr', 'EQ', availModel[0].SDDocCont_TemplSet.results[0].Posnr),
                 new sap.ui.model.Filter('Laiso', 'EQ', availModel[0].SDDocCont_TemplSet.results[0].Laiso),
                 new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
       success : function(data){

         if(data.results.length == 1){
           that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/0/Template",data.results[0].Template);
         }
//                      if(data.results.length == 2){
//                    	  var emptyIndex = -1;
//                    	  var fullIndex = -1;
//                    	  for(var iIndex = 0; iIndex < 2; iIndex++){
//                    		  if(data.results[iIndex].Template === ""){
//                    			  emptyIndex = iIndex;
//                    		  }else{
//                    			  fullIndex = iIndex;
//                    		  }
//                    	  }
//                    	  if(emptyIndex >= 0 && fullIndex >= 0){
//                    		  that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/0/Template",data.results[fullIndex].Template);
//                    	  }
//                      }

         var oJsonModel1 = new sap.ui.model.json.JSONModel();
         oJsonModel1.setData(data);

         that.getView().setModel(oJsonModel1,"templ1data");

       },
       error: function(error){
       }
     }
     );


   }else{
     cmbProfile1.setVisible(false);
   }

   var cmbProfile2 = that.getView().byId("cmbProfile2");
   if(availModel[0].SDDocCont_TemplSet.results.length >= 2){
     cmbProfile2.setVisible(true);

     oMetaModel.read("/TemplateTextsSet",{
       json: true,
       filters: [new sap.ui.model.Filter('DocContent', 'EQ', availModel[0].SDDocCont_TemplSet.results[1].DocContent),
                     new sap.ui.model.Filter('Vbeln', 'EQ', availModel[0].SDDocCont_TemplSet.results[1].Vbeln),
                     new sap.ui.model.Filter('Posnr', 'EQ', availModel[0].SDDocCont_TemplSet.results[1].Posnr),
                     new sap.ui.model.Filter('Laiso', 'EQ', availModel[0].SDDocCont_TemplSet.results[1].Laiso),
                     new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
       success : function(data){

         if(data.results.length == 1){
           that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/1/Template",data.results[0].Template);
         }
//                      if(data.results.length == 2){
//                    	  var emptyIndex = -1;
//                    	  var fullIndex = -1;
//                    	  for(var iIndex = 0; iIndex < 2; iIndex++){
//                    		  if(data.results[iIndex].Template === ""){
//                    			  emptyIndex = iIndex;
//                    		  }else{
//                    			  fullIndex = iIndex;
//                    		  }
//                    			&nbsp;&nbsp;
//                    	  }
//                    	  if(emptyIndex >= 0 && fullIndex >= 0){
//                    		  that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/1/Template",data.results[fullIndex].Template);
//                    	  }
//                      }

         var oJsonModel2 = new sap.ui.model.json.JSONModel();
         oJsonModel2.setData(data);
         that.getView().setModel(oJsonModel2,"templ2data");

       },
       error: function(error){
       }
     }
     );


   }else{
     cmbProfile2.setVisible(false);
   }

   var cmbProfile3 = that.getView().byId("cmbProfile3");
   if(availModel[0].SDDocCont_TemplSet.results.length >= 3){
     cmbProfile1.setVisible(true);

     oMetaModel.read("/TemplateTextsSet",{
       json: true,
       filters: [new sap.ui.model.Filter('DocContent', 'EQ', availModel[0].SDDocCont_TemplSet.results[2].DocContent),
                     new sap.ui.model.Filter('Vbeln', 'EQ', availModel[0].SDDocCont_TemplSet.results[2].Vbeln),
                     new sap.ui.model.Filter('Posnr', 'EQ', availModel[0].SDDocCont_TemplSet.results[2].Posnr),
                     new sap.ui.model.Filter('Laiso', 'EQ', availModel[0].SDDocCont_TemplSet.results[2].Laiso),
                     new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
       success : function(data){

         if(data.results.length == 1){
           that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/2/Template",data.results[0].Template);
         }
//                      if(data.results.length == 2){
//                    	  var emptyIndex = -1;
//                    	  var fullIndex = -1;
//                    	  for(var iIndex = 0; iIndex < 2; iIndex++){
//                    		  if(data.results[iIndex].Template === ""){
//                    			  emptyIndex = iIndex;
//                    		  }else{
//                    			  fullIndex = iIndex;
//                    		  }
//                    			&nbsp;&nbsp;
//                    	  }
//                    	  if(emptyIndex >= 0 && fullIndex >= 0){
//                    		  that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/2/Template",data.results[fullIndex].Template);
//                    	  }
//                      }

         var oJsonModel3 = new sap.ui.model.json.JSONModel();
         oJsonModel3.setData(data);
         that.getView().setModel(oJsonModel3,"templ3data");

       },
       error: function(error){
       }
     }
     );


   }else{
     cmbProfile3.setVisible(false);
   }
}

if(!bTemplateVisited)
oOdataModel.read("/SDDocCont_TemplSet", {
 json: true,
     filters: [new sap.ui.model.Filter('DocContent', 'EQ', availModel[0].DocContent),
           new sap.ui.model.Filter('Vbeln', 'EQ', availModel[0].Vbeln),
           new sap.ui.model.Filter('Posnr', 'EQ', availModel[0].Posnr),
           new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
 success : function(data){

   var oModelData = that.getView().getModel().getData();

   oModelData.SDDocCont_TemplSet = data;

   that.jModel.setProperty("/TemplVisited", true)

   that.oClonedObject = that.getClonedObject(oModelData);

   that.getView().getModel().setData(oModelData);

   var tblTemplate = data.results;
   var templateModel = that.getView().getModel("templateModel");
   templateModel.setData(tblTemplate);


   var oMetaModel = that.getView().getModel("meta");

   var cmbProfile1 = that.getView().byId("cmbProfile1");
   if(tblTemplate.length >= 1){
     cmbProfile1.setVisible(true);

     oMetaModel.read("/TemplateTextsSet",{
       json: true,
           filters: [new sap.ui.model.Filter('DocContent', 'EQ', tblTemplate[0].DocContent),
                 new sap.ui.model.Filter('Vbeln', 'EQ', tblTemplate[0].Vbeln),
                 new sap.ui.model.Filter('Posnr', 'EQ', tblTemplate[0].Posnr),
                 new sap.ui.model.Filter('Laiso', 'EQ', tblTemplate[0].Laiso),
                 new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
       success : function(data){

         if(data.results.length == 1){
           that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/0/Template",data.results[0].Template);
         }
//                      if(data.results.length == 2){
//                    	  var emptyIndex = -1;
//                    	  var fullIndex = -1;
//                    	  for(var iIndex = 0; iIndex < 2; iIndex++){
//                    		  if(data.results[iIndex].Template === ""){
//                    			  emptyIndex = iIndex;
//                    		  }else{
//                    			  fullIndex = iIndex;
//                    		  }
//                    			&nbsp;&nbsp;
//                    	  }
//                    	  if(emptyIndex >= 0 && fullIndex >= 0){
//                    		  that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/0/Template",data.results[fullIndex].Template);
//                    	  }
//                      }

         var oJsonModel1 = new sap.ui.model.json.JSONModel();
         oJsonModel1.setData(data);

         that.getView().setModel(oJsonModel1,"templ1data");

       },
       error: function(error){
       }
     }
     );


   }else{
     cmbProfile1.setVisible(false);
   }

   var cmbProfile2 = that.getView().byId("cmbProfile2");
   if(tblTemplate.length >= 2){
     cmbProfile2.setVisible(true);

     oMetaModel.read("/TemplateTextsSet",{
       json: true,
       filters: [new sap.ui.model.Filter('DocContent', 'EQ', tblTemplate[1].DocContent),
                     new sap.ui.model.Filter('Vbeln', 'EQ', tblTemplate[1].Vbeln),
                     new sap.ui.model.Filter('Posnr', 'EQ', tblTemplate[1].Posnr),
                     new sap.ui.model.Filter('Laiso', 'EQ', tblTemplate[1].Laiso),
                     new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
       success : function(data){

         if(data.results.length == 1){
           that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/1/Template",data.results[0].Template);
         }
//                      if(data.results.length == 2){
//                    	  var emptyIndex = -1;
//                    	  var fullIndex = -1;
//                    	  for(var iIndex = 0; iIndex < 2; iIndex++){
//                    		  if(data.results[iIndex].Template === ""){
//                    			  emptyIndex = iIndex;
//                    		  }else{
//                    			  fullIndex = iIndex;
//                    		  }
//                    			&nbsp;&nbsp;
//                    	  }
//                    	  if(emptyIndex >= 0 && fullIndex >= 0){
//                    		  that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/1/Template",data.results[fullIndex].Template);
//                    	  }
//                      }

         var oJsonModel2 = new sap.ui.model.json.JSONModel();
         oJsonModel2.setData(data);
         that.getView().setModel(oJsonModel2,"templ2data");

       },
       error: function(error){
       }
     }
     );


   }else{
     cmbProfile2.setVisible(false);
   }

   var cmbProfile3 = that.getView().byId("cmbProfile3");
   if(tblTemplate.length >= 3){
     cmbProfile1.setVisible(true);

     oMetaModel.read("/TemplateTextsSet",{
       json: true,
       filters: [new sap.ui.model.Filter('DocContent', 'EQ', tblTemplate[2].DocContent),
                     new sap.ui.model.Filter('Vbeln', 'EQ', tblTemplate[2].Vbeln),
                     new sap.ui.model.Filter('Posnr', 'EQ', tblTemplate[2].Posnr),
                     new sap.ui.model.Filter('Laiso', 'EQ', tblTemplate[2].Laiso),
                     new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
       success : function(data){

         if(data.results.length == 1){
           that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/2/Template",data.results[0].Template);
         }
         var oJsonModel3 = new sap.ui.model.json.JSONModel();
         oJsonModel3.setData(data);
         that.getView().setModel(oJsonModel3,"templ3data");

       },
       error: function(error){
       }
     }
     );


   }else{
     cmbProfile3.setVisible(false);
   }

 },
 error: function(error){

 }
});


var bus = sap.ui.getCore().getEventBus();
var bFinalized = sap.ui.getCore().getModel("UIModel").getProperty("/finalized");
if(!bFinalized){
if(availModel[0].SDDocCont_MetaSet.Active){
bus.publish("model", "disable", {id:"Details", data: {set: model.data.item.DcSelected == ""? true : false }});
}
}
}
else {
var sObjectPath = "/" + this.oModel.createKey("SDDocContSet", {
Vbeln : model.data.item.Vbeln,
Posnr : model.data.item.Posnr,
DocContent: model.data.item.DocContent });

this.Vbeln = model.data.item.Vbeln;
this.Posnr = model.data.item.Posnr;
this.DocContent = model.data.item.DocContent;
this.DcProfile = model.data.item.DcProfile;

var that = this;

this.oModel.read(sObjectPath,{
urlParameters: {
"$expand": "SDDocCont_MdcntSet,SDDocCont_MatklSet,SDDocCont_TargtSet,SDDocCont_MetaSet"
},
json: true,
success : function(data){
var jModel = that.getView().getModel();
try{
 data.PrelimDate = data.PrelimDate.toISOString();
}catch(e){}
try{
 data.FinalDate = data.FinalDate.toISOString();
}catch(e){}
data.Active = data.SDDocCont_MetaSet.Active;

var oOdataModel = that.getView().getModel("odata");

oOdataModel.read("/SDDocCont_TemplSet", {
 json: true,
     filters: [new sap.ui.model.Filter('DocContent', 'EQ', data.DocContent),
           new sap.ui.model.Filter('Vbeln', 'EQ', data.Vbeln),
           new sap.ui.model.Filter('Posnr', 'EQ', data.Posnr),
           new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
 success : function(data){

   var oModelData = that.getView().getModel().getData();

   oModelData.SDDocCont_TemplSet = data;

   that.oClonedObject = that.getClonedObject(oModelData);

   that.getView().getModel().setData(oModelData);

   var tblTemplate = data.results;
   var templateModel = that.getView().getModel("templateModel");
   templateModel.setData(tblTemplate);


   var oMetaModel = that.getView().getModel("meta");

   var cmbProfile1 = that.getView().byId("cmbProfile1");
   if(tblTemplate.length >= 1){
     cmbProfile1.setVisible(true);

     oMetaModel.read("/TemplateTextsSet",{
       json: true,
           filters: [new sap.ui.model.Filter('DocContent', 'EQ', tblTemplate[0].DocContent),
                 new sap.ui.model.Filter('Vbeln', 'EQ', tblTemplate[0].Vbeln),
                 new sap.ui.model.Filter('Posnr', 'EQ', tblTemplate[0].Posnr),
                 new sap.ui.model.Filter('Laiso', 'EQ', tblTemplate[0].Laiso),
                 new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
       success : function(data){

         if(data.results.length == 1){
           that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/0/Template",data.results[0].Template);
         }
         var oJsonModel1 = new sap.ui.model.json.JSONModel();
         oJsonModel1.setData(data);

         that.getView().setModel(oJsonModel1,"templ1data");

       },
       error: function(error){
       }
     }
     );


   }else{
     cmbProfile1.setVisible(false);
   }

   var cmbProfile2 = that.getView().byId("cmbProfile2");
   if(tblTemplate.length >= 2){
     cmbProfile2.setVisible(true);

     oMetaModel.read("/TemplateTextsSet",{
       json: true,
       filters: [new sap.ui.model.Filter('DocContent', 'EQ', tblTemplate[1].DocContent),
                     new sap.ui.model.Filter('Vbeln', 'EQ', tblTemplate[1].Vbeln),
                     new sap.ui.model.Filter('Posnr', 'EQ', tblTemplate[1].Posnr),
                     new sap.ui.model.Filter('Laiso', 'EQ', tblTemplate[1].Laiso),
                     new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
       success : function(data){

         if(data.results.length == 1){
           that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/1/Template",data.results[0].Template);
         }
         var oJsonModel2 = new sap.ui.model.json.JSONModel();
         oJsonModel2.setData(data);
         that.getView().setModel(oJsonModel2,"templ2data");

       },
       error: function(error){
       }
     }
     );


   }else{
     cmbProfile2.setVisible(false);
   }

   var cmbProfile3 = that.getView().byId("cmbProfile3");
   if(tblTemplate.length >= 3){
     cmbProfile1.setVisible(true);

     oMetaModel.read("/TemplateTextsSet",{
       json: true,
       filters: [new sap.ui.model.Filter('DocContent', 'EQ', tblTemplate[2].DocContent),
                     new sap.ui.model.Filter('Vbeln', 'EQ', tblTemplate[2].Vbeln),
                     new sap.ui.model.Filter('Posnr', 'EQ', tblTemplate[2].Posnr),
                     new sap.ui.model.Filter('Laiso', 'EQ', tblTemplate[2].Laiso),
                     new sap.ui.model.Filter('DcProfile', 'EQ', sap.ui.getCore().sProfile)],
       success : function(data){

         if(data.results.length == 1){
           that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/2/Template",data.results[0].Template);
         }
//                      if(data.results.length == 2){
//                    	  var emptyIndex = -1;
//                    	  var fullIndex = -1;
//                    	  for(var iIndex = 0; iIndex < 2; iIndex++){
//                    		  if(data.results[iIndex].Template === ""){
//                    			  emptyIndex = iIndex;
//                    		  }else{
//                    			  fullIndex = iIndex;
//                    		  }
//                    			&nbsp;&nbsp;
//                    	  }
//                    	  if(emptyIndex >= 0 && fullIndex >= 0){
//                    		  that.getView().getModel().setProperty("/SDDocCont_TemplSet/results/2/Template",data.results[fullIndex].Template);
//                    	  }
//                      }

         var oJsonModel3 = new sap.ui.model.json.JSONModel();
         oJsonModel3.setData(data);
         that.getView().setModel(oJsonModel3,"templ3data");

       },
       error: function(error){
         debugger;
       }
     }
     );


   }else{
     cmbProfile3.setVisible(false);
   }

 },
 error: function(error){

 }
});


   //var cmbPlansEfs = that.getView().byId("cmbPlansEfs");
   var fldFinalDate = that.getView().byId("fldFinalDate");
   var fldPrelimDate = that.getView().byId("fldPrelimDate");
   cmbPlansEfs.unbindProperty("enabled", false);
   cmbPlansEfs.setEnabled(true);
   cmbPlansEfs.bindProperty("enabled", {path:'/Active'});

   fldFinalDate.unbindProperty("enabled", false);
   fldFinalDate.setEnabled(true);
   fldFinalDate.bindProperty("enabled", {path:'/Active'});

   fldPrelimDate.unbindProperty("enabled", false);
   fldPrelimDate.setEnabled(true);
   fldPrelimDate.bindProperty("enabled", {path:'/Active'});

   that.oClonedObject = that.getClonedObject(data);
jModel.setData(data);
jModel.setProperty("/TemplVisited", true)

cmbPlansEfs.setSelectedKey(cmbPlansEfs.getSelectedKey());
   cmbSddcStatus.setSelectedKey(cmbSddcStatus.getSelectedKey());
   cmbDokart.setSelectedKey(cmbDokart.getSelectedKey());
   cmbPlansCre.setSelectedKey(cmbPlansCre.getSelectedKey());
   cmbPlansIfs.setSelectedKey(cmbPlansIfs.getSelectedKey());
   cmbPenal.setSelectedKey(cmbPenal.getSelectedKey());

var bus = sap.ui.getCore().getEventBus();
var bFinalized = sap.ui.getCore().getModel("UIModel").getProperty("/finalized");
if(!bFinalized){
 if(data.Active){
   bus.publish("model","disable", {id: "Details", data: { set: that.oDocListItem.DcSelected == ""? true : false }});
 }
}
that.onDocDetailSet();
if(data.Active){
 that.prepareForm();
 that.validateForm();
}
//that.getView().setModel(that.jModel);
}
} );
}


},

handleMessagePopoverPress : function(oEvent){
oMessagePopover.openBy(oEvent.getSource());
},

runValidate : function(oEvt){


this.validateForm();

},

onAllLanguSelection : function(oEvt){


var oChk = oEvt.getSource();
var bSelected = oChk.getSelected();

var oLangModel = oEvt.getSource().getModel("lang");

var oData = oLangModel.getData();

$.each(oData.langAssignments, function(idx, elem){
elem.Selected = bSelected;
});

oLangModel.setData(oData);

//var oTable =

},

onDocDetailGet: function() {

var jModel = this.getView().getModel();
var ds = jModel.getData("/");

var mcb = this.getView().byId("mslMatGroup");
var mgrpSet = mcb.getSelectedKeys();
ds.SDDocCont_MatklSet.results = $.map(mgrpSet, function(n) {
return { DocContent: ds.DocContent, Matkl: n};
})
mcb.rerender();

var mcbTarget = this.getView().byId("mslTarget");
var targetSet = mcbTarget.getSelectedKeys();
ds.SDDocCont_TargtSet.results = $.map(targetSet, function(n) {
return { DocContent: ds.DocContent, Target: n};
})
mcbTarget.rerender();

var langModel = this.getView().getModel("lang");
var mcbLang = this.getView().byId("mslLang");
var itemsSet = langModel.getProperty("/langItems");
var valuesSet = mcbLang.getSelectedKeys();
var valuesArr = [];
$.each(valuesSet, function(i,o){
var value = o;
$.each(itemsSet, function(idx, obj){
if(value == obj.Value){
valuesArr.push(value);
}
});
});
langModel.setProperty("/langValues", valuesArr);

if(sap.ui.getCore().langHandler){
sap.ui.getCore().langHandler.updateLangus(ds.DocContent, valuesArr);
}
},

onTokensUpdateNew : function(oEvt){

if(oEvt.getSource().getBinding("tokens")){

var aLangs = this.getView().getModel("lang").getProperty(oEvt.getSource().
getBinding("tokens").getContext().getPath()
+ "/Langs");

if(!aLangs){
aLangs = [];
}

var aAdded = oEvt.getParameter("addedTokens");
var aRemoved = oEvt.getParameter("removedTokens");

if(aAdded.length === 0 && aRemoved.length === 0){
return;
}

$.each(aAdded, function(idx, obj){
aLangs.push({Value: obj.getProperty("key"),
  Text : obj.getProperty("text")});
});

var aNewLangs = [];
if(aRemoved.length > 0){
$.each(aLangs, function(idx, obj){
var aGrep = $.grep(aRemoved, function(remObj, remIdx){
 return obj.Value === remObj.getProperty("key");
 });
if(aGrep.length === 0){
 aNewLangs.push(obj);
}
});
aLangs = aNewLangs;
}


//        var oFlg = false;
//        var oValue = oEvt.getParameter("token").getProperty("key");
//        $.each(aLangs, function(idx, obj){
//          if(obj.Value === oValue)
//          {
//            oFlg = true;
//          }
//        });
//        if(oFlg){
//          return;
//        }
//        var aNewLangs = [];
//        if(eType === "removed"){
//          $.each(aLangs, function(idx, obj){
//            if(obj.Value !== oValue){
//              aNewLangs.push(obj);
//            }
//          });
//          aLangs = aNewLangs;
//        }else{
//          aLangs.push({Value: oValue,
//                   Text : oEvt.getParameter("token").getProperty("text")});
//        }
this.getView().getModel("lang").setProperty(oEvt.getSource().getBinding("tokens").
 getContext().getPath() + "/Langs", aLangs);
}
},

onTokensUpdate : function(oEvt){

if(oEvt.getSource().getBinding("tokens")){

var aLangs = this.getView().getModel("lang").getProperty(oEvt.getSource().
getBinding("tokens").getContext().getPath()
+ "/Langs");

if(!aLangs){
aLangs = [];
}

if(!oEvt.getParameter("token")){
return;
}

if(oEvt.getParameter("token") &&
oEvt.getParameter("token").getProperty("key").length == 0){
return;
}


var eType = oEvt.getParameter("type");
var oFlg = false;
var oValue = oEvt.getParameter("token").getProperty("key");
$.each(aLangs, function(idx, obj){
if(obj.Value === oValue)
{
oFlg = true;
}
});
if(oFlg){
return;
}
var aNewLangs = [];
if(eType === "removed"){
$.each(aLangs, function(idx, obj){
if(obj.Value !== oValue){
 aNewLangs.push(obj);
}
});
aLangs = aNewLangs;
}else{
aLangs.push({Value: oValue,
      Text : oEvt.getParameter("token").getProperty("text")});
}
this.getView().getModel("lang").setProperty(oEvt.getSource().getBinding("tokens").
 getContext().getPath() + "/Langs", aLangs);
}
},

deriveLanguages : function(oEvent){

var mslLang = this.getView().byId("mslLang");

var selected = mslLang.getSelectedKeys();

var oAssignments = this.getView().getModel("lang").getProperty("/langAssignments");

$.each(oAssignments, function(idx, obj){
if(obj.Selected){
$.each(selected, function(i, o){
var selectedVal = o;
if($.grep(obj.Langs, function(object){
 return object.Value === selectedVal
}).length === 0){
 var textLine = $.grep(sap.ui.getCore().allLangs, function(obj){});
 var text = $.map(sap.ui.getCore().allLangs, function(o){
   if(selectedVal === o.Value){return o.Text;}
 }).toString();
 obj.Langs.push({Value:selectedVal, Text: text});
}
})
}
});


var oModel = this.getView().getModel("lang");
oModel.refresh();



},

onCheckbox : function(oEvent){

var oTable = this.getView().byId("tblLang");
},

onDocDetailSet: function() {

var jModel = this.getView().getModel();
var ds = jModel.getData("/");

var mcb = this.getView().byId("mslMatGroup");
var mgrpSet = $.map(ds.SDDocCont_MatklSet.results, function(n) {
return n.Matkl;
});
mcb.setSelectedKeys(mgrpSet);
mcb.rerender();



var mcbTarget = this.getView().byId("mslTarget");
var targetSet = $.map(ds.SDDocCont_TargtSet.results, function(n) {
return n.Target;
});
mcbTarget.setSelectedKeys(targetSet);
mcbTarget.rerender();

var langModel = this.getView().getModel("lang");
var oData = langModel.getData();
var mcbLang = this.getView().byId("mslLang");

mcbLang.setSelectedKeys(oData.langValues);

mcbLang.rerender();

var oKey1 = this.getView().byId("cmbKeyword1");
oKey1.destroyItems();

var aKey1 = ds.Keyword1.split(";");
$.each(aKey1, function(idx, el){
var oNewItem = new sap.ui.core.Item(idx);
oNewItem.setKey(el);
oNewItem.setText(el);
oKey1.insertItem( oNewItem );
});

oKey1.setSelectedKeys(aKey1);

var oKey2 = this.getView().byId("cmbKeyword2");
oKey2.destroyItems();

if(oKey2){
var aKey2 = ds.Keyword2.split(";");
$.each(aKey2, function(idx, el){
var oNewItem = new sap.ui.core.Item(idx);
oNewItem.setKey(el);
oNewItem.setText(el);
oKey2.insertItem( oNewItem );
});

oKey2.setSelectedKeys(aKey2);
}
},

resetFormLayout : function(){
var cmb = this.getView().byId("cmbDokart");
cmb.setValueState(sap.ui.core.ValueState.None);

var oBemerkung = this.getView().byId("fldComment");
oBemerkung.setValueState(sap.ui.core.ValueState.None);
var oCmbSddcStatus = this.getView().byId("cmbSddcStatus");
oCmbSddcStatus.setValueState(sap.ui.core.ValueState.None);
var cmbFreiStelle = this.getView().byId("cmbPlansEfs");
cmbFreiStelle.setValueState(sap.ui.core.ValueState.None);

},

recheckComboboxes : function(oParams){
var oCmb = oParams.that.byId("cmbPlansEfs");
oCmb.setValue(oCmb.getSelectedItem().getProperty("text"));

oCmb = oParams.that.byId("cmbSddcStatus");
oCmb.setValue(oCmb.getSelectedItem().getProperty("text"));

oCmb = oParams.that.byId("cmbDokart");
oCmb.setValue(oCmb.getSelectedItem().getProperty("text"));

oCmb = oParams.that.byId("cmbPlansCre");
oCmb.setValue(oCmb.getSelectedItem().getProperty("text"));

oCmb = oParams.that.byId("cmbPlansIfs");
oCmb.setValue(oCmb.getSelectedItem().getProperty("text"));

oCmb = oParams.that.byId("cmbPenal");
oCmb.setValue(oCmb.getSelectedItem().getProperty("text"));


},

prepareForm : function(){
//      var cmbPlansEfs = this.getView().byId("cmbPlansEfs");
//      cmbPlansEfs.unbindProperty("enabled", false);
//
//      cmbPlansEfs.setEnabled(true);
//
//          cmbPlansEfs.bindProperty("enabled", {path:'/Active'});
//
var fldTemp = this.getView().byId("cmbSddcStatus");
fldTemp.setEnabled(true);
var fldTemp = this.getView().byId("cmbDokart");
fldTemp.setEnabled(true);
var fldTemp = this.getView().byId("cmbPlansCre");
fldTemp.setEnabled(true);
var fldTemp = this.getView().byId("fldPrelimDate");
fldTemp.setEnabled(true);
var fldTemp = this.getView().byId("cmbPlansIfs");
fldTemp.setEnabled(true);
var fldTemp = this.getView().byId("cmbPlansEfs");
fldTemp.setEnabled(true);
var fldTemp = this.getView().byId("fldCustDocNo");
fldTemp.setEnabled(true);
var fldTemp = this.getView().byId("cmbPenal");
fldTemp.setEnabled(true);
var fldTemp = this.getView().byId("fldComment");
fldTemp.setEnabled(true);

var fldFinalDate = this.getView().byId("fldFinalDate");

fldFinalDate.setEnabled(true);
},

validateForm: function() {
var sMsg = "";
var sString = "";

var jModel = this.getView().getModel();

var that = this;

var oBundle = that.getView().getModel("i18n").getResourceBundle();

var cmb = this.getView().byId("cmbDokart");
if (cmb.getValue() === "") {
jModel.setProperty("/Status2", sap.ui.core.ValueState.Error);
}
else
{
//cmb.setValueState(sap.ui.core.ValueState.None );
jModel.setProperty("/Status2", sap.ui.core.ValueState.None);
sString = "";
}

sMsg += " " + sString;

var oCmb = this.getView().byId("cmbPlansCre");
if(oCmb.getValue() === ""){
jModel.setProperty("/Status3", sap.ui.core.ValueState.Error);
}else{
jModel.setProperty("/Status3", sap.ui.core.ValueState.None);
sString = "";
}

sMsg += " " + sString;

var oListModel = this.getOwnerComponent().getModel("DocList");

var oDocList = {};

var currentDocContent = this.getView().getModel().getData().DocContent;

$.each(oListModel.getData().results, function(idx, elem){
if(elem.DocContent == currentDocContent){
 oDocList = elem;
}
});

if(oDocList.DcOption == "2"){
var oBemerkung = this.getView().byId("fldComment");
if(oBemerkung.getValue() === ""){
 jModel.setProperty("/Status10", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateDescr");
}else{
 jModel.setProperty("/Status10", sap.ui.core.ValueState.None);
 sString = "";
}

sMsg += " " + sString;
}

var oCmbSddcStatus = this.getView().byId("cmbSddcStatus");
if(oCmbSddcStatus.getValue() == ""){
jModel.setProperty("/Status1", sap.ui.core.ValueState.Error);
}else{
jModel.setProperty("/Status1", sap.ui.core.ValueState.None);
sString = "";
}

sMsg += " " + sString;

var sStatus = oCmbSddcStatus.getSelectedKey();
var fldFinalDate = this.getView().byId("fldFinalDate");
if(sStatus == "3" || sStatus == "4"){
//fldFinalDate.unbindProperty("enabled", false);
//fldFinalDate.setValueState(sap.ui.core.ValueState.None);
jModel.setProperty("/Status6", sap.ui.core.ValueState.None);
//cmbFreiStelle.setSelectedKey("");

//////fldFinalDate.setEnabled(false);

}else{
//////fldFinalDate.setEnabled(true);

sMsg += " " + sString;
}

sMsg += " " + sString;

var cmbFreiStelle = this.getView().byId("cmbPlansEfs");
var fldPrelim = this.getView().byId("fldPrelimDate");


if(sStatus == "IU" || sStatus == "5" || sStatus == "6"){
cmbFreiStelle.unbindProperty("enabled", false);
jModel.setProperty("/Status5", sap.ui.core.ValueState.None);
cmbFreiStelle.setSelectedKey("");

cmbFreiStelle.unbindProperty("enabled", false);
cmbFreiStelle.setEnabled(false);
cmbFreiStelle.bindProperty("enabled", {path:'/Active'});

//fldPrelim.unbindProperty("enabled", false);

jModel.setProperty("/Status4", sap.ui.core.ValueState.None);

fldPrelim.unbindProperty("enabled", false);
fldPrelim.setEnabled(false);
fldPrelim.bindProperty("enabled", {path:'/Active'});

}else{
fldPrelim.unbindProperty("enabled", false);
fldPrelim.setEnabled(true);
fldPrelim.bindProperty("enabled", {path:'/Active'});

cmbFreiStelle.unbindProperty("enabled", false);
cmbFreiStelle.setEnabled(true);
cmbFreiStelle.bindProperty("enabled", {path:'/Active'});

if(cmbFreiStelle.getValue() == ""){

}else{
 jModel.setProperty("/Status5", sap.ui.core.ValueState.None);
 sString = "";
}

sMsg += " " + sString;
}

var cmbPlansEfs = this.getView().byId("cmbPlansEfs");
var fldFinalDate = this.getView().byId("fldFinalDate");
var fldPrelimDate = this.getView().byId("fldPrelimDate");

switch(sStatus){
case "1": {
jModel.setProperty("/Status1", sap.ui.core.ValueState.None);
if(this.getView().byId("cmbDokart").getValue() == ""){
 jModel.setProperty("/Status2", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateDoctype");
}else{
 jModel.setProperty("/Status2", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;
if(this.getView().byId("fldPrelimDate").getValue() == ""){
 jModel.setProperty("/Status4", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidatePrelimDate");

}else{
 jModel.setProperty("/Status4", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;
if(this.getView().byId("fldFinalDate").getValue() == ""){
 jModel.setProperty("/Status6", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateFinalDate");

}else{
 jModel.setProperty("/Status6", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;
if(this.getView().byId("cmbPlansCre").getValue() == ""){
 jModel.setProperty("/Status3", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateCreator");
}else{
 jModel.setProperty("/Status3", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;
jModel.setProperty("/Status5", sap.ui.core.ValueState.None);

jModel.setProperty("/Status7", sap.ui.core.ValueState.None);
jModel.setProperty("/Status8", sap.ui.core.ValueState.None);
jModel.setProperty("/Status9", sap.ui.core.ValueState.None);
jModel.setProperty("/Status10", sap.ui.core.ValueState.None);

cmbPlansEfs.unbindProperty("enabled", false);
cmbPlansEfs.setValue("");
cmbPlansEfs.setEnabled(false);
//cmbPlansEfs.bindProperty("enabled", {path:'/Active'});

fldFinalDate.unbindProperty("enabled", false);
fldFinalDate.setEnabled(true);
fldFinalDate.bindProperty("enabled", {path:'/Active'});

fldPrelimDate.unbindProperty("enabled", false);
fldPrelimDate.setEnabled(true);
fldPrelimDate.bindProperty("enabled", {path:'/Active'});

break;}
case "2": {
jModel.setProperty("/Status1", sap.ui.core.ValueState.None);
if(this.getView().byId("cmbDokart").getValue() == ""){
 jModel.setProperty("/Status2", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateDoctype");
}else{
 jModel.setProperty("/Status2", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;
if(this.getView().byId("fldPrelimDate").getValue() == ""){
 jModel.setProperty("/Status4", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidatePrelimDate");

}else{
 jModel.setProperty("/Status4", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

if(this.getView().byId("fldFinalDate").getValue() == ""){
 jModel.setProperty("/Status6", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateFinalDate");

}else{
 jModel.setProperty("/Status6", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

if(this.getView().byId("cmbPlansCre").getValue() == ""){
 jModel.setProperty("/Status3", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateCreator");
}else{
 jModel.setProperty("/Status3", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

jModel.setProperty("/Status5", sap.ui.core.ValueState.None);

if(this.getView().byId("cmbPlansEfs").getValue() == ""){
jModel.setProperty("/Status7", sap.ui.core.ValueState.Error);
sString = oBundle.getText("msgValidateExtern");
}else{
jModel.setProperty("/Status7", sap.ui.core.ValueState.None);
sString = "";
}
sMsg += " " + sString;

jModel.setProperty("/Status8", sap.ui.core.ValueState.None);
jModel.setProperty("/Status9", sap.ui.core.ValueState.None);
jModel.setProperty("/Status10", sap.ui.core.ValueState.None);

cmbPlansEfs.unbindProperty("enabled", false);
cmbPlansEfs.setEnabled(true);
cmbPlansEfs.bindProperty("enabled", {path:'/Active'});

fldFinalDate.unbindProperty("enabled", false);
fldFinalDate.setEnabled(true);
fldFinalDate.bindProperty("enabled", {path:'/Active'});

fldPrelimDate.unbindProperty("enabled", false);
fldPrelimDate.setEnabled(true);
fldPrelimDate.bindProperty("enabled", {path:'/Active'});

break;}
case "3": {
jModel.setProperty("/Status1", sap.ui.core.ValueState.None);
if(this.getView().byId("cmbDokart").getValue() == ""){
 jModel.setProperty("/Status2", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateDoctype");
}else{
 jModel.setProperty("/Status2", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

if(this.getView().byId("cmbPlansCre").getValue() == ""){
 jModel.setProperty("/Status3", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateCreator");
}else{
 jModel.setProperty("/Status3", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

if(this.getView().byId("fldPrelimDate").getValue() == ""){
 jModel.setProperty("/Status4", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidatePrelimDate");

}else{
 jModel.setProperty("/Status4", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

jModel.setProperty("/Status5", sap.ui.core.ValueState.None);
jModel.setProperty("/Status6", sap.ui.core.ValueState.None);
jModel.setProperty("/Status7", sap.ui.core.ValueState.None);
jModel.setProperty("/Status8", sap.ui.core.ValueState.None);
jModel.setProperty("/Status9", sap.ui.core.ValueState.None);
jModel.setProperty("/Status10", sap.ui.core.ValueState.None);

cmbPlansEfs.unbindProperty("enabled", false);
cmbPlansEfs.setValue("");
cmbPlansEfs.setEnabled(false);
//cmbPlansEfs.bindProperty("enabled", {path:'/Active'});

fldFinalDate.unbindProperty("enabled", false);
fldFinalDate.setValue("");
fldFinalDate.setEnabled(false);

fldPrelimDate.unbindProperty("enabled", false);
fldPrelimDate.setEnabled(true);
fldPrelimDate.bindProperty("enabled", {path:'/Active'});
break;}
case "4": {
jModel.setProperty("/Status1", sap.ui.core.ValueState.None);
if(this.getView().byId("cmbDokart").getValue() == ""){
 jModel.setProperty("/Status2", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateDoctype");
}else{
 jModel.setProperty("/Status2", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

if(this.getView().byId("cmbPlansCre").getValue() == ""){
 jModel.setProperty("/Status3", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateCreator");
}else{
 jModel.setProperty("/Status3", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

if(this.getView().byId("fldPrelimDate").getValue() == ""){
 jModel.setProperty("/Status4", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidatePrelimDate");

}else{
 jModel.setProperty("/Status4", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

jModel.setProperty("/Status5", sap.ui.core.ValueState.None);
jModel.setProperty("/Status6", sap.ui.core.ValueState.None);

if(this.getView().byId("cmbPlansEfs").getValue() == ""){
jModel.setProperty("/Status7", sap.ui.core.ValueState.Error);
sString = oBundle.getText("msgValidateExtern");
}else{
jModel.setProperty("/Status7", sap.ui.core.ValueState.None);
sString = "";
}
sMsg += " " + sString;

jModel.setProperty("/Status8", sap.ui.core.ValueState.None);
jModel.setProperty("/Status9", sap.ui.core.ValueState.None);
jModel.setProperty("/Status10", sap.ui.core.ValueState.None);

cmbPlansEfs.unbindProperty("enabled", false);
cmbPlansEfs.setEnabled(true);
cmbPlansEfs.bindProperty("enabled", {path:'/Active'});

fldFinalDate.unbindProperty("enabled", false);
fldFinalDate.setValue("");
fldFinalDate.setEnabled(false);

fldPrelimDate.unbindProperty("enabled", false);
fldPrelimDate.setEnabled(true);
fldPrelimDate.bindProperty("enabled", {path:'/Active'});
break;}
case "5": {
jModel.setProperty("/Status1", sap.ui.core.ValueState.None);
if(this.getView().byId("cmbDokart").getValue() == ""){
 jModel.setProperty("/Status2", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateDoctype");
}else{
 jModel.setProperty("/Status2", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

if(this.getView().byId("cmbPlansCre").getValue() == ""){
 jModel.setProperty("/Status3", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateCreator");
}else{
 jModel.setProperty("/Status3", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

jModel.setProperty("/Status4", sap.ui.core.ValueState.None);
jModel.setProperty("/Status5", sap.ui.core.ValueState.None);

if(this.getView().byId("fldFinalDate").getValue() == ""){
 jModel.setProperty("/Status6", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateFinalDate");

}else{
 jModel.setProperty("/Status6", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

jModel.setProperty("/Status7", sap.ui.core.ValueState.None);
jModel.setProperty("/Status8", sap.ui.core.ValueState.None);
jModel.setProperty("/Status9", sap.ui.core.ValueState.None);
jModel.setProperty("/Status10", sap.ui.core.ValueState.None);

cmbPlansEfs.unbindProperty("enabled", false);
cmbPlansEfs.setValue("");
cmbPlansEfs.setEnabled(false);
//cmbPlansEfs.bindProperty("enabled", {path:'/Active'});

fldFinalDate.unbindProperty("enabled", false);
fldFinalDate.setEnabled(true);
fldFinalDate.bindProperty("enabled", {path:'/Active'});

fldPrelimDate.unbindProperty("enabled", false);
fldPrelimDate.setValue("");
fldPrelimDate.setEnabled(false);
break;}
case "6": {
jModel.setProperty("/Status1", sap.ui.core.ValueState.None);
if(this.getView().byId("cmbDokart").getValue() == ""){
 jModel.setProperty("/Status2", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateDoctype");
}else{
 jModel.setProperty("/Status2", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

if(this.getView().byId("cmbPlansCre").getValue() == ""){
 jModel.setProperty("/Status3", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateCreator");
}else{
 jModel.setProperty("/Status3", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

jModel.setProperty("/Status4", sap.ui.core.ValueState.None);
jModel.setProperty("/Status5", sap.ui.core.ValueState.None);

if(this.getView().byId("fldFinalDate").getValue() == ""){
 jModel.setProperty("/Status6", sap.ui.core.ValueState.Error);
 sString = oBundle.getText("msgValidateFinalDate");

}else{
 jModel.setProperty("/Status6", sap.ui.core.ValueState.None);
 sString = "";
}
sMsg += " " + sString;

jModel.setProperty("/Status7", sap.ui.core.ValueState.None);
jModel.setProperty("/Status8", sap.ui.core.ValueState.None);
jModel.setProperty("/Status9", sap.ui.core.ValueState.None);
jModel.setProperty("/Status10", sap.ui.core.ValueState.None);

cmbPlansEfs.unbindProperty("enabled", false);
cmbPlansEfs.setValue("");
cmbPlansEfs.setEnabled(false);
//cmbPlansEfs.bindProperty("enabled", {path:'/Active'});

fldFinalDate.unbindProperty("enabled", false);
fldFinalDate.setEnabled(true);
fldFinalDate.bindProperty("enabled", {path:'/Active'});

fldPrelimDate.unbindProperty("enabled", false);
fldPrelimDate.setValue("");
fldPrelimDate.setEnabled(false);
break;}

}

if(sMsg.trim().length > 0){
return {result: false, text: sMsg};
}else{

return {result: true, text : sMsg};
}
},

addMdcntRow: function() {
var oData = this.getView().getModel().getData();
var sdDocMdcnt = oData.SDDocCont_MdcntSet.results;
if(sdDocMdcnt){
sdDocMdcnt.push(
{ DocContent: oData.DocContent, DocKind: "", Langu: "", MdCount: "", Medium: "" });
}else{
sdDocMdcnt = [{ DocContent: oData.DocContent, DocKind: "", Langu: "", MdCount: "", Medium: "" }];
oData.SDDocCont_MdcntSet.results = sdDocMdcnt;
//this.getView().getModel().setData(oData);
};
this.getView().getModel().setData(oData);

//      this.getView().getModel("json").refresh();

},

validateNumber : function(evt, obj ){
var testNumber = evt.getSource().getValue();
var noSpaces = testNumber.replace(/ +/, '');
var isNum = /^\d+$/.test(noSpaces);
if ( ! isNum ){
evt.getSource().setValueState(sap.ui.core.ValueState.Error);
}else{
evt.getSource().setValueState(sap.ui.core.ValueState.None);
}
},

deleteMdcntRow: function(evt) {

var jsonModel = this.getView().getModel();
var oLine = evt.getSource().getBindingContext().getObject();
var oData = jsonModel.getData();
var index = oData.SDDocCont_MdcntSet.results.indexOf(oLine);

if(index > -1){
oData.SDDocCont_MdcntSet.results.splice(index,1);
jsonModel.setData(oData);
}

//jsonModel.refresh();

}

});
});