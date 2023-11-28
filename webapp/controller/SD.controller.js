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
      var that = this;
      var sService = "/sap/opu/odata/SAP/ZPRELIMDOC_SRV";
      var oModel = new sap.ui.model.odata.ODataModel(sService, {
        json: true,
        useBatch: false
      });
      oModel.setSizeLimit(999);
      this.getView().setModel(oModel, "backend");


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

    onProfileListPress: function (e) {
      var oSrc = e.getSource();
      var sVal = oSrc.getModel("backend").getProperty(oSrc.getBindingContextPath());
      this.getView().byId("fldProfileName").setValue(sVal.DcProfile);
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

    onProfileLoad: function (oParams) {

      var bus = sap.ui.getCore().getEventBus();
      let oSrc = oParams.getSource();
      //let sVal = oSrc.getModel("backend").getProperty(oSrc.getBindingContextPath());
      

      let sVal = this.getView().byId("fldProfileName").getValue();
      let oData = this.oDialog.data("position");

      bus.publish("nav", "to", {
        id: "DocPage",
        data: {
          Vbeln: oData.Vbeln,
          Posnr: oData.Posnr,
          Docstat: oData.Docstat,
          Profile: sVal
        }
      });

    },

    onBeforeShowHandler: function (oParams) {
      var that = this;

      var fn = oParams.callback;
      that.Vbeln = oParams.Vbeln;
      that.Posnr = oParams.Posnr;
      that.Docstat = oParams.Docstat;
      that.Noinit = oParams.Noinit;

      var oUiModel = sap.ui.getCore().getModel("UIModel");

      if (!oUiModel) {
        oUiModel = new sap.ui.model.json.JSONModel();
        oUiModel.setData({ DetailsErrors: false, finalized: false });
        sap.ui.getCore().setModel(oUiModel, "UIModel");
      } else {
        oUiModel.setProperty("/finalized", false);
        oUiModel.setProperty("/saved", false);
        oUiModel.setProperty("/hasChanges", false);
      }

      var rModel = that.getView().getModel("backend");

      rModel.callFunction("/GetMode", {
        method: "GET",
        urlParameters: {
          Vbeln: oParams.Vbeln,
          Posnr: oParams.Posnr,
        },
        error: function (oData) {
          var oBundle = that.getView().getModel("i18n").getResourceBundle();
          var sMsg = "";
          try {
            var oResponse = JSON.parse(oData.response.body);
            sMsg = oResponse.error.message.value;
          } catch (e) {
            sMsg = ""; //oBundle.getText("msgSDocNotFound", that.getView().byId("vbeln"));
          }
          var newMsgs = {
            messagesLength: 1,
            items: [
              {
                type: oBundle.getText("msgError"),
                title: oBundle.getText("msgErrorTitle"),
                description: sMsg,
                //subtitle: 'Example of subtitle',
                counter: 1,
              },
            ],
          };
          that.getView().getModel("msgModel").setData(newMsgs);
          that.handleMessagePopover();
        },

        success: function (oData, Resp) {
          var mModel = that.getView().getModel("meta");
          var bTemp = false;
          if (that.Docstat == "ZDO1") {
            bTemp = true;
          }
          oData.Checkboxes = bTemp;

          if (
            that.getView().getModel("meta").getProperty("/Profile") &&
            that.getView().getModel("meta").getProperty("/Profile") !== ""
          ) {
            if (!oData.Profile || oData.Profile === "") {
              oData.Profile = that
                .getView()
                .getModel("meta")
                .getProperty("/Profile");
            }
          }
          sap.ui.getCore().sProfile = oData.Profile;

          mModel.setData(oData);

          if (that.Noinit) {
            var emptyArr = {
              results: [
                {
                  DcDescr: "Enddokumentationen",
                  DcOption: "0",
                  DcProfile: "",
                  DcSelected: "",
                  DocContent: "0000000000",
                  Keyword1: "",
                  Keyword2: "",
                  Posnr: "",
                  Selectable: false,
                  Vbeln: "",
                },
              ],
            };

            that.getOwnerComponent().getModel("DocList").setData(emptyArr);
            var oList = that.getView().byId("list");
            if (!oList.getAggregation("items")) {
              oList.bindItems(
                "DocList>/results",
                that.getView().byId("listItem")
              );
            }
            that.getOwnerComponent().getModel("DocList").updateBindings(true);
            that.getView().byId("list").refreshItems();
            //that.getView().byId("docPanel").setHeight("100%");

            if (!that.Noinit) {
              that.readLangInfo(rModel, that);
            }
            if (fn) {
              fn.call(that, { skipCheck: true });
            }

            if (that.Docstat == "ZDO1") {
              that.setCheckFilters();
            }
          } else {
            rModel.callFunction("/GetDocList", {
              method: "GET",
              urlParameters: {
                Vbeln: oParams.Vbeln,
                Posnr: oParams.Posnr,
                DcProfile: "",
              },

              success: function (oData, Resp) {
                that.getView().getModel().setData(oData);
                that.getOwnerComponent().getModel("DocList").setData({});
                that.getOwnerComponent().getModel("DocList").setData(oData);
                var oList = that.getView().byId("list");
                if (!oList.getAggregation("items")) {
                  oList.bindItems(
                    "DocList>/results",
                    that.getView().byId("listItem")
                  );
                }
                that
                  .getOwnerComponent()
                  .getModel("DocList")
                  .updateBindings(true);
                that.getView().byId("list").refreshItems();
                //that.getView().byId("docPanel").setHeight("100%");

                if (!that.Noinit) {
                  that.readLangInfo(rModel, that);
                }
                if (fn) {
                  fn.call(that, { skipCheck: true });
                }

                if (that.Docstat == "ZDO1") {
                  that.setCheckFilters();
                }
              },
              async: false,
            });
          }
        },
        async: false,
      });
    },

    setProfileValue: function (value) {
      if (this.getView().byId("fldProfileName")) {
        this.getView().byId("fldProfileName").setValue(value);
      }
      this.getView().getModel("meta").setProperty("/Profile", value);
      sap.ui.getCore().sProfile = value;
    },

    onProfile: function (oParams) {
      var bNewDialog = false;
      var that = this;

      var oView = this.getView();
      that.oDialog = oView.byId("dlgProfile");
      // create dialog lazily
      if (!that.oDialog) {
        //        oDialog = sap.ui.xmlfragment("zprelimdoc.view.Profile");
        //oDialog = sap.ui.xmlfragment(oView.getId(), "zprelimdoc.view.Profile", that);
        that.oDialog = sap.ui.xmlfragment(oView.getId(), "zprelimdoc.view.Profile", that);
        that.getView().addDependent(that.oDialog);

        bNewDialog = true;

      }

      var oButton = new sap.m.Button({
        icon: "sap-icon://delete",
        type: "Reject",
        //visible : "{= ${DcProfile} !== 'ANTOS'}",
        //visible : false,
        //press: that.onProfileDelete
      });

      oButton.bindProperty("visible",
        { parts: [{ path: "backend>DcProfile" }], formatter: this.formatter.fnProfileEditable });

      // if (oParams.start === false) {

      //   var oTemplate = new sap.m.ColumnListItem({
      //     cells: [
      //       new sap.m.Label({ text: "{backend>DcProfile}" }),
      //       oButton
      //     ],
      //     type: "Active", press: function (evt) {
      //       that.onProfileListPress(evt);
      //     }
      //   });
      // } else {
        var oTemplate = new sap.m.ColumnListItem({
          cells: [
            new sap.m.Label({ text: "{backend>DcProfile}" }),
          ],
          type: "Active", press: function (evt) {
            that.onProfileListPress(evt);
          }
        });
      // }
      var oPosnr = "";

      if (oParams) {
        oPosnr = oParams.Posnr;
      }
      if (!oPosnr) {
        oPosnr = this.Posnr;
      }

      if (!oPosnr) {
        oPosnr = "";
      }

      this.getView().byId("listProfiles").columns = [new sap.m.Column(), new sap.m.Column()];

      this.getView().byId("listProfiles").bindItems({
        path: "backend>/ProfileListSet",
        filters: [new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, oPosnr)],
        template: oTemplate
      });


      // if (oParams) {

        var fnPressHandler = function (oEvent) {

          var src = oEvent.getSource();

          if (src.getId().indexOf("Cancel") >= 0) {
            //that.getView().byId("fldProfileName").setValue("");
            that.setProfileValue("");
          }

          //that.getView().getModel("meta").setProperty("/Profile", that.getView().byId("fldProfileName").getValue());
          that.setProfileValue(that.getView().byId("fldProfileName").getValue());

          if (oParams.Vbeln) {
            switch (that.getView().byId("fldProfileName").getValue()) {
              case "ANTOS":
                that.onBeforeShowHandler({
                  Vbeln: oParams.Vbeln,
                  Posnr: oParams.Posnr, Docstat: oParams.Docstat, Noinit: true,
                  callback: that.onProfileLoad
                });
                break;
              case "TEMPLATE":
                that.onTemplate({
                  load: true, save: false, Docstat: oParams.Docstat,
                  Vbeln: oParams.Vbeln, Posnr: oParams.Posnr, initial: true
                });
                break;
              default:
                that.onBeforeShowHandler({
                  Vbeln: oParams.Vbeln,
                  Posnr: oParams.Posnr, Docstat: oParams.Docstat,
                  callback: that.onProfileLoad
                });
            }

          }


          $.each(this.oDialog.getAggregation("buttons"), function (idx, obj) {
            if (obj.mEventRegistry["press"]) {
              obj.mEventRegistry["press"].length = 0;
            }
          });

          that.oDialog.close();
        }

      if(bNewDialog){

        // this.getView().byId("btnProfileLoad").setVisible(oParams.load);
        if (false) {
          this.getView().byId("btnProfileLoad").attachPress(fnPressHandler, this);
        } else {
          this.getView().byId("btnProfileLoad").attachPress(this.onProfileLoad, this);
        }

        this.getView().byId("btnProfileCancel").attachPress(fnPressHandler, this);

        this.getView().byId("btnProfileSave").setVisible(false);
        this.getView().byId("btnProfileSave").attachPress(this.onProfileSave, this);
      }

      that.oDialog.data("position",oParams);
      that.oDialog.open();
    },

    onProfileSave : function () {
      
    },

    onProfileCancel: function () {

      //this.onProfileLoad({skipCheck: true, NoProfile: true});
      //this.getView().byId("dlgProfile").close();
      //debugger;
      this.oDialog.close();
    },

    onGoDoc: function (oSrc) {
      var bus = sap.ui.getCore().getEventBus();

      sap.ui.getCore().mdocArray = [];
      sap.ui.getCore().mdocArrayOld = [];

 //     if(true){

        if(oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Docstat !== ""){
            bus.publish("nav", "to", {
              id: "DocPage",
              data: {
                Vbeln: oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Vbeln,
                Posnr: oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Posnr,
                Docstat: oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Docstat
              }
            });
      }else{
        this.onProfile({
          Vbeln: oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Vbeln,
          Posnr: oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Posnr,
          Docstat: oSrc.getSource().getBindingContext().getModel().getObject(oSrc.getSource().getBindingContext().getPath()).Docstat
        });
      }
    }
  });
});


