Page.def(function TwitInput(){}, function(Class){

	var LIST_DIV = null;
	var LIST_ITEM = null;
	var LIMIT = 30;
	
	var current = {
			review: null,
	};
	var spotBrief = null;

	Class.init = function() {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".ReviewList")[0];
		LIST_ITEM = $page.find(".ReviewList ul").html();
		
		spotBrief = new SpotBrief().init(Class.PAGE);
	}
	
	Class.go = function(id, spotId) {
		if (id === undefined) {
			current.review = {
					id: "", spotId: spotId, appraise: 3, comment: "",
					nickname: Login.user.nickname, isNewReview:true
			};
		} else {
			current.review = Review.getReview(id);
		}
	
		$(Class.PAGE).find(".Comment").val(current.review.comment);
		Util.changePage(Class.ID);
	}
	
	
	
	Class.onBeforeShow = function() {
		var spot = Spot.getSpotForId(current.review.spotId);
		spotBrief.setSpot(spot);
		reload();
		Util.setNavbar(Class.PAGE);
	}
	
	Class.write = function() {
		var sd = Spot.getSpotForId(current.review.spotId).data;
		var params = {};
		params.appraise = -1.0;
		params.spotId = sd.id;
		params.spotName = sd.name;
		params.lat = sd.lat;
		params.lng = sd.lng;
		params.tags = sd.tags;
		params.comment = $(Class.PAGE).find(".Comment").val();
		params.checked = false;
		params.twit = true;
	
		var id = Kokorahen.writeReview(params);
		alert("つぶやきました。("+id+")");
		Map.clear();
		Timeline.clear();
		Timeline.go();
	}
	
	function reload() {
		$(LIST_DIV).html("Please wait...");
	
		Kokorahen.listTimelineAsync({
			success: function(list) {
				Review.makeList(LIST_DIV, null, list);
				Util.setNavbar(Class.PAGE);
			}
		}, Login.user.userId, current.review.spotId, LIMIT);
	}

});