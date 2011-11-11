Page.def(function UserTL(){}, function(Class){
	
	var LIST_DIV ;
	var LIST_ITEM ;
	var LIMIT = 20;
	var currentUser ;
	
	Class.onPageCreate = function()  {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".ReviewList")[0];
		LIST_ITEM = $page.find(".ReviewList ul").html();
		$page.find(".Search").live('keypress', function(ev){
			if (ev.which === 13) {
				Class.onBeforeShow();
			}
		});
	}
	
	Class.go = function(userId){
		currentUser = User.getUser(userId);
		Util.changePage(Class.ID);
	}
	
	Class.onBeforeShow = function() {
		Util.setNavbar(Class.ID);
	
		var user = currentUser;
		if (user == null) return;
		var $page = $(Class.PAGE);
		var $brief = $page.find(".UserBrief");
		$brief.find(".Thumbnail").attr("src", Util.correctImg(user.photoUrl));
		$brief.find(".Title").text(user.nickname);
		var email = user.twitterUser 
			? user.twitterUser : user.googleUser;
		$brief.find(".SubTitle").text(email);
		
		//$page.find(".Comment").val(user.comment);
		$page.find(".Comment").text("無し");
		$page.find(".Comment").text(user.comment);
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
		$(LIST_DIV).html("Please wait...");
		var search = $(Class.PAGE).find(".Search").val();
		Kokorahen.listTimelineAsync({
			success: function(list) {
				Review.makeList(LIST_DIV, null, list);
				Util.setNavbar(Class.PAGE);
			}
		}, {userId:userId, genre:Genre.getGenre(), limit:LIMIT, search:search});
	}
	
	Class.setDefaultPhoto = function(img)  {
		img.src = "/images/user.png";
	}
	Class.addFollow = function() {
		UserConf.addFollow(currentUser.userId);
		Class.onBeforeShow();
	}
	Class.delFollow = function() {
		UserConf.delFollow(currentUser.userId);
		Class.onBeforeShow();
	}
	


});