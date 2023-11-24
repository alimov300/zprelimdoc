sap.ui.define(
  [
    "../controller/BaseController",
    "sap/m/MessageBox",
    "../model/formatter",
    "sap/m/MessagePopover",
    "sap/m/MessagePopoverItem",
    "sap/m/Link",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    MessageBox,
    formatter,
    MessagePopover,
    MessagePopoverItem,
    Link,
    JSONModel,
    MessageToast
  ) {
    "use strict";

    var oLink = new Link({
      text: "Show more information",
      href: "http://sap.com",
      target: "_blank",
    });

    var oMessageTemplate = new MessagePopoverItem({
      type: "{type}",
      title: "{title}",
      description: "{description}",
      subtitle: "{subtitle}",
      counter: "{counter}",
      //  link: oLink commented out
    });

    var oMessagePopover = new MessagePopover({
      items: {
        path: "/items",
        template: oMessageTemplate,
      },
    });

    return BaseController.extend("zprelimdoc.controller.Doc", {
      formatter: formatter,

      onInit: function () {
        var that = this;
        var sService = "/sap/opu/odata/SAP/ZPRELIMDOC_SRV";
        var oModel = new sap.ui.model.odata.ODataModel(sService, {
          json: true,
          useBatch: false,
        });
        oModel.setSizeLimit(999);
        this.getView().setModel(oModel, "backend");

        var oMetaModel = new sap.ui.model.odata.v2.ODataModel(
          "/sap/opu/odata/SAP/ZPRELIMDOC_META_SRV"
        );
        this.getView().setModel(oMetaModel, "filterModel");

        var oTemplModel = new JSONModel();
        sap.ui.getCore().setModel(oTemplModel, "templates");

        oMetaModel.read("/TemplateTextsSet", {
          json: true,
          //          filters: [ new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, that.Vbeln ),
          //                     new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, that.Posnr)],
          success: function (data) {
            var oTModel = sap.ui.getCore().getModel("templates");
            oTModel.setData(data.results);
          },
          error: function (error) {},
        });

        var msgModel = new JSONModel();
        msgModel.setData({ messagesLength: 0, items: [] });
        this.getView().setModel(msgModel, "msgModel");
        oMessagePopover.setModel(msgModel);

        var jModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(jModel);

        var jModelBkp = new sap.ui.model.json.JSONModel();
        this.getView().setModel(jModelBkp, "DocListOld");

        this.getOwnerComponent().setModel(jModel, "DocList");
        var mModel = new sap.ui.model.json.JSONModel();
        mModel.setData({ Active: true, Checkboxes: true });
        this.getView().setModel(mModel, "meta");

        this.oDialog = null;
        // create dialog lazily
        this.oDialog = sap.ui.xmlfragment(
          this.getView().getId(),
          "zprelimdoc.view.Profile"
        );
        this.getView().addDependent(this.oDialog);

        this.getOwnerComponent()
          .getRouter()
          .getRoute("docList")
          .attachPatternMatched(this._onRouteMatched, this);

        this.getView().addEventDelegate({
          onBeforeShow: function (evt) {
            debugger;

            return;

            var mModel = new sap.ui.model.json.JSONModel();
            mModel.setData({ Active: true });
            that.getView().setModel(mModel, "meta");

            var oProdModel = that.getView().getModel("prod");

            if(evt.data.Vbeln === undefined && evt.data.Posnr === undefined){
              return;
            }

            oProdModel.read("/ITPChangeSet", {
              json: true,
                        filters: [ new sap.ui.model.Filter("SalesOrderID", sap.ui.model.FilterOperator.EQ, evt.data.Vbeln ),
                                   new sap.ui.model.Filter("SalesOrderItem", sap.ui.model.FilterOperator.EQ, evt.data.Posnr)],
              success: function (data) {
                 debugger;
                 if(!data){
                  mModel.setProperty("/ITPButton", false);
                 }
                 if(!data.results){
                  mModel.setProperty("/ITPButton", false);
                 }
                 if(data.results.length > 0){
                    mModel.setProperty("/ITPButton", true);
                 }else{
                    mModel.setProperty("/ITPButton", false);
                 }
              },
              error: function (error) {
                debugger;
              },
            });
          },
          onAfterShow: function (evt) {
            debugger;

            var oUiModel = sap.ui.getCore().getModel("UIModel");

            if(evt.data.Vbeln === undefined && evt.data.Posnr === undefined){
              return;
            }

            if (!oUiModel) {
              oUiModel = new sap.ui.model.json.JSONModel();
              oUiModel.setData({ DetailsErrors: false, finalized: false });
              sap.ui.getCore().setModel(oUiModel, "UIModel");
            } else {
              oUiModel.setProperty("/finalized", false);
              oUiModel.setProperty("/saved", false);
              oUiModel.setProperty("/hasChanges", false);
            }

            if (evt.data.Profile !== "") {
              that.onProfileLoad({
                profile_vbeln: evt.data.Vbeln,
                profile_posnr: evt.data.Posnr,
                profile_name: evt.data.Profile,
              });
            } else {
              that.onBeforeShowHandler({
                Vbeln: evt.data.Vbeln,
                Posnr: evt.data.Posnr,
                Docstat: evt.data.Docstat,
              });
            }

            that.getView().setBusy(false);
            var oModel = evt.to.getModel();
          },
        });

        var oBus = sap.ui.getCore().getEventBus();

        oBus.subscribe("nav", "selectlist", this.onSelectListItem, this);

        oBus.subscribe("msg", "display", this.onDisplayMsg, this);
      },

      _onRouteMatched: function (oEvent) {

        debugger;

        var that = this;

        let sVbeln = oEvent.getParameters().arguments.Vbeln;
        let sPosnr = oEvent.getParameters().arguments.Posnr;
        let sProfile = oEvent.getParameters().arguments.Profile;
        let sDocstat = oEvent.getParameters().arguments.Docstat;

        var mModel = new sap.ui.model.json.JSONModel();
        mModel.setData({ Active: true });
        that.getView().setModel(mModel, "meta");

        var oProdModel = that.getView().getModel("prod");

        oProdModel.read("/ITPChangeSet", {
          json: true,
                    filters: [ new sap.ui.model.Filter("SalesOrderID", sap.ui.model.FilterOperator.EQ, sVbeln ),
                               new sap.ui.model.Filter("SalesOrderItem", sap.ui.model.FilterOperator.EQ, sPosnr)],
          success: function (data) {
             debugger;
             if(!data){
              mModel.setProperty("/ITPButton", false);
             }
             if(!data.results){
              mModel.setProperty("/ITPButton", false);
             }
             if(data.results.length > 0){
                mModel.setProperty("/ITPButton", true);
             }else{
                mModel.setProperty("/ITPButton", false);
             }
          },
          error: function (error) {
            debugger;
          },
        });


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

            if (sProfile !== "") {
              that.onProfileLoad({
                profile_vbeln: sVbeln,
                profile_posnr: sPosnr,
                profile_name: sProfile,
              });
            } else {
              that.onBeforeShowHandler({
                Vbeln: sVbeln,
                Posnr: sPosnr,
                Docstat: sDocstat,
              });
            }

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

      onFilter1: function (oEvt) {
        var oItem = oEvt.getParameter("changedItem");
        var oKey = oItem.getProperty("key");
        var oText = oItem.getProperty("text");

        var oMcb = this.getView().byId("filter1");

        var oKeys = oMcb.getSelectedKeys();

        //var oData = this.getOwnerComponent().getModel("DocList").getData();

        var oList = this.getView().byId("list");

        var oBinding = oList.getBinding("items");

        var aFilters = [];
        var bFilters = [];

        $.each(oKeys, function (idx, obj) {
          aFilters.push(
            new sap.ui.model.Filter(
              "Keyword1",
              sap.ui.model.FilterOperator.Contains,
              obj
            )
          );
        });

        var oMcb = this.getView().byId("filter2");
        var oKeys = oMcb.getSelectedKeys();

        $.each(oKeys, function (idx, obj) {
          bFilters.push(
            new sap.ui.model.Filter(
              "Keyword2",
              sap.ui.model.FilterOperator.Contains,
              obj
            )
          );
        });

        var aFilter = new sap.ui.model.Filter({
          filters: aFilters,
          and: false,
        });
        var bFilter = new sap.ui.model.Filter({
          filters: bFilters,
          and: false,
        });

        var oFilter;
        if (aFilters.length > 0 && bFilters.length > 0) {
          oFilter = new sap.ui.model.Filter({
            filters: [aFilter, bFilter],
            and: true,
          });
        }
        if (aFilters.length > 0 && bFilters.length == 0) {
          oFilter = new sap.ui.model.Filter({ filters: [aFilter] });
          //oFilter = aFilter;
        }
        if (aFilters.length == 0 && bFilters.length > 0) {
          oFilter = new sap.ui.model.Filter({ filters: [bFilter] });
          //oFilter = bFilter;
        }
        if (aFilters.length == 0 && bFilters.length == 0) {
          oBinding.filter([]);
        } else {
          oBinding.filter(oFilter);
        }
      },

      setCheckFilters: function () {
        var aFilters = [];

        var oButton = this.getView().byId("idCheckboxFilters");

        aFilters.push(
          new sap.ui.model.Filter(
            "DcSelected",
            sap.ui.model.FilterOperator.EQ,
            "X"
          )
        );
        //aFilters.push(new sap.ui.model.Filter("DcOption", sap.ui.model.FilterOperator.EQ, "2"));

        var oList = this.getView().byId("list");
        var oBinding = oList.getBinding("items");

        var oFilter = new sap.ui.model.Filter({ filters: aFilters });

        oBinding.attachAggregatedDataStateChange(function () {});
        oBinding.attachChange(function (oEvent) {
          console.log("filtered");
        });
        oBinding.attachDataReceived(function () {});
        oBinding.attachDataRequested(function () {});
        oBinding.attachDataStateChange(function () {});

        //sap.ui.getCore().byId("__xmlview0--idDoc--bottomToolbar").setBusy(true);

        if (oButton.getPressed()) {
          oBinding.filter(oFilter);
        } else {
          oBinding.filter([]);
        }
      },

      onDisplayMsg: function (channelId, eventId, data) {
        var oBundle = that.getView().getModel("i18n").getResourceBundle();
        var newMsgs = { messagesLength: msg.RETVAL.RETURN.length, items: [] };
        $.each(msg.RETVAL.RETURN, function (idx, el) {
          var sMsg = el.TEXT;
          var sMsgType = oBundle.getText("msgError");
          if (el.TYPE == "I") {
            sMsgType = oBundle.getText("msgSuccess");
          }
          newMsgs.items.push({
            type: sMsgType,
            title: sMsg,
            description: sMsg,
            counter: 1,
          });
        });
        that.getView().getModel("msgModel").setData([]);
        that.getView().getModel("msgModel").setData(newMsgs);
        that.handleMessagePopover();
      },

      onSelectListItem: function (channelId, eventId, model) {
        var oList = this.getView().byId("list");
        var oItems = oList.getItems();
        var that = this;
        var oDocContent = model.data.item ? model.data.item.DocContent : "";
        $.each(oItems, function (idx, elem) {
          var docItem = elem.getModel().getObject(elem.getBindingContextPath());
          if (docItem.DocContent == oDocContent) {
            oList.setSelectedItem(elem, true);
          }
        });
      },

      setFiltersOn: function () {
        var bVisible = this.getView().byId("filterform1").getVisible();

        if (bVisible) {
          this.getView().byId("filterform1").setVisible(false);
          this.getView().byId("filterform2").setVisible(false);
        } else {
          this.getView().byId("filterform1").setVisible(true);
          this.getView().byId("filterform2").setVisible(true);
        }
      },

      readLangInfo: function (oModel, oController) {
        var that = oController;

        oModel.read("/SDDocLangSet", {
          json: true,
          filters: [
            new sap.ui.model.Filter(
              "Vbeln",
              sap.ui.model.FilterOperator.EQ,
              that.Vbeln
            ),
            new sap.ui.model.Filter(
              "Posnr",
              sap.ui.model.FilterOperator.EQ,
              that.Posnr
            ),
          ],
          success: function (data) {
            that.langus = data.results;
            oModel.read("/SDDocCont_TargtSet", {
              json: true,
              filters: [
                new sap.ui.model.Filter(
                  "Vbeln",
                  sap.ui.model.FilterOperator.EQ,
                  that.Vbeln
                ),
                new sap.ui.model.Filter(
                  "Posnr",
                  sap.ui.model.FilterOperator.EQ,
                  that.Posnr
                ),
              ],
              error: function (oData) {
                var oBundle = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle();
                var sMsg = "";
                try {
                  var oResponse = JSON.parse(oData.response.body);
                  sMsg = oResponse.error.message.value;
                } catch (e) {
                  sMsg = oBundle.getText(
                    "msgSDocNotFound",
                    that.getView().byId("vbeln")
                  );
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
              success: function (data) {
                var oDocList = that
                  .getOwnerComponent()
                  .getModel("DocList")
                  .getData();
                sap.ui.getCore().langHandler = new LangHandler({
                  Langs: that.langus,
                  Targets: data.results,
                  DocList: oDocList,
                });

                var listControl = that.getView().byId("list");

                var firstItem;
                var aItems = listControl.getItems();

                $.each(aItems, function (idx, el) {
                  var firstItemData = el
                    .getModel()
                    .getObject(el.getBindingContextPath());
                  if (firstItemData.Vbeln.length > 0 && !firstItem) {
                    firstItem = el;
                  }
                });

                if (firstItem) {
                  that.getView().byId("list").setSelectedItem(firstItem, true);

                  var bus = sap.ui.getCore().getEventBus();
                  bus.publish("nav", "listitem", {
                    id: "DocItems",
                    data: {
                      item: firstItem
                        .getModel()
                        .getObject(firstItem.getBindingContextPath()),
                      skipCheck: true,
                    },
                  });
                }
              },
            });
          },
        });
      },

      addCurrentDetails: function () {
        var bus = sap.ui.getCore().getEventBus();

        bus.publish("model", "save_cur", {
          id: "Modelsave",
          data: {},
        });
      },

      onUpdateITP : function(){
        debugger;

        var that = this;

        var oView = this.getView();
        that.oITPDialog = oView.byId("dlgITP");
        // create dialog lazily
        if (!that.oITPDialog) {
          that.oITPDialog = sap.ui.xmlfragment(
            oView.getId(),
            "zprelimdoc.view.ITP",
            that
          );
          that.getView().addDependent(that.oITPDialog);

          //this.getView().byId("btnITP").setVisible(oParams.load);
          //if (oParams.Docstat === "") {
            this.getView().byId("btnITPLoad").attachPress(this.onITPListPress, this);
          //} else {
          //  this.getView().byId("btnITPLoad").attachPress(fnPressHandler, this);
          //}

          this.getView().byId("btnITPCancel").attachPress(function(){that.oITPDialog.close();}, this);

        }

        var oBundle = that.getView().getModel("i18n").getResourceBundle();

        debugger;
        const sCreate = oBundle.getText("lblCreate");
        const sUpdate = oBundle.getText("lblUpdate");
        const sDelete = oBundle.getText("lblDelete");

        var oTemplate = new sap.m.ColumnListItem({
            cells: [
              new sap.m.Label({ text: "{= +${prod>DocContent} }" }),
              new sap.m.Label({ text: "{prod>DocContentDescr}" }),
              new sap.m.Label({ text: "{ path: 'prod>ReleaseTimestamp',type: 'sap.ui.model.type.DateTime',formatOptions: {pattern: 'dd-MM-yyyy HH:mm' } }" }),
              //new sap.m.Label({ text: "{ path: 'prod>ReleaseTime' }" }),
              new sap.ui.core.Icon({ src: "{= ${prod>ModifyState} === 'C' ? 'sap-icon://create' :  ${prod>ModifyState} === 'U' ? 'sap-icon://edit' : 'sap-icon://delete'  }",
                                      alt: "test",
                                      tooltip: "{= ${prod>ModifyState} === 'C' ? '" + sCreate +  "' :  ${prod>ModifyState} === 'U' ? '"+ sUpdate +"' : '"+ sDelete +"'  }" }),
            ],
            type: "Active",
            press: function (evt) {
              that.onITPListPress(evt);
            },
          });

          this.getView().byId("listITPs").bindItems({
            path: "prod>/ITPChangeSet",
            filters: [
              new sap.ui.model.Filter(
                "SalesOrderItem",
                sap.ui.model.FilterOperator.EQ,
                this.Posnr
              ),
              new sap.ui.model.Filter(
                "SalesOrderID",
                sap.ui.model.FilterOperator.EQ,
                this.Vbeln
              )
            ],
            template: oTemplate
          });
        
        var oPosnr = "";


        var rModel = that.getView().getModel("backend");


        var fnPressHandler = function (oEvent) {
          debugger;
        var src = oEvent.getSource();
        var oModel = this.getView().getModel("listTemplates");

        var aSelected = [];

            if (!oModel) {
              // that.setProfileValue("");
              // that.onBeforeShowHandler({
              //   Vbeln: that.inputParams.Vbeln,
              //   Posnr: that.inputParams.Posnr,
              //   Docstat: that.inputParams.Docstat,
              //   callback: that.onProfileLoad,
              // });

              that.oITPDialog.close();
              return;
            }

            if (!oModel.getData()) {
              // that.setProfileValue("");
              // that.onBeforeShowHandler({
              //   Vbeln: that.inputParams.Vbeln,
              //   Posnr: that.inputParams.Posnr,
              //   Docstat: that.inputParams.Docstat,
              //   callback: that.onProfileLoad,
              // });

              that.oITPDialog.close();
              return;
            }
            $.each(oModel.getData().results, function (idx, el) {
              if (el.Selected) {
                aSelected.push({ doccontent: el.DocContent });
              }
            });

            switch (src.getProperty("type")) {
              case "Reject":
                // that.setProfileValue("");
                // that.onBeforeShowHandler({
                //   Vbeln: that.Vbeln,
                //   Posnr: that.Posnr,
                //   Docstat: that.inputParams.Docstat,
                //   callback: that.onProfileLoad,
                // });

                break;
              case "Accept":



            }

            $.each(
              this.oTmplDialog.getAggregation("buttons"),
              function (idx, obj) {
                if (obj.mEventRegistry["press"]) {
                  obj.mEventRegistry["press"].length = 0;
                }
              }
            );

            that.oITPDialog.close();
          };

    
        that.oITPDialog.open();

      },

      onITPListPress : function (evt) {        

        let aSelected = [];

        const oProdModel = this.getView().getModel("prod");

        this.getView().byId("listITPs").getSelectedItems().forEach(function (val, idx, o) {

            aSelected.push(oProdModel.getObject(val.getBindingContextPath()));

        });

        if(aSelected.length > 0){
          const oITP = {
            SalesOrderID: this.Vbeln,
            SalesOrderItem: this.Posnr,
           // Profile: this.Profile || "",
            ItemToITPChange: aSelected
          };

          oProdModel.create("/SalesItemChangeKeySet", oITP, {
            method: "POST",
            success() {
              debugger;
              // const oSalesItem = aSalesItems.find(
              //   (el) => el.SalesOrderItem === oSalesOrder.SalesOrderItem
              // ) || { ItpState: "" };
              // if (oSalesItem.ItpState === "") oCtrl.onToggleRelease();
  
              MessageToast.show("Saved"
                // oLangModel
                //   .getResourceBundle()
                //   .getText(this.Profile === "" ? "msgITPSaved" : "msgProfileSaved")
              );
            },
            error() {
              debugger;
            },
          });

        }
      },

      toogleTreeClose: function (oEvent, oData) {
        let oModel = oEvent.getSource().getBinding("text").getModel();

        const sPath = oEvent.getSource().getBinding("text").getContext().getPath();
        const oList = this.getView().byId("list");
        const oParent = oModel.getObject(sPath);

        $.each(oList.getItems(), function (idx, el) {
          debugger;
          let zPath = el.getBindingContextPath();
          if(sPath !== zPath){

            let oObject = oModel.getObject(zPath); 

            if(oParent.DocContent == oObject.ParentDocContent){
              // zu
              el.setVisible(!el.getVisible());

            }else{
              // auf
              //el.setVisible(true);
            }

          }


        });

      },

      onSave: function () {
        this.addCurrentDetails();

        oMessagePopover.close();

        this.getView().setBusy(true);

        var bDetailErrors = sap.ui
          .getCore()
          .getModel("UIModel")
          .getProperty("/DetailsErrors");
        if (bDetailErrors) {
          return;
        }

        var docListModel = this.getView().getModel();
        var that = this;

        var sJson = "";
        var sdDocCont = [];
        var mdocArray = sap.ui.getCore().mdocArray;
        //var mdocArrayOld = sap.ui.getCore().mdocArrayOld;

        $.each(mdocArray, function (index, obj) {
          if (obj.PrelimDate) {
            obj.PrelimDate = obj.PrelimDate.substring(0, 10);
          } else {
            obj.PrelimDate = "";
          }
          if (obj.FinalDate) {
            obj.FinalDate = obj.FinalDate.substring(0, 10);
          } else {
            obj.FinalDate = "";
          }
        });

        var sProfile = this.getView().getModel("meta").getProperty("/Profile");
        var obj = {
          content: {
            vbeln: "",
            posnr: "",
            profile: { Dcprofile: sProfile, vbeln: "", posnr: "" },
            docList: docListModel.getData(),
            mdocArray: mdocArray,
            langus: sap.ui.getCore().langHandler.langus,
          },
        };

        $.ajax({
          type: "POST",
          url: "/sap/bc/zcomm/zdcont/save_sddoccont",
          data: JSON.stringify(obj),
          error: function (oData) {
            var oBundle = that.getView().getModel("i18n").getResourceBundle();
            var sMsg = "";
            try {
              var oResponse = JSON.parse(oData.response.body);
              sMsg = oResponse.error.message.value;
            } catch (e) {
              sMsg = oBundle.getText(
                "msgSDocNotFound",
                that.getView().byId("vbeln")
              );
              that.getView().setBusy(false);
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
            that.getView().setBusy(false);


            that.handleMessagePopover();
          },
          success: function (res) {
            console.log("save completed.");
            var msg = JSON.parse(res);

            sap.ui
              .getCore()
              .getModel("UIModel")
              .setProperty("/hasChanges", false);
            sap.ui.getCore().getModel("UIModel").setProperty("/saved", true);

            if (msg.RETVAL.RETURN.length > 0) {
              var oBundle = that.getView().getModel("i18n").getResourceBundle();
              var newMsgs = {
                messagesLength: msg.RETVAL.RETURN.length,
                items: [],
              };
              $.each(msg.RETVAL.RETURN, function (idx, el) {
                var sMsg = el.TEXT;
                var sMsgType = oBundle.getText("msgError");
                if (el.TYPE == "I") {
                  sMsgType = oBundle.getText("msgSuccess");
                }
                newMsgs.items.push({
                  type: sMsgType,
                  title: sMsg,
                  description: sMsg,
                  counter: 1,
                });
              });
              that.getView().getModel("msgModel").setData([]);
              that.getView().getModel("msgModel").setData(newMsgs);
              that.getView().setBusy(false);
              that.handleMessagePopover();
            }
          },
        });

        const oDocList = this.getView().getModel();
        const oDocListOld = this.getView().getModel("DocListOld");

        //const cMdocArray = sap.ui.getCore().mdocArray;
        //const cMdocArrayOld = sap.ui.getCore().mdocArrayOld;
        
        oDocListOld.setData(oDocList.getData());
        sap.ui.getCore().mdocArrayOld = sap.ui.getCore().mdocArray;

        //  TODO Save Langus
      },

      handleMessagePopover: function () {
        oMessagePopover.rerender();
        oMessagePopover.close();
        oMessagePopover.toggle(this.getView().byId("_IDGenButton1"));
      },

      handleMessagePopoverPress: function (oEvent) {
        oMessagePopover.rerender();
        oMessagePopover.close();
        oMessagePopover.toggle(oEvent.getSource());
      },

      onComplete: function () {
        var that = this;
        oMessagePopover.close();
        that.getView().setBusy(true);
        var mData = this.getView().getModel().getData();
        var obj = {};
        if (!this.Vbeln || !this.Posnr) {
          if (this.getView().getModel().getData().results.length > 1) {
            this.Vbeln = this.getView().getModel().getData().results[1].Vbeln;
            this.Posnr = this.getView().getModel().getData().results[1].Posnr;
          }
          obj = { position: { Vbeln: this.Vbeln, Posnr: this.Posnr } };
        } else {
          obj = { position: { Vbeln: this.Vbeln, Posnr: this.Posnr } };
        }

        var bChanged = sap.ui
          .getCore()
          .getModel("UIModel")
          .getProperty("/hasChanges");

        var bSaved = sap.ui.getCore().getModel("UIModel").getProperty("/saved");

        if (bChanged || !bSaved) {
          var oBundle = that.getView().getModel("i18n").getResourceBundle();
          var sMsg = "";
          try {
            var oResponse = JSON.parse(oData.response.body);
            sMsg = oResponse.error.message.value;
          } catch (e) {
            sMsg = oBundle.getText(
              "msgSDocNotFound",
              that.getView().byId("vbeln")
            );
            that.getView().setBusy(false);
          }
          var newMsgs = {
            messagesLength: 1,
            items: [
              {
                type: oBundle.getText("msgError"),
                title: oBundle.getText("msgErrorTitle"),
                description: oBundle.getText("msgNoSaveBeforeComplete"),
                counter: 1,
              },
            ],
          };
          that.getView().getModel("msgModel").setData(newMsgs);
          that.handleMessagePopover();

          return;
        }

        $.ajax({
          type: "POST",
          url: "/sap/bc/zcomm/zdcont/finalize",
          data: JSON.stringify(obj),
          error: function (oData) {
            var oBundle = that.getView().getModel("i18n").getResourceBundle();
            var sMsg = "";
            try {
              var oResponse = JSON.parse(oData.response.body);
              sMsg = oResponse.error.message.value;
            } catch (e) {
              sMsg = oBundle.getText(
                "msgSDocNotFound",
                that.getView().byId("vbeln")
              );
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

            that.getView().setBusy(false);
          },
          success: function (res) {
            var msg = JSON.parse(res);
            if (msg.RETVAL.RETURN.length > 0) {
              var oBundle = that.getView().getModel("i18n").getResourceBundle();
              var newMsgs = {
                messagesLength: msg.RETVAL.RETURN.length,
                items: [],
              };
              $.each(msg.RETVAL.RETURN, function (idx, el) {
                var sMsg = el.TEXT;
                var sMsgType = oBundle.getText("msgError");
                if (el.TYPE == "I") {
                  sMsgType = oBundle.getText("msgSuccess");
                }
                newMsgs.items.push({
                  type: sMsgType,
                  title: sMsg,
                  description: sMsg,
                  counter: 1,
                });
              });

              that.getView().getModel("msgModel").setData(newMsgs);
              that.handleMessagePopover();

              var bus = sap.ui.getCore().getEventBus();
              bus.publish("model", "disable", {
                id: "Details",
                data: { set: true },
              });

              var oUiModel = sap.ui.getCore().getModel("UIModel");

              if (!oUiModel) {
                oUiModel = new sap.ui.model.json.JSONModel();
                oUiModel.setData({ DetailsErrors: false });
                sap.ui.getCore().setModel(oUiModel, "UIModel");
              }

              oUiModel.setProperty("/finalized", true);

              var mModel = that.getView().getModel("meta");
              if (mModel) {
                mModel.setProperty("/Active", false);
                mModel.setProperty("/Checkboxes", false);
              }
            }
            that.getView().setBusy(false);
          },
        });
      },

      onCheckboxChange: function (evt) {
        var oSrc = evt.getSource();
        var oModel = oSrc.getModel();

        var bus = sap.ui.getCore().getEventBus();

        var oldSelected = oModel.getProperty(
          oSrc.getBindingContext("DocList").getPath() + "/DcSelected"
        );
        if (oldSelected === "X") {
          oModel.setProperty(
            oSrc.getBindingContext("DocList").getPath() + "/DcSelected",
            ""
          );
          bus.publish("model", "disable", {
            id: "Details",
            data: { set: true },
          });
        } else {
          oModel.setProperty(
            oSrc.getBindingContext("DocList").getPath() + "/DcSelected",
            "X"
          );
          bus.publish("model", "disable", {
            id: "Details",
            data: { set: false },
          });
        }
      },

      onTogglePress: function (evt) {
        var oSrc = evt.getSource();
        var oModel = oSrc.getModel();
        var oldDcOption = oModel.getProperty(
          oSrc.getBindingContext("DocList").getPath() + "/DcOption"
        );
        if (oldDcOption == "1") {
          oModel.setProperty(
            oSrc.getBindingContext("DocList").getPath() + "/DcOption",
            "2"
          );

          var bus = sap.ui.getCore().getEventBus();

          bus.publish("model", "sonder", {
            id: "DocList",
            data: { set: true },
          });
        } else {
          oModel.setProperty(
            oSrc.getBindingContext("DocList").getPath() + "/DcOption",
            "1"
          );

          var bus = sap.ui.getCore().getEventBus();
          bus.publish("model", "sonder", {
            id: "DocList",
            data: { set: false },
          });
        }
      },

      onProfileListPress: function (e) {
        var oSrc = e.getSource();
        var sVal = oSrc
          .getModel("backend")
          .getProperty(oSrc.getBindingContextPath());
        this.getView().byId("fldProfileName").setValue(sVal.DcProfile);
      },

      onProfileDelete: function (e) {
        var oSrc = e.getSource();

        var oItem = oSrc
          .getModel("backend")
          .getProperty(oSrc.getBindingContext("backend").getPath());
        var oModel = oSrc.getModel("backend");
        oModel.remove(
          "/ProfileListSet(DcProfile='" +
            oItem.DcProfile +
            "',Posnr='" +
            oItem.Posnr +
            "')"
        );
      },

      OnListItemPressed: function (oSrc) {
        var bus = sap.ui.getCore().getEventBus();

        var oItem = oSrc.getParameter("listItem");
        var oModel = oItem.getBindingContext("DocList").getModel();

        var oModelItem = oModel.getObject(
          oItem.getBindingContext("DocList").getPath()
        );

        bus.publish("nav", "listitem", {
          id: "DocItems",
          data: { item: oModelItem },
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
        var that = this;

        var oView = this.getView();
        that.oDialog = oView.byId("dlgProfile");
        // create dialog lazily
        if (!that.oDialog) {
          //        oDialog = sap.ui.xmlfragment("zprelimdoc.view.Profile");
          //oDialog = sap.ui.xmlfragment(oView.getId(), "zprelimdoc.view.Profile", that);
          that.oDialog = sap.ui.xmlfragment(
            oView.getId(),
            "zprelimdoc.view.Profile",
            that
          );
          that.getView().addDependent(that.oDialog);
        }

        var oButton = new sap.m.Button({
          icon: "sap-icon://delete",
          type: "Reject",
          //visible : "{= ${DcProfile} !== 'ANTOS'}",
          //visible : false,
          press: that.onProfileDelete,
        });

        oButton.bindProperty("visible", {
          parts: [{ path: "backend>DcProfile" }],
          formatter: this.formatter.fnProfileEditable,
        });

        if (oParams.start === false) {
          var oTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Label({ text: "{backend>DcProfile}" }), oButton],
            type: "Active",
            press: function (evt) {
              that.onProfileListPress(evt);
            },
          });
        } else {
          var oTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Label({ text: "{backend>DcProfile}" })],
            type: "Active",
            press: function (evt) {
              that.onProfileListPress(evt);
            },
          });
        }
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

        this.getView().byId("listProfiles").columns = [
          new sap.m.Column(),
          new sap.m.Column(),
        ];

        this.getView()
          .byId("listProfiles")
          .bindItems({
            path: "backend>/ProfileListSet",
            filters: [
              new sap.ui.model.Filter(
                "Posnr",
                sap.ui.model.FilterOperator.EQ,
                oPosnr
              ),
            ],
            template: oTemplate,
          });

        if (oParams) {
          var fnPressHandler = function (oEvent) {
            var src = oEvent.getSource();

            if (src.getId().indexOf("Cancel") >= 0) {
              //that.getView().byId("fldProfileName").setValue("");
              //that.setProfileValue("");
            }

            //that.getView().getModel("meta").setProperty("/Profile", that.getView().byId("fldProfileName").getValue());
            that.setProfileValue(
              that.getView().byId("fldProfileName").getValue()
            );

            if (oParams.Vbeln) {
              switch (that.getView().byId("fldProfileName").getValue()) {
                case "ANTOS":
                  that.onBeforeShowHandler({
                    Vbeln: oParams.Vbeln,
                    Posnr: oParams.Posnr,
                    Docstat: oParams.Docstat,
                    Noinit: true,
                    callback: that.onProfileLoad,
                  });
                  break;
                case "TEMPLATE":
                  that.onTemplate({
                    load: true,
                    save: false,
                    Docstat: oParams.Docstat,
                    Vbeln: oParams.Vbeln,
                    Posnr: oParams.Posnr,
                    initial: true,
                  });
                  break;
                default:
                  that.onBeforeShowHandler({
                    Vbeln: oParams.Vbeln,
                    Posnr: oParams.Posnr,
                    Docstat: oParams.Docstat,
                    callback: that.onProfileLoad,
                  });
              }
            }

            $.each(this.oDialog.getAggregation("buttons"), function (idx, obj) {
              if (obj.mEventRegistry["press"]) {
                obj.mEventRegistry["press"].length = 0;
              }
            });

            that.oDialog.close();
          };

          //  this.getView().byId("btnProfileLoad").setVisible(oParams.load);
          if (oParams.Docstat === "") {
            this.getView()
              .byId("btnProfileLoad")
              .attachPress(fnPressHandler, this);
          } else {
            this.getView()
              .byId("btnProfileLoad")
              .attachPress(this.onProfileLoad, this);
          }

          this.getView()
            .byId("btnProfileCancel")
            .attachPress(fnPressHandler, this);

          this.getView().byId("btnProfileSave").setVisible(oParams.save);
          this.getView()
            .byId("btnProfileSave")
            .attachPress(this.onProfileSave, this);
        }

        that.oDialog.open();
      },

      onTemplateDialogSend: function () {
        var that = this;

        var sVbeln = this.getView().byId("fldDocument").getValue();
        var sPosnr = this.getView().byId("fldPosition").getValue();

        if (sVbeln == "") {
          return;
        }

        var rModel = that.getView().getModel("backend");

        rModel.callFunction("/GetDocIds", {
          method: "GET",
          urlParameters: {
            Vbeln: sVbeln,
            Posnr: sPosnr,
            DcProfile: "",
          },
          error: function (oData) {
            var oBundle = that.getView().getModel("i18n").getResourceBundle();
            var sMsg = "";
            try {
              var oResponse = JSON.parse(oData.response.body);
              sMsg = oResponse.error.message.value;
            } catch (e) {
              sMsg = oBundle.getText(
                "msgSDocNotFound",
                that.getView().byId("vbeln")
              );
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
            var oTemplate = new sap.m.ColumnListItem({
              vAlign: "Middle",
              cells: [
                new sap.m.CheckBox({
                  width: "10%",
                  selected: "{listTemplates>Selected}",
                }),
                new sap.m.Label({
                  text: "{listTemplates>DocContent}",
                  width: "30%",
                }),
                new sap.m.Label({
                  text: "{listTemplates>DcDescr}",
                  width: "60%",
                }),
              ],
              type: "Active",
              press: function (evt) {
                that.onTemplateListPress(evt);
              },
            });
            var oTemplModel = new JSONModel();

            oTemplModel.setData(oData);

            that.getView().setModel(oTemplModel, "listTemplates");

            that.getView().byId("listTemplates").columns = [
              new sap.m.Column(),
              new sap.m.Column(),
              new sap.m.Column(),
            ];

            that.getView().byId("listTemplates").bindItems({
              path: "listTemplates>/results",
              template: oTemplate,
            });

            var listControl = that.getView().byId("list");
            var aItems = listControl.getItems();
            debugger;
            //              var firstItem;
            //
            //              if(aItems.length == 0){
            //                return;
            //              }
            //
            //              $.each(aItems, function(idx, el){
            //                var firstItemData = el.getModel().getObject(el.getBindingContextPath());
            //                if(firstItemData.Vbeln.length > 0 && !firstItem)
            //                {
            //                  firstItem = el;
            //                }
            //              });
            //
            //
            //              if(firstItem){
            //                that.getView().byId("list").setSelectedItem(firstItem, true);
            //              }
            //
            //              var bus = sap.ui.getCore().getEventBus();
            //              bus.publish("nav", "listitem", {
            //                id: "DocItems",
            //                data: {
            //                  skipCheck: bSkip,
            //                  item: firstItem.getModel("DocList").getObject(firstItem.getBindingContextPath("DocList"))
            //                }
            //              });
          },
          async: false,
        });
      },

      onTemplate: function (oParams) {
        debugger;
        var that = this;

        var oView = this.getView();
        that.oTmplDialog = oView.byId("dlgTemplate");
        // create dialog lazily
        if (!that.oTmplDialog) {
          that.oTmplDialog = sap.ui.xmlfragment(
            oView.getId(),
            "zprelimdoc.view.Template",
            that
          );
          that.getView().addDependent(that.oTmplDialog);
        }

        if (oParams.start === false) {
          var oTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Label({ text: "{backend>DcTemplate}" }), oButton],
            type: "Active",
            press: function (evt) {
              that.onTemplateListPress(evt);
            },
          });
        } else {
          var oTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Label({ text: "{backend>DcTemplate}" })],
            type: "Active",
            press: function (evt) {
              that.onTemplateListPress(evt);
            },
          });
        }
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

        this.getView().byId("listTemplates").columns = [
          new sap.m.Column(),
          new sap.m.Column(),
        ];

        var rModel = that.getView().getModel("backend");
        this.inputParams = oParams;

        if (oParams) {
          var fnPressHandler = function (oEvent) {
            var src = oEvent.getSource();
            var oModel = this.getView().getModel("listTemplates");

            const oMetaModel = this.getView().getModel("meta");

            oMetaModel.setProperty("/templateUrl","/sap/bc/zcomm/zdcont/read_template_data");

            var aSelected = [];

            if (!oModel) {
              that.setProfileValue("");
              that.onBeforeShowHandler({
                Vbeln: that.inputParams.Vbeln,
                Posnr: that.inputParams.Posnr,
                Docstat: that.inputParams.Docstat,
                callback: that.onProfileLoad,
              });

              that.oTmplDialog.close();
              return;
            }

            if (!oModel.getData()) {
              that.setProfileValue("");
              that.onBeforeShowHandler({
                Vbeln: that.inputParams.Vbeln,
                Posnr: that.inputParams.Posnr,
                Docstat: that.inputParams.Docstat,
                callback: that.onProfileLoad,
              });

              that.oTmplDialog.close();
              return;
            }
            $.each(oModel.getData().results, function (idx, el) {
              if (el.Selected) {
                aSelected.push({ doccontent: el.DocContent });
              }
            });

            switch (src.getProperty("type")) {
              case "Reject":
                that.setProfileValue("");
                that.onBeforeShowHandler({
                  Vbeln: that.Vbeln,
                  Posnr: that.Posnr,
                  Docstat: that.inputParams.Docstat,
                  callback: that.onProfileLoad,
                });

                break;
              case "Accept":
                var sVbeln = that.getView().byId("fldDocument").getValue();
                var sPosnr = that.getView().byId("fldPosition").getValue();

                var oSendData = {
                  key: {
                    vbeln: that.Vbeln,
                    posnr: that.Posnr,
                  },
                  template_key: { vbeln: sVbeln, posnr: sPosnr },
                  docids: aSelected,
                };
                var rModel = that.getView().getModel("backend");
                debugger;
                rModel.callFunction("/SetRefTemplate", {
                  method: "GET",
                  urlParameters: {
                    Vbeln: that.Vbeln,
                    Posnr: that.Posnr,
                    Vbeln_templ: sVbeln,
                    Posnr_templ: sPosnr,
                  },
                  error: function (oData) {
                    var oBundle = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle();
                    var sMsg = "";
                    try {
                      var oResponse = JSON.parse(oData.response.body);
                      sMsg = oResponse.error.message.value;
                    } catch (e) {
                      sMsg = oBundle.getText(
                        "msgSDocNotFound",
                        that.getView().byId("vbeln")
                      );
                    }
                    var newMsgs = {
                      messagesLength: 1,
                      items: [
                        {
                          type: oBundle.getText("msgError"),
                          title: oBundle.getText("msgErrorTitle"),
                          description: sMsg,
                          counter: 1,
                        },
                      ],
                    };
                    that.getView().getModel("msgModel").setData(newMsgs);
                    that.handleMessagePopover();
                  },
                  success: function (oData, Resp) {},
                });

                //that.getView().byId("docPanel").setHeight("100%");

                this.onProfileLoad({ skipCheck: true, sendData: oSendData });
            }

            $.each(
              this.oTmplDialog.getAggregation("buttons"),
              function (idx, obj) {
                if (obj.mEventRegistry["press"]) {
                  obj.mEventRegistry["press"].length = 0;
                }
              }
            );

            that.oTmplDialog.close();
          };

          var fnPressHandlerDate = function (oEvent) {
            var src = oEvent.getSource();
            var oModel = this.getView().getModel("listTemplates");

            const oMetaModel = this.getView().getModel("meta");

            oMetaModel.setProperty("/templateUrl","/sap/bc/zcomm/zdcont/read_template_data_with_dates");

            var aSelected = [];

            if (!oModel) {
              that.setProfileValue("");
              that.onBeforeShowHandler({
                Vbeln: that.inputParams.Vbeln,
                Posnr: that.inputParams.Posnr,
                Docstat: that.inputParams.Docstat,
                callback: that.onProfileLoad,
              });

              that.oTmplDialog.close();
              return;
            }

            if (!oModel.getData()) {
              that.setProfileValue("");
              that.onBeforeShowHandler({
                Vbeln: that.inputParams.Vbeln,
                Posnr: that.inputParams.Posnr,
                Docstat: that.inputParams.Docstat,
                callback: that.onProfileLoad,
              });

              that.oTmplDialog.close();
              return;
            }
            $.each(oModel.getData().results, function (idx, el) {
              if (el.Selected) {
                aSelected.push({ doccontent: el.DocContent });
              }
            });

            switch (src.getProperty("type")) {
              case "Reject":
                that.setProfileValue("");
                that.onBeforeShowHandler({
                  Vbeln: that.Vbeln,
                  Posnr: that.Posnr,
                  Docstat: that.inputParams.Docstat,
                  callback: that.onProfileLoad,
                });

                break;
              case "Accept":
                var sVbeln = that.getView().byId("fldDocument").getValue();
                var sPosnr = that.getView().byId("fldPosition").getValue();

                var oSendData = {
                  key: {
                    vbeln: that.Vbeln,
                    posnr: that.Posnr,
                  },
                  template_key: { vbeln: sVbeln, posnr: sPosnr },
                  docids: aSelected,
                };
                var rModel = that.getView().getModel("backend");
                debugger;
                rModel.callFunction("/SetRefTemplate", {
                  method: "GET",
                  urlParameters: {
                    Vbeln: that.Vbeln,
                    Posnr: that.Posnr,
                    Vbeln_templ: sVbeln,
                    Posnr_templ: sPosnr,
                  },
                  error: function (oData) {
                    var oBundle = that
                      .getView()
                      .getModel("i18n")
                      .getResourceBundle();
                    var sMsg = "";
                    try {
                      var oResponse = JSON.parse(oData.response.body);
                      sMsg = oResponse.error.message.value;
                    } catch (e) {
                      sMsg = oBundle.getText(
                        "msgSDocNotFound",
                        that.getView().byId("vbeln")
                      );
                    }
                    var newMsgs = {
                      messagesLength: 1,
                      items: [
                        {
                          type: oBundle.getText("msgError"),
                          title: oBundle.getText("msgErrorTitle"),
                          description: sMsg,
                          counter: 1,
                        },
                      ],
                    };
                    that.getView().getModel("msgModel").setData(newMsgs);
                    that.handleMessagePopover();
                  },
                  success: function (oData, Resp) {},
                });

                //that.getView().byId("docPanel").setHeight("100%");

                this.onProfileLoad({ skipCheck: true, sendData: oSendData });
            }

            $.each(
              this.oTmplDialog.getAggregation("buttons"),
              function (idx, obj) {
                if (obj.mEventRegistry["press"]) {
                  obj.mEventRegistry["press"].length = 0;
                }
              }
            );

            that.oTmplDialog.close();
          };

          this.getView().byId("btnTemplateLoad").setVisible(oParams.load);
          this.getView().byId("btnTemplateLoadDate").setVisible(oParams.load);
          if (oParams.Docstat === "") {
            this.getView().byId("btnTemplateLoad").attachPress(fnPressHandler, this);
            this.getView().byId("btnTemplateLoadDate").attachPress(fnPressHandlerDate, this);
          } else {
            //this.getView().byId("btnTemplateLoad").attachPress(this.onTemplateLoad, this);
            this.getView().byId("btnTemplateLoad").attachPress(fnPressHandler, this);
            this.getView().byId("btnTemplateLoadDate").attachPress(fnPressHandlerDate, this);
          }

          this.getView().byId("btnTemplateCancel").attachPress(fnPressHandler, this);

          //this.getView().byId("btnTemplateSave").setVisible(oParams.save);
          //this.getView().byId("btnTemplateSave").attachPress(this.onProfileSave, this);
        }

        that.oTmplDialog.open();
      },

      onTemplateListPress: function (evt) {
        var src = evt.getSource();
        var bSelected = src
          .getBindingContext("listTemplates")
          .getModel()
          .getProperty(
            src.getBindingContext("listTemplates").getPath() + "/Selected"
          );

        src
          .getBindingContext("listTemplates")
          .getModel()
          .setProperty(
            src.getBindingContext("listTemplates").getPath() + "/Selected",
            !bSelected
          );
      },

      onProfileClick: function () {
        this.onProfile({ save: true, load: false });
      },

      onTemplateLoad: function (oParams) {
        var that = this;

        if (oParams.profile_vbeln && oParams.profile_posnr) {
          that.Vbeln = oParams.profile_vbeln;
          that.Posnr = oParams.profile_posnr;
        }

        var bSkip = false;
        var sProfile;
        if (oParams && oParams.skipCheck) {
          bSkip = true;
        }

        if (oParams && oParams.NoProfile) {
          sProfile = "";
        } else {
          sProfile = that.getView().byId("fldProfileName").getValue();
        }

        var rModel = that.getView().getModel("backend");
        if (sProfile === "ANTOS") {
          var that = this;

          function display_msg(data) {
            var oBundle = that.getView().getModel("i18n").getResourceBundle();
            var sMsg = "";

            var aItems = [];

            if (data.RETVAL.RETURN.length == 0) {
              return;
            }

            $.each(data.RETVAL.RETURN, function (index, obj) {
              aItems.push({
                type: oBundle.getText("msgError"),
                title: oBundle.getText("msgErrorTitle"),
                description: obj.TEXT,
                counter: 1,
              });
            });

            var newMsgs = {
              messagesLength: aItems.length,
              items: aItems,
            };

            that.getView().getModel("msgModel").setData(newMsgs);
            that.handleMessagePopover();
          }
          function check_filters(fn) {
            that.setCheckFilters();
          }
          function success_cb(data) {
            var controller = that;

            if (!data.ROOT.CONTENT) {
              return;
            }

            var aResults = data.ROOT.CONTENT.DOCLIST.RESULTS;

            var oModelData = that.getView().getModel("DocList").getData();
            oModelData.results = aResults;
            that.getView().getModel("DocList").setData(oModelData);
          }
          function select_firstItem(data, isAntos) {
            var listControl = that.getView().byId("list");
            var aItems = listControl.getItems();
            var firstItem;

            if (aItems.length == 0) {
              return;
            }

            $.each(aItems, function (idx, el) {
              var firstItemData = el
                .getModel()
                .getObject(el.getBindingContextPath());
              if (firstItemData.Vbeln.length > 0 && !firstItem) {
                firstItem = el;
              }
            });

            if (firstItem) {
              that.getView().byId("list").setSelectedItem(firstItem, true);
            }

            var bus = sap.ui.getCore().getEventBus();
            bus.publish("nav", "listitem", {
              id: "DocItems",
              data: {
                antos: isAntos,
                skipCheck: bSkip,
                item: firstItem
                  .getModel("DocList")
                  .getObject(firstItem.getBindingContextPath("DocList")),
              },
            });
          }

          $.ajax({
            type: "POST",
            url: "/sap/bc/zcomm/zdcont/read_antos_data",
            data: JSON.stringify({
              KEY: { VBELN: that.Vbeln, POSNR: that.Posnr },
            }),
            error: function (oData) {
              var oBundle = that.getView().getModel("i18n").getResourceBundle();
              var sMsg = "";
              try {
                var oResponse = JSON.parse(oData.response.body);
                sMsg = oResponse.error.message.value;
              } catch (e) {
                sMsg = oBundle.getText(
                  "msgSDocNotFound",
                  that.getView().byId("vbeln")
                );
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
            success: function (res) {
              var oData = JSON.parse(res);

              success_cb(oData);

              display_msg(oData);

              sap.ui.getCore().mdocArray.length = 0;
              sap.ui.getCore().mdocArrayOld.length = 0;

              if (!oData.ROOT.CONTENT) {
                return;
              }

              var aTargets = [];

              $.each(oData.ROOT.CONTENT.MDOCARRAY, function (idx, el) {
                if (el.FinalDate === "0000-00-00") {
                  el.FinalDate = "";
                }
                if (el.PrelimDate === "0000-00-00") {
                  el.PrelimDate = "";
                }

                var data = el;
                data.SDDocCont_MatklSet = {};
                data.SDDocCont_MdcntSet = {};
                data.SDDocCont_TargtSet = {};

                data.SDDocCont_MatklSet.results = el.SDDOCCONT_MATKLSET.RESULTS;
                data.SDDocCont_MdcntSet.results = el.SDDOCCONT_MDCNTSET.RESULTS;
                data.SDDocCont_TargtSet.results = el.SDDOCCONT_TARGTSET.RESULTS;

                data.SDDocCont_MetaSet = {};
                data.SDDocCont_MetaSet.Active = el.SDDOCCONT_METASET.Active;
                data.SDDocCont_MetaSet.DocContent =
                  el.SDDOCCONT_METASET.DocContent;
                if (el.SDDOCCONT_METASET.Languavail === "X") {
                  data.SDDocCont_MetaSet.Languavail = true;
                } else {
                  data.SDDocCont_MetaSet.Languavail = false;
                }
                if (el.SDDOCCONT_METASET.Mdcntavail === "X") {
                  data.SDDocCont_MetaSet.Mdcntavail = true;
                } else {
                  data.SDDocCont_MetaSet.Mdcntavail = false;
                }

                data.SDDocCont_MetaSet.Posnr = el.SDDOCCONT_METASET.Posnr;
                data.SDDocCont_MetaSet.Vbeln = el.SDDOCCONT_METASET.Vbeln;

                sap.ui.getCore().mdocArray.push(data);
                sap.ui.getCore().mdocArrayOld.push(JSON.parse(JSON.stringify(data)));

                $.each(
                  el.SDDOCCONT_TARGTSET.RESULTS,
                  function (number, object) {
                    aTargets.push(object);
                  }
                );
              });

              var oDocList = {};
              oDocList.results = oData.ROOT.CONTENT.DOCLIST.RESULTS;

              var langHandler = new LangHandler({
                Langs: oData.ROOT.CONTENT.LANGUS,
                Targets: aTargets,
                DocList: oDocList,
              });

              sap.ui.getCore().langHandler = langHandler;

              check_filters();

              select_firstItem(oData, true);
            },
          });
        } else {
          rModel.callFunction("/GetDocList", {
            method: "GET",
            urlParameters: {
              Vbeln: that.Vbeln,
              Posnr: that.Posnr,
              DcProfile: sProfile,
            },
            error: function (oData) {
              var oBundle = that.getView().getModel("i18n").getResourceBundle();
              var sMsg = "";
              try {
                var oResponse = JSON.parse(oData.response.body);
                sMsg = oResponse.error.message.value;
              } catch (e) {
                sMsg = oBundle.getText(
                  "msgSDocNotFound",
                  that.getView().byId("vbeln")
                );
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
              that.getView().getModel().setData({});
              that.getView().getModel().setData(oData);
              //that.getView().byId("docPanel").setHeight("100%");

              var listControl = that.getView().byId("list");
              var aItems = listControl.getItems();
              var firstItem;

              if (aItems.length == 0) {
                return;
              }

              $.each(aItems, function (idx, el) {
                var firstItemData = el
                  .getModel()
                  .getObject(el.getBindingContextPath());
                if (firstItemData.Vbeln.length > 0 && !firstItem) {
                  firstItem = el;
                }
              });

              if (firstItem) {
                that.getView().byId("list").setSelectedItem(firstItem, true);
              }

              var bus = sap.ui.getCore().getEventBus();
              bus.publish("nav", "listitem", {
                id: "DocItems",
                data: {
                  skipCheck: bSkip,
                  item: firstItem
                    .getModel("DocList")
                    .getObject(firstItem.getBindingContextPath("DocList")),
                },
              });
            },
            async: false,
          });
        }

        that
          .getView()
          .byId("btnProfileLoad")
          .detachPress(that.onProfileLoad, that);
      },

      onProfileLoad: function (oParams) {
        var that = this;

        var oLocalParams = oParams;

        if (oParams.profile_vbeln && oParams.profile_posnr) {
          that.Vbeln = oParams.profile_vbeln;
          that.Posnr = oParams.profile_posnr;
        }

        var bSkip = false;
        var sProfile = "";
        if (oParams && oParams.skipCheck) {
          bSkip = true;
        }

        if (oParams && oParams.NoProfile) {
          sProfile = "";
        } else if (oParams.profile_name) {
          sProfile = oParams.profile_name;
        } else {
          sProfile = that.getView().byId("fldProfileName").getValue();
        }

        if(oParams.sendData && oParams.sendData.template_key){
          sProfile = "TEMPLATE";
        }

        sap.ui.getCore().sProfile = sProfile;

        var rModel = that.getView().getModel("backend");

        switch (sProfile) {
          case  "Create with template":
          case "TEMPLATE":
            function display_msg1(data) {
              var oBundle = that.getView().getModel("i18n").getResourceBundle();
              var sMsg = "";

              var aItems = [];

              if (data.RETVAL.RETURN.length == 0) {
                return;
              }

              $.each(data.RETVAL.RETURN, function (index, obj) {
                aItems.push({
                  type: oBundle.getText("msgError"),
                  title: oBundle.getText("msgErrorTitle"),
                  description: obj.TEXT,
                  counter: 1,
                });
              });

              var newMsgs = {
                messagesLength: aItems.length,
                items: aItems,
              };

              that.getView().getModel("msgModel").setData(newMsgs);
              that.handleMessagePopover();
            }
            function check_filters1(fn) {
              that.setCheckFilters();
            }
            function success_cb1(data) {
              var controller = that;

              if (!data.ROOT.CONTENT) {
                return;
              }

              var aResults = data.ROOT.CONTENT.DOCLIST.RESULTS;

              var oModelData = that.getView().getModel("DocList").getData();
              oModelData.results = aResults;
              that.getView().getModel("DocList").setData(oModelData);
            }
            function select_firstItem1(data, isAntos) {
              var listControl = that.getView().byId("list");
              var aItems = listControl.getItems();
              var firstItem;

              if (aItems.length == 0) {
                return;
              }

              $.each(aItems, function (idx, el) {
                var firstItemData = el
                  .getModel()
                  .getObject(el.getBindingContextPath());
                if (firstItemData.Vbeln.length > 0 && !firstItem) {
                  firstItem = el;
                }
              });

              if (firstItem) {
                that.getView().byId("list").setSelectedItem(firstItem, true);
              }

              var bus = sap.ui.getCore().getEventBus();
              bus.publish("nav", "listitem", {
                id: "DocItems",
                data: {
                  antos: isAntos,
                  skipCheck: true,
                  item: firstItem
                    .getModel("DocList")
                    .getObject(firstItem.getBindingContextPath("DocList")),
                },
              });
            }

            debugger;
            that.onTemplate({
              load: true,
              save: false,
              Docstat: oParams.Docstat,
              Vbeln: oParams.Vbeln,
              Posnr: oParams.Posnr,
              initial: true,
            });
            debugger;

            const sTemplateUrl = that.getView().getModel("meta").getProperty("/templateUrl");

            if(sTemplateUrl == "" || !sTemplateUrl){
              return;
            }

            $.ajax({
              type: "POST",
              // url: "/sap/bc/zcomm/zdcont/read_template_data",
              url: sTemplateUrl,
              data: JSON.stringify(oLocalParams.sendData),
              error: function (oData) {
                var oBundle = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle();
                var sMsg = "";
                try {
                  var oResponse = JSON.parse(oData.response.body);
                  sMsg = oResponse.error.message.value;
                } catch (e) {
                  sMsg = oBundle.getText(
                    "msgSDocNotFound",
                    that.getView().byId("vbeln")
                  );
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
              success: function (res) {
                var oData = JSON.parse(res);

                success_cb1(oData);

                display_msg1(oData);

                sap.ui.getCore().mdocArray.length = 0;
                sap.ui.getCore().mdocArrayOld.length = 0;

                if (!oData.ROOT.CONTENT) {
                  return;
                }

                var aTargets = [];

                $.each(oData.ROOT.CONTENT.MDOCARRAY, function (idx, el) {
                  if (el.FinalDate === "0000-00-00") {
                    el.FinalDate = "";
                  }
                  if (el.PrelimDate === "0000-00-00") {
                    el.PrelimDate = "";
                  }

                  var data = el;
                  data.SDDocCont_MatklSet = {};
                  data.SDDocCont_MdcntSet = {};
                  data.SDDocCont_TargtSet = {};

                  data.SDDocCont_MatklSet.results =
                    el.SDDOCCONT_MATKLSET.RESULTS;
                  data.SDDocCont_MdcntSet.results =
                    el.SDDOCCONT_MDCNTSET.RESULTS;
                  data.SDDocCont_TargtSet.results =
                    el.SDDOCCONT_TARGTSET.RESULTS;

                  data.SDDocCont_MetaSet = {};
                  data.SDDocCont_MetaSet.Active = true; //el.SDDOCCONT_METASET.Active;
                  data.SDDocCont_MetaSet.DocContent =
                    el.SDDOCCONT_METASET.DocContent;
                  if (el.SDDOCCONT_METASET.Languavail === "X") {
                    data.SDDocCont_MetaSet.Languavail = true;
                  } else {
                    data.SDDocCont_MetaSet.Languavail = false;
                  }
                  if (el.SDDOCCONT_METASET.Mdcntavail === "X") {
                    data.SDDocCont_MetaSet.Mdcntavail = true;
                  } else {
                    data.SDDocCont_MetaSet.Mdcntavail = false;
                  }

                  data.SDDocCont_MetaSet.Posnr = el.SDDOCCONT_METASET.Posnr;
                  data.SDDocCont_MetaSet.Vbeln = el.SDDOCCONT_METASET.Vbeln;

                  sap.ui.getCore().mdocArray.push(data);
                  sap.ui.getCore().mdocArrayOld.push(JSON.parse(JSON.stringify(data)));

                  $.each(
                    el.SDDOCCONT_TARGTSET.RESULTS,
                    function (number, object) {
                      aTargets.push(object);
                    }
                  );
                });

                var oDocList = {};
                oDocList.results = oData.ROOT.CONTENT.DOCLIST.RESULTS;

                var langHandler = new LangHandler({
                  Langs: oData.ROOT.CONTENT.LANGUS,
                  Targets: aTargets,
                  DocList: oDocList,
                });

                sap.ui.getCore().langHandler = langHandler;

                check_filters1();

                select_firstItem1(oData, true);

                //that.oTmplDialog.close();
              },
            });
            //that.onBeforeShowHandler({Vbeln: oParams.Vbeln,
            //  Posnr: oParams.Posnr, Docstat: oParams.Docstat,
            //  callback: that.onProfileLoad});
            break;

          case "ANTOS":
            var that = this;

            function display_msg(data) {
              var oBundle = that.getView().getModel("i18n").getResourceBundle();
              var sMsg = "";

              var aItems = [];

              if (data.RETVAL.RETURN.length == 0) {
                return;
              }

              $.each(data.RETVAL.RETURN, function (index, obj) {
                aItems.push({
                  type: oBundle.getText("msgError"),
                  title: oBundle.getText("msgErrorTitle"),
                  description: obj.TEXT,
                  counter: 1,
                });
              });

              var newMsgs = {
                messagesLength: aItems.length,
                items: aItems,
              };

              that.getView().getModel("msgModel").setData(newMsgs);
              that.handleMessagePopover();
            }
            function check_filters(fn) {
              that.setCheckFilters();
            }
            function success_cb(data) {
              var controller = that;

              if (!data.ROOT.CONTENT) {
                return;
              }

              var aResults = data.ROOT.CONTENT.DOCLIST.RESULTS;

              var oModelData = that.getView().getModel("DocList").getData();
              oModelData.results = aResults;
              that.getView().getModel("DocList").setData(oModelData);
            }
            function select_firstItem(data, isAntos) {
              var listControl = that.getView().byId("list");
              var aItems = listControl.getItems();
              var firstItem;

              if (aItems.length == 0) {
                return;
              }

              $.each(aItems, function (idx, el) {
                var firstItemData = el
                  .getModel()
                  .getObject(el.getBindingContextPath());
                if (firstItemData.Vbeln.length > 0 && !firstItem) {
                  firstItem = el;
                }
              });

              if (firstItem) {
                that.getView().byId("list").setSelectedItem(firstItem, true);
              }

              var bus = sap.ui.getCore().getEventBus();
              bus.publish("nav", "listitem", {
                id: "DocItems",
                data: {
                  antos: isAntos,
                  skipCheck: bSkip,
                  item: firstItem
                    .getModel("DocList")
                    .getObject(firstItem.getBindingContextPath("DocList")),
                },
              });
            }

            $.ajax({
              type: "POST",
              url: "/sap/bc/zcomm/zdcont/read_antos_data",
              data: JSON.stringify({
                KEY: { VBELN: that.Vbeln, POSNR: that.Posnr },
              }),
              error: function (oData) {
                var oBundle = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle();
                var sMsg = "";
                try {
                  var oResponse = JSON.parse(oData.response.body);
                  sMsg = oResponse.error.message.value;
                } catch (e) {
                  sMsg = oBundle.getText(
                    "msgSDocNotFound",
                    that.getView().byId("vbeln")
                  );
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
              success: function (res) {
                var oData = JSON.parse(res);

                success_cb(oData);

                display_msg(oData);

                sap.ui.getCore().mdocArray.length = 0;
                sap.ui.getCore().mdocArrayOld.length = 0;

                if (!oData.ROOT.CONTENT) {
                  return;
                }

                var aTargets = [];

                $.each(oData.ROOT.CONTENT.MDOCARRAY, function (idx, el) {
                  if (el.FinalDate === "0000-00-00") {
                    el.FinalDate = "";
                  }
                  if (el.PrelimDate === "0000-00-00") {
                    el.PrelimDate = "";
                  }

                  var data = el;
                  data.SDDocCont_MatklSet = {};
                  data.SDDocCont_MdcntSet = {};
                  data.SDDocCont_TargtSet = {};

                  data.SDDocCont_MatklSet.results =
                    el.SDDOCCONT_MATKLSET.RESULTS;
                  data.SDDocCont_MdcntSet.results =
                    el.SDDOCCONT_MDCNTSET.RESULTS;
                  data.SDDocCont_TargtSet.results =
                    el.SDDOCCONT_TARGTSET.RESULTS;

                  data.SDDocCont_MetaSet = {};
                  data.SDDocCont_MetaSet.Active = el.SDDOCCONT_METASET.Active;
                  data.SDDocCont_MetaSet.DocContent =
                    el.SDDOCCONT_METASET.DocContent;
                  if (el.SDDOCCONT_METASET.Languavail === "X") {
                    data.SDDocCont_MetaSet.Languavail = true;
                  } else {
                    data.SDDocCont_MetaSet.Languavail = false;
                  }
                  if (el.SDDOCCONT_METASET.Mdcntavail === "X") {
                    data.SDDocCont_MetaSet.Mdcntavail = true;
                  } else {
                    data.SDDocCont_MetaSet.Mdcntavail = false;
                  }

                  data.SDDocCont_MetaSet.Posnr = el.SDDOCCONT_METASET.Posnr;
                  data.SDDocCont_MetaSet.Vbeln = el.SDDOCCONT_METASET.Vbeln;

                  sap.ui.getCore().mdocArray.push(data);
                  sap.ui.getCore().mdocArrayOld.push(JSON.parse(JSON.stringify(data)));

                  $.each(
                    el.SDDOCCONT_TARGTSET.RESULTS,
                    function (number, object) {
                      aTargets.push(object);
                    }
                  );
                });

                var oDocList = {};
                oDocList.results = oData.ROOT.CONTENT.DOCLIST.RESULTS;

                var langHandler = new LangHandler({
                  Langs: oData.ROOT.CONTENT.LANGUS,
                  Targets: aTargets,
                  DocList: oDocList,
                });

                sap.ui.getCore().langHandler = langHandler;

                check_filters();

                select_firstItem(oData, true);
              },
            });
            break;
          default:
            rModel.callFunction("/GetDocList", {
              method: "GET",
              urlParameters: {
                Vbeln: that.Vbeln,
                Posnr: that.Posnr,
                DcProfile: sProfile,
              },
              error: function (oData) {
                var oBundle = that
                  .getView()
                  .getModel("i18n")
                  .getResourceBundle();
                var sMsg = "";
                try {
                  var oResponse = JSON.parse(oData.response.body);
                  sMsg = oResponse.error.message.value;
                } catch (e) {
                  sMsg = oBundle.getText(
                    "msgSDocNotFound",
                    that.getView().byId("vbeln")
                  );
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
                that.getView().getModel().setData({});
                that.getView().getModel().setData(oData);
                
                that.getView().getModel("DocListOld").setData(JSON.parse(JSON.stringify(oData)));
                //that.getView().byId("docPanel").setHeight("100%");

                var listControl = that.getView().byId("list");
                var aItems = listControl.getItems();
                var firstItem;

                if (aItems.length == 0) {
                  return;
                }

                if (!that.Noinit) {
                  that.readLangInfo(rModel, that);
                }

                $.each(aItems, function (idx, el) {
                  var firstItemData = el
                    .getModel()
                    .getObject(el.getBindingContextPath());
                  if (firstItemData.Vbeln.length > 0 && !firstItem) {
                    firstItem = el;
                  }
                });

                if (firstItem) {
                  that.getView().byId("list").setSelectedItem(firstItem, true);
                }

                var bus = sap.ui.getCore().getEventBus();
                bus.publish("nav", "listitem", {
                  id: "DocItems",
                  data: {
                    skipCheck: bSkip,
                    item: firstItem
                      .getModel("DocList")
                      .getObject(firstItem.getBindingContextPath("DocList")),
                  },
                });
              },
              async: false,
            });
        }

        if (sProfile === "ANTOS") {
        } else {
        }

        that
          .getView()
          .byId("btnProfileLoad")
          .detachPress(that.onProfileLoad, that);
      },

      onProfileSave: function () {
        //var oObject = { content : { dcProfile : "", results: [] } };
        //oObject.content.dcProfile = this.getView().byId("fldProfileName").getValue();
        var that = this;

        var docListModel = that.getView().getModel();

        var mdocArray = sap.ui.getCore().mdocArray;

        var obj = {
          content: {
            Vbeln: that.Vbeln,
            Posnr: that.Posnr,
            dcProfile: this.getView().byId("fldProfileName").getValue(),
            results: docListModel.getData().results,
          },
        };

        var oBundle = that.getView().getModel("i18n").getResourceBundle();

        if (this.getView().byId("fldProfileName").getValue() == "ANTOS") {
          var bCompact = !!that.getView().$().closest(".sapUiSizeCompact")
            .length;
          var sMsg = oBundle.getText("msgANTOSSaveError");
          MessageBox.alert(sMsg, {
            styleClass: bCompact ? "sapUiSizeCompact" : "",
          });

          return;
        }

        $.ajax({
          type: "POST",
          url: "/sap/bc/zcomm/zdcont/save_profile",
          data: JSON.stringify(obj),
          error: function (oData) {
            var oBundle = that.getView().getModel("i18n").getResourceBundle();
            var sMsg = "";
            try {
              var oResponse = JSON.parse(oData.response.body);
              sMsg = oResponse.error.message.value;
            } catch (e) {
              sMsg = oBundle.getText(
                "msgSDocNotFound",
                that.getView().byId("vbeln")
              );
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
          success: function (res) {
            console.log("save completed.");
            var msg = JSON.parse(res);
            if (msg.RETVAL.RETURN.length > 0) {
              var oBundle = that.getView().getModel("i18n").getResourceBundle();
              var newMsgs = {
                messagesLength: msg.RETVAL.RETURN.length,
                items: [],
              };
              $.each(msg.RETVAL.RETURN, function (idx, el) {
                var sMsg = el.TEXT;
                var sMsgType = oBundle.getText("msgError");
                if (el.TYPE == "I") {
                  sMsgType = oBundle.getText("msgSuccess");
                }
                newMsgs.items.push({
                  type: sMsgType,
                  title: sMsg,
                  description: sMsg,
                  //subtitle: 'Example of subtitle',
                  counter: 1,
                });
              });
              that.getView().getModel("msgModel").setData(newMsgs);
              that.handleMessagePopover();
            }
          },
        });
        that
          .getView()
          .byId("btnProfileSave")
          .detachPress(that.onProfileSave, that);
      },

      onProfileCancel: function () {
        //this.onProfileLoad({skipCheck: true, NoProfile: true});
        //this.getView().byId("dlgProfile").close();
      },

      onBack: function () {
        var that = this;

        const oDocList = this.getView().getModel();
        const oDocListOld = this.getView().getModel("DocListOld");
        const sDocList = JSON.stringify(oDocList.getData());
        const sDocListOld = JSON.stringify(oDocListOld.getData());

        const cMdocArray = sap.ui.getCore().mdocArray;
        const cMdocArrayOld = sap.ui.getCore().mdocArrayOld;

        let aMdoc = [];
        let aMdocOld = [];

        debugger;

        $.each(cMdocArray, function (idx, obj) {
          aMdoc.push({Active : obj.Active,
            CustomerDocno : obj.CustomerDocno,
            DcComment : obj.DcComment,
            DcOption : obj.DcOption,
            DcSelected : obj.DcSelected,
            DocContent : obj.DocContent,
            Dokar : obj.Dokar,
            FinalDate : obj.FinalDate,
            Keyword1 : obj.Keyword1,
            Keyword2 : obj.Keyword2,
            Penal : obj.Penal,
            PlansCre : obj.PlansCre, 
            PlansEfs : obj.PlansEfs,
            PlansIfs : obj.PlansIfs,
            Posnr : obj.Posnr,
            PrelimDate : obj.PrelimDate,
            SddcStatus : obj.SddcStatus,
            Status1 : obj.Status1,
            Status2 : obj.Status2,
            Status3 : obj.Status3,
            Status4 : obj.Status4,
            Status5 : obj.Status5,
            Status6 : obj.Status6,
            Status7 : obj.Status7,
            Status8 : obj.Status8,
            Status9 : obj.Status9,
            Status10 : obj.Status10,
            TemplVisited : obj.TemplVisited,
            Vbeln : obj.Vbeln });
        });

        $.each(cMdocArrayOld, function (idx, obj) {
          aMdocOld.push({Active : obj.Active,
            CustomerDocno : obj.CustomerDocno,
            DcComment : obj.DcComment,
            DcOption : obj.DcOption,
            DcSelected : obj.DcSelected,
            DocContent : obj.DocContent,
            Dokar : obj.Dokar,
            FinalDate : obj.FinalDate,
            Keyword1 : obj.Keyword1,
            Keyword2 : obj.Keyword2,
            Penal : obj.Penal,
            PlansCre : obj.PlansCre, 
            PlansEfs : obj.PlansEfs,
            PlansIfs : obj.PlansIfs,
            Posnr : obj.Posnr,
            PrelimDate : obj.PrelimDate,
            SddcStatus : obj.SddcStatus,
            Status1 : obj.Status1,
            Status2 : obj.Status2,
            Status3 : obj.Status3,
            Status4 : obj.Status4,
            Status5 : obj.Status5,
            Status6 : obj.Status6,
            Status7 : obj.Status7,
            Status8 : obj.Status8,
            Status9 : obj.Status9,
            Status10 : obj.Status10,
            TemplVisited : obj.TemplVisited,
            Vbeln : obj.Vbeln });
        });

        if(sDocList !== sDocListOld || JSON.stringify(aMdoc) !== JSON.stringify(aMdocOld) ){
          debugger;

          sap.m.MessageBox.confirm("Die Daten wurden verändert. Sollen die Änderungen gesichert werden?", {
            title: "Änderungen",                                    // default
            onClose: null,                                       // default
            styleClass: "",                                      // default
            actions: [ sap.m.MessageBox.Action.YES,
                       sap.m.MessageBox.Action.NO,
                       sap.m.MessageBox.Action.CANCEL ],         // default
            emphasizedAction: sap.m.MessageBox.Action.OK,        // default
            initialFocus: null,                                  // default
            textDirection: sap.ui.core.TextDirection.Inherit,     // default

            onClose: function(oAction){
              if(oAction == sap.m.MessageBox.Action.YES){

                that.onSave();
                //oDocListOld.setData(oDocList.getData());
                //sap.ui.getCore().mdocArrayOld = sap.ui.getCore().mdocArray;

              }else if(oAction == sap.m.MessageBox.Action.NO){
                var bus = sap.ui.getCore().getEventBus();

                bus.publish("nav", "back", {
                  id: "PosList",
                  data: {},
                });

              }
            }
        });
        }else{

          var bus = sap.ui.getCore().getEventBus();

                bus.publish("nav", "back", {
                  id: "PosList",
                  data: {},
                });

        }

        
      },
    });
  }
);
