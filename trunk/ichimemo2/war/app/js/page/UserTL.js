var UserTL = Page.def(function UserTL(){}, function(Class){

Class.LIST_DIV = null;
Class.LIST_ITEM = null;
Class.LIMIT = 30;
Class.all = {};
Class.current = null;

Class.init = function()  {
	var $page = $(Class.PAGE)
	Class.LIST_DIV = $page.find(".ReviewList")[0];
	Class.LIST_ITEM = $page.find(".ReviewList ul").html();
	$page.find(".Search").live('keypress', function(ev){
		if (ev.which === 13) {
			Class.onBeforeShow();
		}
	});
}

Class.go = function(userId){
	Class.current = User.getUser(userId);
	Util.changePage(Class.ID);
}

Class.onBeforeShow = function() {
	Util.setNavbar(Class.ID);

	var user = Class.current;
	if (user == null) return;
	var $page = $(Class.PAGE);
	var $brief = $page.find(".UserBrief");
	$brief.find(".Thumbnail").attr("src", Util.correctImg(user.photoUrl));
	$brief.find(".Title").text(user.nickname);
	var email = user.twitterUser 
		? user.twitterUser : user.googleUser;
	$brief.find(".SubTitle").text(email);
	
	$page.find(".Comment").val(user.comment);
	Util.correntTextarea($page.find(".Comment"));
	
	if (Login.user.follows.indexOf(user.userId) >= 0) {
		$page.find(".AddFollow").hide();
		$page.find(".DelFollow").show();
	} else {
		$page.find(".AddFollow").show();
		$page.find(".DelFollow").hide();
	}
	Class.load(user.userId);
}

Class.load = function(userId) {
	$(Class.LIST_DIV).html("");
	var search = $(Class.PAGE).find(".Search").val();
	Kokorahen.listTimelineAsync({
		success: function(list) {
			Review.makeList(Class.LIST_DIV, null, list);
			Util.setNavbar(Class.PAGE);
		}
	}, {userId:userId, limit:Class.LIMIT, search:search});
}

Class.setDefaultPhoto = function(img)  {
	img.src = "/images/user.png";
}
Class.addFollow = function() {
	UserConf.addFollow(UserTL.current.userId);
	Class.onBeforeShow();
}
Class.delFollow = function() {
	UserConf.delFollow(UserTL.current.userId);
	Class.onBeforeShow();
}



});