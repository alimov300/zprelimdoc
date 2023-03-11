sap.ui.define([
  "../controller/BaseController",
 // "sap/ui/core/mvc/Controller",
  "../model/formatter",
  'sap/m/MessagePopover',
  'sap/m/MessagePopoverItem',
  'sap/m/Link',
  'sap/ui/model/json/JSONModel',
  "sap/ui/core/UIComponent"
], function (BaseController, formatter, MessagePopover, MessagePopoverItem, Link, JSONModel, UIComponent) {
  "use strict";

  var oLink = new Link({
    text: "Show more information",
    href: "http://sap.com",
    target: "_blank"
  });

  var oMessageTemplate = new MessagePopoverItem({
    type: '{type}',
    title: '{title}',
    description: '{description}',
    subtitle: '{subtitle}',
    counter: '{counter}'
    //	link: oLink
  });

  var oMessagePopover = new MessagePopover({
    items: {
      path: '/items',
      template: oMessageTemplate
    }
  });

  return BaseController.extend("zprelimdoc.controller.SD", {
    formatter: formatter,
    onInit: function () {
      var sService = "/sap/opu/odata/SAP/ZPRELIMDOC_UTILS_SRV";
      var msgModel = new JSONModel();
      msgModel.setData({ messagesLength: 0, items: [] });
      this.getView().setModel(msgModel, "msgModel");
      oMessagePopover.setModel(msgModel);

      var that = this;

      this.getView().addEventDelegate({
        onBeforeShow: function (oEvt) {

          var sVbelnVal = that.getView().byId("vbeln").getValue();

          if (sVbelnVal !== "") {
            that.onReadPos();
          }
        }
      });

      var globalMetaData = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/SAP/ZPRELIMDOC_META_SRV");
      globalMetaData.read("/DomainValuesSet", {
        json: true,
        filters: [new sap.ui.model.Filter("Fieldname", sap.ui.model.FilterOperator.EQ, "Lang")],
        success: function (data) {

          var globalMetaModel = new sap.ui.model.json.JSONModel(data);

          sap.ui.getCore().allLangs = data.results;

          globalMetaModel.setData(data.results);
          that.getView().setModel(globalMetaModel, "global");
        }
      });
      globalMetaData.read("/DomainValuesSet", {
        json: true,
        filters: [new sap.ui.model.Filter("Fieldname", sap.ui.model.FilterOperator.EQ, "DocContent")],
        success: function (data) {
          sap.ui.getCore().allDCont = data.results;
        }
      });


      this.metaModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/SAP/ZPRELIMDOC_META_SRV",
        { useBatch: true });
      this.getView().setModel(this.metaModel, "meta");

      var oModel = new sap.ui.model.json.JSONModel();
      this.getView().setModel(oModel);
      var rModel = new sap.ui.model.odata.ODataModel(sService, {
        json: true,
        useBatch: false
      });
      rModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
      this.getView().setModel(rModel, "reader");
    },

    _onBindingChange: function () {


    },

    emailValidate: function (evt) {
      var bSave1 = true;
      var bSave2 = true;
      var bSave3 = true;
      //var email = evt.getSource().getValue();
      var oEmail = this.getView().byId("email1");
      var email = oEmail.getValue();
      //			if(email === ""){
      //				oEmail.setValueState(sap.ui.core.ValueState.None);
      //				bSave1 = true;
      //				//return;
      //			}
      var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
      if (!mailregex.test(email) && email !== "") {
        alert(email + " is not a valid email address");
        oEmail.setValueState(sap.ui.core.ValueState.Error);
        bSave1 = false;

      } else {
        oEmail.setValueState(sap.ui.core.ValueState.None);
        bSave1 = true;
      }

      var oEmail = this.getView().byId("email2");
      var email = oEmail.getValue();
      //			if(email === ""){
      //				oEmail.setValueState(sap.ui.core.ValueState.None);
      //				bSave2 = true;
      //				//return;
      //			}
      var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
      if (!mailregex.test(email) && email !== "") {
        alert(email + " is not a valid email address");
        oEmail.setValueState(sap.ui.core.ValueState.Error);
        bSave2 = false;

      } else {
        oEmail.setValueState(sap.ui.core.ValueState.None);
        bSave2 = true;
      }

      var oEmail = this.getView().byId("email3");
      var email = oEmail.getValue();
      //			if(email === ""){
      //				oEmail.setValueState(sap.ui.core.ValueState.None);
      //				bSave3 = true;
      //				//return;
      //			}
      var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
      if (!mailregex.test(email) && email !== "") {
        alert(email + " is not a valid email address");
        oEmail.setValueState(sap.ui.core.ValueState.Error);
        bSave3 = false;

      } else {
        oEmail.setValueState(sap.ui.core.ValueState.None);
        bSave3 = true;
      }

      if (!bSave1 || !bSave2 || !bSave3) {
        this.getView().byId("buttonSv").setEnabled(false);
      } else {
        this.getView().byId("buttonSv").setEnabled(true);
      }

    },

    onSavePress: function () {

      this.getView().getModel("reader").submitChanges();
    },

    onReadPos: function () {
      var that = this;
      var sVbeln = that.getView().byId("vbeln").getValue();
      if (sVbeln === "") {
        return;
      }
      var rModel = this.getView().getModel("reader");

      var sObjectPath = rModel.createKey("ContactDataSet", {
        Vbeln: that.getView().byId("vbeln").getValue()
      });

      this.getView().byId("contactPanel").bindObject({
        path: "/" + sObjectPath,
        model: "reader",
        events: {
          change: this._onBindingChange.bind(this),
          dataRequested: function () {

            //oViewModel.setProperty("/busy", true);
          },
          dataReceived: function () {

            //oViewModel.setProperty("/busy", false);
          }
        }
      });

      rModel.callFunction("/ReadPos",
        {
          method: "GET", urlParameters: {
            Vbeln: that.getView().byId("vbeln").getValue(),
            Filter_off: that.getView().byId("btnFilter").getPressed()
          },

          success: function (oData, Resp) {
            that.getView().getModel().setData(oData.results);
            if (!oData.results || oData.results.length == 0) {
              var oBundle = that.getView().getModel("i18n").getResourceBundle();
              var sMsg = oBundle.getText("msgSDocNotFound", that.getView().byId("vbeln").getValue());
              var newMsgs = {
                messagesLength: 1,
                items: [
                  {
                    type: oBundle.getText("msgError"),
                    title: sMsg,
                    description: sMsg,
                    //subtitle: 'Example of subtitle',
                    counter: 1
                  }]
              };
              that.getView().byId('miDefLangu').setTokens([]);
            }
            else {
              that.readDefLangu();
            }
            that.getView().getModel("msgModel").setData(newMsgs);
            if (!oData.results || oData.results.length == 0) {
              that.handleMessagePopover();
            }

          },
          error: function (oData, Resp) {
            var oBundle = that.getView().getModel("i18n").getResourceBundle();
            var sMsg = "";
            try {
              var oResponse = JSON.parse(oData.response.body);
              sMsg = oResponse.error.message.value;
            } catch (e) {
              sMsg = oBundle.getText("msgSDocNotFound", that.getView().byId("vbeln"));
            }

            var newMsgs = {
              messagesLength: 1,
              items: [
                {
                  type: oBundle.getText("msgError"),
                  title: oBundle.getText("msgErrorTitle"),
                  description: sMsg,
                  //subtitle: 'Example of subtitle',
                  counter: 1
                }
              ]
            };
            that.getView().getModel("msgModel").setData(newMsgs);
            that.handleMessagePopover();
          },
          async: false
        });
    },

    handleMessagePopover: function () {
      oMessagePopover.openBy(this.getView().getContent()[0].getAggregation('footer').getContent()[0]);
    },
    handleMessagePopoverPress: function (oEvent) {

      oMessagePopover.openBy(oEvent.getSource());
    },

    readDefLangu: function () {
      var that = this;
      var rModel = this.getView().getModel("reader");
      rModel.callFunction("/ReadDefLangu",
        {
          method: "GET", urlParameters: { Vbeln: that.getView().byId("vbeln").getValue() },
          success: function (oData, Resp) {
            var defLangArray = $.map(oData.results, function (e) { return new sap.m.Token({ key: e.Spras, text: e.Sptxt }); });
            that.getView().byId('miDefLangu').setTokens(defLangArray);
          },
          error: function (oData, Resp) {
            var oBundle = that.getView().getModel("i18n").getResourceBundle();
            var sMsg = "";
            try {
              var oResponse = JSON.parse(oData.response.body);
              sMsg = oResponse.error.message.value;
            }
            catch (e) {
              sMsg = oBundle.getText("msgSDocNotFound", that.getView().byId("vbeln"));
            }
            var newMsgs = {
              messagesLength: 1,
              items: [
                {
                  type: oBundle.getText("msgError"),
                  title: oBundle.getText("msgErrorTitle"),
                  description: sMsg,
                  //subtitle: 'Example of subtitle',
                  counter: 1
                }
              ]
            };
            that.getView().getModel("msgModel").setData(newMsgs);
            that.handleMessagePopover();
          },
          async: false
        });

    },

    saveDefLangu: function () {
      var that = this;
      var langStr = "";
      var rModel = this.getView().getModel("reader");

      $.each(that.getView().byId('miDefLangu').getTokens(),
        function (indx, obj) {
          langStr = langStr + obj.getProperty("key") + ';';
        }
      );

      rModel.callFunction("SaveDefLangu",
        {
          method: "GET", urlParameters: { Vbeln: that.getView().byId("vbeln").getValue(), LangStr: langStr },
          success: function (oData, Resp) {
          },
          error: function (oData, Resp) {
            var oBundle = that.getView().getModel("i18n").getResourceBundle();
            var sMsg = "";
            try {
              var oResponse = JSON.parse(oData.response.body);
              sMsg = oResponse.error.message.value;
            }
            catch (e) {
              sMsg = oBundle.getText("msgSDocNotFound", that.getView().byId("vbeln"));
            }
            var newMsgs = {
              messagesLength: 1,
              items: [
                {
                  type: oBundle.getText("msgError"),
                  title: oBundle.getText("msgErrorTitle"),
                  description: sMsg,
                  //subtitle: 'Example of subtitle',
                  counter: 1
                }
              ]
            };
            that.getView().getModel("msgModel").setData(newMsgs);
            that.handleMessagePopover();
          },
          async: false
        });

    },

    onGoDoc: function (oSrc) {
      var bus = sap.ui.getCore().getEventBus();

      sap.ui.getCore().mdocArray = [];
      bus.publish("nav", "to", {
        id: "DocPage",
        data: {
          Vbeln: oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Vbeln,
          Posnr: oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Posnr,
          Docstat: oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Docstat
        }
      });
    }
  });
});



