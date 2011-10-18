Module.def(window, function History(){}, function(Class){

Class.stack = [];

Class.push = function() {
	Class.stack.pusu({
		$.mobile.activePage
	});
}

Class.logout = function() {
	if (Class.user != null) {
		location.href = Kokorahen.logout(Class.user.provider);
	} else {
		location.href = Kokorahen.logout(null);
	}
	Class.user = null;
	PCookie.clear();
}
Class.refresh = function() {
	Class.user = Kokorahen.getLoginUser();
}

});
