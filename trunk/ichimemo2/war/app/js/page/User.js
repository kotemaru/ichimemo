var User = Page.def(function User(){}, function(Class){

Class.LIST_DIV = null;
Class.LIST_ITEM = null;
Class.LIMIT = 30;
Class.all = {};

Class.init = function()  {
	var $page = $(Class.PAGE)
	Class.LIST_DIV = $page.find(".ReviewList")[0];
	Class.LIST_ITEM = $page.find(".ReviewList ul").html();
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
	$(Class.LIST_DIV).html("");
	Kokorahen.listTimelineAsync({
		success: function(list) {
			Review.makeList(Class.LIST_DIV, null, list);
		}
	}, {userId:userId, limit:Class.LIMIT});
}


Class.setDefaultPhoto = function(img)  {
	img.src = "/images/user.png";
}

Class.getUser = function(userId) {
	if (Class.all[userId] != null) return Class.all[userId];
	var user = Kokorahen.getUserModelPublic(userId);
	Class.all[userId] = user;
	return user;
}

});