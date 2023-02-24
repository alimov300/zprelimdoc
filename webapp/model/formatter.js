sap.ui.define([], function () {
	"use strict";
	return {
		fnDateTimeFormatter: function (oValue){
			  if (oValue == undefined || oValue == "")
				  return;
		      var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "yyyy/MM/dd"});
				    //return oDateFormat.format(new Date(oValue));
			  return oDateFormat.format(oValue);
		},
		
		fnUiStatus : function(oActive, sStatus){
			if(!oActive){
				return sap.ui.core.ValueState.None;
			}else{
				return sStatus;
			}
				
		},
		
		fnTemplate : function(oValue){
			debugger;
			if(oValue === "TEMPLATE"){
				return 'Erstellen mit Vorlage';
			}
			return oValue;
		},
		
		fnProfile : function(sProfile){
			if(!sProfile){
				return "";
			}
			if(sProfile === ""){
				return "";
			}
			return "Profile: " + sProfile;
		},
		
		fnSelectableFormatter : function(sValue){
			if(!sValue){
				return false;
			}
			if(sValue === true){
				return true;
			}
			if(sValue === "X"){
				return true;
			}
			if(sValue === ""){
				return false;
			}
				
		},
		
		fnNonSelectableFormatter : function(sValue){
			if(!sValue){
				return true;
			}
			if(sValue === true){
				return false;
			}
			if(sValue === "X"){
				return false;
			}
			if(sValue === ""){
				return true;
			}
				
		},
		
		fnProfileEditable : function(sText){
			if(sText == "ANTOS"){
				return false;
				
			}else{
				return true;
			}
		},
		
		fnNoAllZeros : function(oValue){
			if(+oValue == 0){
				return false;
			}
			return true;
		},
		
		fnVorabFieldActivate : function(bActive, sValue){

			if(bActive){
				if(sValue == "5" || sValue == "6"){
					return false;
				}
				return true;
			}else{
				return false;
			}
			
		},
		
		fnFertigFieldActivate : function(bActive, sValue){

			if(bActive){
				if(sValue == "3" || sValue == "4"){
					return false;
				}
				return true;
			}else{
				return false;
			}
			
		},
		
		fnExternFieldActivate : function(bActive, sValue){

			if(bActive){
				if(sValue == "5" || sValue == "6"){
					return false;
				}
				return true;
			}else{
				return false;
			}
		},
		
		fnColumnListItem : function(bInactive){
			if(bInactive){
				return "Inactive";
			}else{
				return "Navigation";
			}
		},
		
		fnCheckedButton : function(oValue){
			if(oValue == true){
				return true;
			}
			return false;
		},
		
		fnMatGroup : function(oValue){
			if(oValue == "2"){
				return true;
			}
			return false;
		},
		
		fnRemoveZeros : function(oValue){
			return (+oValue).toString();
		},
		
		fnSDIconAltText : function(oStatus){
			switch(oStatus){
			case "ZDO2":
				return "Abschluss final";

			case "ZDO1":
				return "Dokuliste erstellt";
			}

			return "";

		},
		fnSDIcon : function(oStatus){
			switch(oStatus){
			case "ZDO2":
				return "sap-icon://locked";
			case "ZDO1":
				return "sap-icon://instance";
			}

			return "";
		},
		fnDocContentFormatter : function(oDocCont){
			return (+oDocCont).toString();
		},
        fnCheckDcOptFormatter : function(oDcOption){
        	if(!oDcOption){
        		return false;
        	}
        	if(oDcOption){
        		return true;
        	}else{
        		
        		return false;
        	}
        },
        fnToggleFlgFormatter : function(oDcOption, oEnabled, oDcSelected){
        	if(!oEnabled){
        		return false;
        	}
        	if (oDcSelected !== "X") {
        		return false;
        	}
        	
        	if (oDcSelected === "X") {
        		return true;
        	}

        	if(+oDcOption == 0){
        		return false;
        	}
        	
        	return true;
        },
        fnToggleTextFormatter : function(oDcOption, oField){
        	
        	var oBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
        	
        	if(+oDcOption <= 1){
        		return oBundle.getText("optStandard");
        	}else{
        		return oBundle.getText("optSpecial");
        	}
        },
        fnRemoveNulls : function(oValue){
        	if(!oValue){
        		return "";
        	}
        	return oValue.replace(/\b0+/g, '');
        },
        fnDateFormatter : function(oValue){
        	if(!oValue){
        		return "";
        	}
        	return oValue;
        },
        fnRemoveNullsExt : function(oValue){
        	var sStr = " ";
        	if(!oValue){
        		return "    " + sStr;
        	}
        	return sStr + oValue.replace(/\b0+/g, '');
        },

        fnDocContAsDD : function(oValue, oText){
			return (+oValue).toString() + ' - ' + oText;
        },

        fnSwitchDcOptFormatter : function(oDcOption){
        	if(+oDcOption <= 1){
        		return false;
        	}else{
        		return true;
        	}
        	
        }
	};
});