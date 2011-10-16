var TwitInput = Page.def(function TwitInput(){}, function(Class){


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
				nickname: Login.user.nickname, isNewReview:true
		};
	} else {
		Class.current = Review.getReview(id);
	}

	$(document.twit.comment).val(Class.current.comment);
	Util.changePage(Class.ID);
}



Class.onBeforeShow = function() {
	var spot = Spot.getSpotForId(Class.current.spotId);
	Class.spotBrief.setSpot(spot);
	Util.setNavbar(Class.PAGE);
}

Class.write = function() {
	var params = {};
	var elems = document.twit.elements;
	for (var i=0; i<elems.length; i++) {
		params[elems[i].name] = elems[i].value;
	}
	var sd = Spot.getSpotForId(Class.current.spotId).data;

	params.appraise = -1.0;
	params.spotId = sd.id;
	params.spotName = sd.name;
	params.lat = sd.lat;
	params.lng = sd.lng;
	params.tags = sd.tags;
	//params.photoUrl = $(Class.PAGE).find(".ReviewPhoto").attr("src");
	//if (params.photoUrl.match(/^[/]images/)) params.photoUrl = null;

	var id = Kokorahen.writeReview(params);
	alert("つぶやきました。("+id+")");
	Timeline.go();
}

});