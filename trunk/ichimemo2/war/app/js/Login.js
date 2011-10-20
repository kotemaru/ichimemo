Module.def(window, function Login(){}, function(Class){

Class.user = __Login_user;

Class.login = function(provider) {
	try {
		location.href = Kokorahen.login(provider);
	} catch (err) {
		alert(err);
	}
}

Class.logout = function() {
	document.cookie = "JSESSIONID=x";
	PCookie.clear();
	if (Class.user != null) {
		location.href = Kokorahen.logout(Class.user.provider);
	} else {
		location.href = Kokorahen.logout(null);
	}
}
Class.refresh = function() {
	Class.user = Kokorahen.getLoginUser();
}

});