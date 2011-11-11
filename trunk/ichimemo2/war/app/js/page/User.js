Page.def(function User(){}, function(Class){
	
	var LIST_DIV ;
	var LIST_ITEM ;
	var	FOLLOWS_DIV ;
	var LIMIT = 20;
	var memcache = {};
	var listMode = 'review'
	
	Class.onPageCreate = function()  {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".ReviewList")[0];
		LIST_ITEM = $page.find(".ReviewList ul").html();
		FOLLOWS_DIV = $page.find(".FollowList")[0];
	}
	Class.onBeforeShow = function() {
	
		if (Login.user == null) return;
		var $brief = $(Class.PAGE).find(".UserBrief");
		$brief.find(".Thumbnail img").attr("src", Util.correctImg(Login.user.photoUrl));
		$brief.find(".Title").text(Login.user.nickname);
		var email = Login.user.twitterUser 
			? Login.user.twitterUser : Login.user.googleUser;
		$brief.find(".SubTitle").text(email);
	
		loadReview(Login.user.userId);
		loadFollow();
		Class.showList(listMode);
		Util.setNavbar(Class.ID);
	}
	
	function loadReview(userId) {
		$(LIST_DIV).html("Please wait...");
		Kokorahen.listTimelineAsync({
			success: function(list) {
				Review.makeList(LIST_DIV, null, list);
				Util.setNavbar(Class.PAGE);
			}
		}, {userId:userId, genre:Genre.getGenre(), limit:LIMIT});
	}
	function loadFollow()  {
		var list = Login.user.follows;
		var div = $(FOLLOWS_DIV);
		if (list == null || list.length == 0) {
			div.html("フォローユーザはいません。");
			return;
		}
	
		var ul = $('<ul data-role="listview" data-inset="true" ></ul>');
		div.html("");
		div.append(ul);
		
		for (var i=0; i<list.length; i++) {
			ul.append($(getFollowListItem(list[i])));
		}
		ul.listview();
	}
	function getFollowListItem(userId) {
		var nickname = Login.user.followsNickname[userId];
		var html =
			"<li><a href='javascript:UserTL.go("+userId+")'"
			+">"+nickname+"</a></li>";
		return html;
	}

	Class.showList = function(mode) {
		listMode = mode;
		Util.procIf(Class.PAGE, function(c){return eval(c)});
		Util.setNavbar(Class.ID);
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