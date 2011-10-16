var ReviewInput = Page.def(function ReviewInput(){}, function(Class){


Class.all = {};
Class.current = null;
Class.spotBrief = null;

Class.init = function() {
	Class.spotBrief = new SpotBrief().init(Class.PAGE);
}

Class.go = function(id, spotId) {
	if (id === undefined) {
		Class.current = {
				id: "", spotId: spotId, appraise: 3, comment: "",
				nickname: Login.user.nickname, isNewReview:true,
				photoUrl: "/images/noimage.gif"
		};
	} else {
		Class.current = Review.getReview(id);
	}

	Class.onFaceClick(Class.current.appraise);
	$(Class.PAGE).find(".ReviewPhoto").attr("src",Class.current.photoUrl);
	$(document.review.comment).val(Class.current.comment);
	
	Util.changePage(Class.ID);
}



Class.onBeforeShow = function() {
	var spot = Spot.getSpotForId(Class.current.spotId);
	Class.spotBrief.setSpot(spot);
	Util.setNavbar(Class.PAGE);
}

Class.addFollow = function() {
	UserConf.addFollow(Class.current.userId);
}
Class.onFaceClick = function(n) {
	var $page = $(Class.PAGE);
	var faces = $page.find("img.FaceMark");
	for (var i=0; i<faces.length; i++) {
		$(faces[i]).width(16);
	}
	if (n>0) $(faces[n-1]).width(32);
	$page.find(".FaceMarkText").text(Review.FACE_MARK_TEXT[n]);
	$page.find("form")[0].appraise.value = n;
}

Class.write = function() {
	var params = {};
	var elems = document.review.elements;
	for (var i=0; i<elems.length; i++) {
		params[elems[i].name] = elems[i].value;
	}
	var sd = Spot.getSpotForId(Class.current.spotId).data;

	params.spotId = sd.id;
	params.spotName = sd.name;
	params.lat = sd.lat;
	params.lng = sd.lng;
	params.tags = sd.tags;
	params.photoUrl = $(Class.PAGE).find(".ReviewPhoto").attr("src");
	if (params.photoUrl.match(/^[/]images/)) params.photoUrl = null;

	var id = Kokorahen.writeReview(params);
	alert("レビュー登録しました。("+id+")");
	Timeline.go();
}

});