Page.def(function UserReg(){}, function(Class){
	
	Class.onBeforeShow = function() {
		Util.evalAttr(Class.PAGE,function(c){return eval(c)});
	}
	
	Class.write = function() {
		var $page = $(Class.PAGE);
		if ($page.find(".accede").is(":checked") == false) {
			alert("利用規約に同意してください。");
			return;
		}

		Login.user.googleUser = $page.find(".googleUser").val();
		Login.user.twitterUser = $page.find(".twitterUser").val();
		Login.user.nickname = $page.find(".nickname").val();
		Login.user.comment = "";
		Login.user.photoUrl = null;

		var msg = Kokorahen.writeUser(Login.user);
		if (msg != null) {
			alert(msg);
		} else {
			Login.refresh();
			Util.changePage(Top.ID);
		}
	}
});
