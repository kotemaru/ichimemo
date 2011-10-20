var Top = Page.def(function Top(){}, function(Class){

Class.onBeforeShow = function() {
	if (Login.user == null) {
		Class.changePage("#Login");
	} else {
		Class.changePage(Map.ID);
		//Map.setCenterFromGPS();
	}
}
Class.changePage = function(id) {
	$.mobile.showPageLoadingMsg();
	setTimeout(function(){
		$.mobile.changePage(id, "none");
	},100);
}

});

