Page.def(function User(){}, function(Class){
	
	var LIST_DIV = null;
	var LIST_ITEM = null;
	var LIMIT = 30;
	var memcache = {};
	
	Class.init = function()  {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".ReviewList")[0];
		LIST_ITEM = $page.find(".ReviewList ul").html();
	}
	Class.onBeforeShow = function() {
		Util.setNavbar(Class.ID);
	
		if (Login.user == null) return;
		var $brief = $(Class.PAGE).find(".UserBrief");
		$brief.find(".Thumbnail img").attr("src", Util.correctImg(Login.user.photoUrl));
		$brief.find(".Title").text(Login.user.nickname);
		var email = Login.user.twitterUser 
			? Login.user.twitterUser : Login.user.googleUser;
		$brief.find(".SubTitle").text(email);
	
		Class.load(Login.user.userId);
	}
	
	Class.load = function(userId) {
		$(LIST_DIV).html("Please wait...");
		Kokorahen.listTimelineAsync({
			success: function(list) {
				Review.makeList(LIST_DIV, null, list);
				Util.setNavbar(Class.PAGE);
			}
		}, {userId:userId, limit:LIMIT});
	}
	
	
	Class.setDefaultPhoto = function(img)  {
		img.src = "/images/user.png";
	}
	
	Class.getUser = function(userId) {
		if (memcache[userId] != null) return memcache[userId];
		var user = Kokorahen.getUserModelPublic(userId);
		memcache[userId] = user;
		return user;
	}

});