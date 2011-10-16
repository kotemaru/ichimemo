var Review = Page.def(function Review(){}, function(Class){

Class.all = {};
Class.current = null;
Class.FACE_MARK_TEXT = [
	"未",
	"まずい",
	"いまいち",
	"ふつう",
	"うまい",
	"めちゃうまー",
];
Class.LIST_ITEM = null;
Class.spotBrief = null;

Class.init = function() {
	Class.LIST_ITEM = $("#reviewListItem").html();
	Class.spotBrief = new SpotBrief().init(Class.PAGE);
}

Class.go = function(id) {
	Class.current = Class.getReview(id);
	Util.changePage(Class.ID);
}

Class.getReview = function(id) {
	if (Class.all[id]) return Class.all[id];
	Class.all[id] =  Kokorahen.getReview(id);
	return Class.all[id];
}
Class.setReview = function(data) {
	Review.all[data.id] = data;
}

Class.onBeforeShow = function() {
	if (Class.current == null) return;
	var data = Class.current;
	var spot = Spot.getSpotForId(data.spotId);
	Class.spotBrief.setSpot(spot);

	var appraise = Math.floor(data.appraise);
	var $page = $(Class.PAGE);

	$page.find(".ThumbnailL").attr("src", data.photoUrl);
	$page.find(".FaceMark").attr("src", "/images/face-"+appraise+".png");
	$page.find(".FaceMarkText").text(Class.FACE_MARK_TEXT[appraise]);
	$page.find(".Comment").text(data.comment);

	Util.setNavbar(Class.PAGE);
}

Class.makeList = function(tgt, html, list) {
	var div = $(tgt)
	if (html == null) html = Class.LIST_ITEM;
	if (list.length == 0) {
		div.html("まだレビューはありません。");
		return;
	}

	var ul = $('<ul data-role="listview" data-inset="true" ></ul>');
	div.html("");
	div.append(ul);
	
	for (var i=0; i<list.length; i++) {
		Class.setReview(list[i]);
		ul.append($(Review.getListItem(html,list[i])));
	}
	ul.listview();
}
Class.getListItem = function(html, data) {
	var appraise = Math.floor(data.appraise);
	if (appraise<0) appraise = 0;
	var photo = data.photoUrl;
	if (photo == null || photo == "") photo = "/images/noimage.gif";

	html = html.replace(/[$][{]id[}]/g, data.id)
		.replace(/[$][{]photo[}]/g, photo)
		.replace(/[$][{]appraise[}]/g, appraise)
		.replace(/[$][{]nickname[}]/g, data.nickname)
		.replace(/[$][{]spotname[}]/g, data.spotName)
		.replace(/[$][{]comment[}]/g, data.comment);
	return html;
}

Class.moreUser = function() {
	UserTL.go(Class.current.userId);
}

Class.moreSpot = function() {
	SpotTL.go(Class.current.spotId);
}
});