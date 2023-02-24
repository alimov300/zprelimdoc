function LangHandler(oParams) {
	lHandler = this;
	
	this.Vbeln = "";
	this.Posnr = "";
	this.allLangs = [];
	this.targets = oParams.Targets;
	this.langus = oParams.Langs;

	this.mdocArray = sap.ui.getCore().mdocArray;
	this.docList = oParams.DocList;


	this.isTopLevel = false;
	this.myItems = [];
	this.myValues = [];
	this.myAssignments = [];
	this.myTargets = [];
	
	this.myModel = new sap.ui.model.json.JSONModel();

	this.setDocContent = function( oDocContent, iVbeln, iPosnr ) {
		//
		this.Vbeln = iVbeln;
		this.Posnr = iPosnr;
		
		this.myAssignments = [];
		this.readChildren(oDocContent);			
		this.myTargets = [];
		this.readTargets(oDocContent);			
		this.readItems(oDocContent);
		this.readValues(oDocContent);
		
		this.myModel.setData({assignments: this.myAssignments});
	};

	this.readChildren = function( oDocContent ) {
		var that = this;
		if ( $.grep( this.myAssignments, function(o) {return o.DocContent == oDocContent } ).length > 0 )
		{ return false; }
		
		//
		var myDocContent = oDocContent;
		var myChildren = [];

		for ( var curTrg in this.docList.results ){
			var curLine = this.docList.results[curTrg];
			if(curLine.DcSelected !== "X") continue;
			var myChld = $.grep( this.targets, function(o) { return ( o.DocContent == curLine.DocContent) && o.Target == myDocContent } );
			if ( myChld.length > 0 ) {
				
   		    	myChildren.push( myChld[0]);	
			}
			
		}
		
		// here we need to add VBAK Targets
		if(+this.Posnr !== 0){
			var myChld = $.grep( this.targets, function(o) {
				if(o.Posnr == "000000"){
					return o.Target == myDocContent && o.Posnr == "000000";
				}else
					return false;
				} );
			if ( myChld.length > 0 ) {
				for(var iCnt = 0; iCnt < myChld.length; iCnt++){
					myChildren.push( myChld[iCnt] );	
				}
   		    	
			}
		}

		$.each(myChildren, function(i, o) {
			var currAssign = {DocContent: o.DocContent};
			//todo+++
			currAssign.Selected = false;
			currAssign.Langs = [];
			//currAssign.fldFalse = false;
			//currAssign.fldTrue = true;
			$.each(lHandler.langus, function(i,o) {
				var curLangu = o.Langu;
			if (o.DocContent == currAssign.DocContent) {
				var text  = $.map(sap.ui.getCore().allLangs, function(o){
					if(curLangu == o.Value){
						return o.Text;
					}
				}).toString();
				
				currAssign.Langs.push( {Value: o.Langu, Text: text } );
			   }
       		} );
			lHandler.myAssignments.push( currAssign );
			lHandler.readChildren(o.DocContent) } );

		this.isTopLevel = ( this.myAssignments.length > 0 );

	};

	this.readTargets = function( oDocContent ) {
		lHandler.myTargets = $.grep(lHandler.targets, function(o) { return o.DocContent == oDocContent } );
	};

	this.readItems = function( oDocContent ) {
		lHandler.myItems = [];
		if ( lHandler.myTargets.length > 0 ) {
			$.each(lHandler.myTargets, function(i,o) {
				var targDCont = o.Target;
				$.each(lHandler.langus, function(i,o) {
					var index = -1;
					if (o.DocContent == targDCont) {
						var curLangu = o.Langu;
			            var text = $.map(sap.ui.getCore().allLangs, function(o){
							if(curLangu == o.Value){
								return o.Text;
							}
						}).toString();
			            if($.grep(lHandler.myItems, function(obj, idx){return obj.Value===o.Langu}).length === 0){
			            	index = lHandler.myItems.push( { Value: o.Langu, Text: text } );
			            }
					}
					
				} );
				// no texts from grandfather/mother - copy all texts
				var oAllLangs = sap.ui.getCore().allLangs;
				if(!lHandler.myItems || lHandler.myItems.length == 0){
					lHandler.myItems = [];
					$.each(oAllLangs, function(i,o){
						lHandler.myItems.push({Value: o.Value, Text: o.Text});
					});
					
				}
			} )			
		}
		else {
			this.myItems = this.allLangs;
		};
	};
	
	this.readValues = function( oDocContent ) {
		this.myValues = [];
		$.each(this.langus, function(i,o) {
			if (o.DocContent == oDocContent) { lHandler.myValues.push( o.Langu ) }
		} );
		
	};
	
	this.updateLangus = function(oDocContent, oLangus){
		
		//this.langus
		var myLangus = {DocContent: oDocContent};
		if(!lHandler.langus){
			lHandler.langus = [];
		}
		
		lHandler.langus = $.grep(lHandler.langus, function(o) { return o.DocContent != myLangus.DocContent } );
		$.each(oLangus, function(i,o){
			lHandler.langus.push({DocContent: myLangus.DocContent, Langu: o});
		});
		
	};
	

}