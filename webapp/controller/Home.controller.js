sap.ui.define([
    "../controller/BaseController",
 ], function (BaseController) {
    "use strict";
 
    return BaseController.extend("zprelimdoc.controller.Home", {
        onDisplayNotFound : function () {
			// display the "notFound" target without changing the hash
			this.getRouter().getTargets().display("notFound", {
				fromTarget : "home"
			});
		},
		onNavToEmployees : function (){
			this.getRouter().navTo("employeeList");
		}
    });
 
 });