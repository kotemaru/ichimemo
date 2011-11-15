var Top = Page.def(function Top(){}, function(Class){

	Class.waitCount = 0;
		
	Class.onBeforeShow = function() {
		setTimeout(function(){Login.loginCheck(Class.goMain)}, 100);
	}
	
	Class.goMain = function(user) {
		if (user == null) {
			Class.changePage("#Login");
		} else if (user.temporal) {
			Class.changePage("#UserReg");
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

