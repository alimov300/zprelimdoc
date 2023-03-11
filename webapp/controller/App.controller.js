sap.ui.define([
	"../controller/BaseController",
], function(BaseController) {
	"use strict";

	return BaseController.extend("zprelimdoc.controller.App", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zewm_tourbox_dialog.view.App
		 */
		onInit: function() {
			var that = this;
			
		    this.core = sap.ui.getCore();
			var glUiModel = new sap.ui.model.json.JSONModel();
			glUiModel.setData({"DetailsErrors": false});
			this.core.setModel(glUiModel, "UIModel");
			
			var dstoreModel = new sap.ui.model.json.JSONModel();
			this.core.setModel(dstoreModel, "DStore");
			
			this.core.mdocArray = [];
			this.app = this.getView().byId("app");

			this.app.setDefaultTransitionName("fade");

			var oBus = this.core.getEventBus();

			oBus.subscribe("nav", "to", this.navToDetails, this);			
			oBus.subscribe("nav", "back", this.navBack, this);
					
		},
	
		navToDetails: function(channelId, eventId, data) {
			var that = this;

            this.core.mdocArray = [];
		    var oModel = that.app.getModel();
//		    var dModel = sap.ui.getCore().getModel("DStore");
//		    dModel.setData({ "docList": [], "changedDocs": [] });
		    
			//this.getRouter().navTo("doc");
			this.getRouter().navTo("employeeList");
			//that.app.to(that.getView().createId("idDoc"), "slide" ,data.data);
		},	

		navBack: function() {

			this.onNavBack();

		},
		

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zewm_tourbox_dialog.view.App
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zewm_tourbox_dialog.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zewm_tourbox_dialog.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});