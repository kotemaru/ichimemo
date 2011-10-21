var Top = Page.def(function Top(){}, function(Class){

Class.waitCount = 0;
	
Class.onBeforeShow = function() {
	setTimeout(Class.loginCheck, 100);
}

Class.loginCheck = function() {
	if (PCookie.done || Class.waitCount>10) {
		Login.user = Kokorahen.getLoginUser();
	} else {
		Class.waitCount++;
		console.log("Wait PCookie.load ", Class.waitCount);
		setTimeout(Class.loginCheck, 100);
		return;
	}
	if (Login.user == null) {
		Class.changePage("#Login");
	} else {
		Class.changePage(Map.ID);
	}
}




Class.changePage = function(id) {
	$.mobile.showPageLoadingMsg();
	setTimeout(function(){
		$.mobile.changePage(id, "none");
	},100);
}

});

