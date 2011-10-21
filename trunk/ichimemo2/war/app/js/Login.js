Module.def(window, function Login(){}, function(Class){

Class.user = null;
Class.waitCount = 0;

Class.loginCheck = function(callback) {
	if (PCookie.done || Class.waitCount>10) {
		Class.user = Kokorahen.getLoginUser();
		PCookie.setMaxAge("JSESSIONID",1000000);
		PCookie.save();
	} else {
		Class.waitCount++;
		console.log("Wait PCookie.load ", Class.waitCount);
		setTimeout(function(){Class.loginCheck(callback)}, 100);
		return;
	}
	callback(Class.user);
}

Class.login = function(provider) {
	try {
		location.href = Kokorahen.login(provider);
	} catch (err) {
		alert(err);
	}
}

Class.logout = function() {
	PCookie.clear(function(){
		var provider = Class.user==null ? null : Class.user.provider;
		var href = Kokorahen.logout(Class.user.provider);
		document.cookie = "JSESSIONID=x";
		location.href = href;
	});
}
Class.refresh = function() {
	Class.user = Kokorahen.getLoginUser();
}



});
