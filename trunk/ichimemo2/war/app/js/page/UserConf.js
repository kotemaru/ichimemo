Page.def(function UserConf(){}, function(Class){
	
	Class.init = function()  {
		// nop.
	}
	Class.go = function()  {
		if (Login.user == null) return;
		var form = document.userConf;
		form.userId.value = Login.user.userId;
		form.googleUser.value = Login.user.googleUser;
		form.twitterUser.value = Login.user.twitterUser;
		form.nickname.value = Login.user.nickname;
		//form.autoTwit.selectedIndex = Login.user.autoTwit ? 1 : 0;
		Class.getThumbnailImg().attr("src", Util.correctImg(Login.user.photoUrl));
	
		Util.changePage(Class.ID);
	}
	
	
	Class.onBeforeShow = function() {
		var form = document.userConf;
		$(form.autoTwit).slider("refresh");
		Util.setNavbar(Class.PAGE);
	}
	
	
	Class.write = function() {
		var form = document.userConf;
		Login.user.googleUser = form.googleUser.value;
		Login.user.twitterUser = form.twitterUser.value;
		Login.user.nickname = form.nickname.value;
		//Login.user.autoTwit = (form.autoTwit.selectedIndex != 0);
		Login.user.comment = form.comment.value;
	
		var photo =  Class.getThumbnailImg().attr("src");
		if (photo != null && photo.match(/^\/images/)) {
			photo = null;
		}
		Login.user.photoUrl = photo;
		
		Kokorahen.writeUser(Login.user);
		Login.refresh();
	}
	Class.getThumbnailImg = function () {
		var $img = $(Class.PAGE).find(".Thumbnail img");
		return $img;
	}

	
	Class.addFollow = function(userId) {
		if (Login.user.userId == userId) {
			alert("自分はフォローできません。");
			return;
		}
		if (Login.user.follows.length >= 10) {
			alert("フォローは10人までです。");
			return;
		}
		
		if (Login.user.follows.indexOf(userId) >= 0) {
			alert("既にフォローしてます。");
			return;
		}
		Login.user.follows.push(userId);
		Kokorahen.writeUser(Login.user);
		Login.refresh();
	}
	Class.delFollow = function(userId) {
		var idx = Login.user.follows.indexOf(userId);
		if (idx < 0) return;
		Login.user.follows.splice(idx, 1);
		Kokorahen.writeUser(Login.user);
		Login.refresh();
	}
	
	Class.recommandMySpot = function() {
		var cnt = Kokorahen.recommand();
		alert(cnt+"件のマイスポット登録が予約されました。登録完了まで時間がかかる場合があります。");
	}


});
