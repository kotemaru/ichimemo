var UserConf = Page.def(function UserConf(){}, function(Class){

Class.LIST_ID = "#userFollowList";
Class.PHOTO = "#userConfPhoto";

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
	form.autoTwit.selectedIndex = Login.user.autoTwit ? 1 : 0;
	Class.getThumbnailImg().attr("src", Login.user.photoUrl);

	Util.changePage(Class.ID);
}

Class.makeList = function()  {
	var list = Login.user.follows;
	var div = $(Class.LIST_ID);
	if (list == null || list.length == 0) {
		div.html("フォローユーザはいません。");
		return;
	}

	var ul = $('<ul data-role="listview" data-inset="true" ></ul>');
	div.html("");
	div.append(ul);
	
	for (var i=0; i<list.length; i++) {
		ul.append($(Class.getListItem(list[i])));
	}
	//jqt.setPageHeight();
	ul.listview();
}

Class.onBeforeShow = function() {
	Class.makeList();
	var form = document.userConf;
	$(form.autoTwit).slider("refresh");
	Util.setNavbar(Class.PAGE);
}


Class.write = function() {
	var form = document.userConf;
	Login.user.googleUser = form.googleUser.value;
	Login.user.twitterUser = form.twitterUser.value;
	Login.user.nickname = form.nickname.value;
	Login.user.autoTwit = (form.autoTwit.selectedIndex != 0);
	Login.user.comment = form.comment.value;

	var photo =  Class.getThumbnailImg().attr("src");
	if (photo != null && photo.match(/^[/]images/)) {
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

Class.getListItem = function(userId) {
	var nickname = Login.user.followsNickname[userId];
	var html =
"<li><a href='javascript:UserTL.go("+userId+")'"
+">"+nickname+"</a></li>";
	return html;
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

});
