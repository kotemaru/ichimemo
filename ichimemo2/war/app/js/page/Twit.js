Page.def(function Twit(){}, function closure(Class){
	
	var current = {
		review: null
	};
	var spotBrief ;

	Class.onPageCreate = function() {
		LIST_ITEM = $("#reviewListItem").html();
		spotBrief = new SpotBrief().init(Class.PAGE);
	}
	
	Class.go = function(id) {
		var $page = $(Class.PAGE);
		current.review = Review.getReview(id);
		//Util.procIf(Class.PAGE, function(c){return eval(c)});
		Util.changePage(Class.ID);
	}
	
	Class.getReview = function(id) {
		if (memcache[id]) return memcache[id];
		memcache[id] =  Kokorahen.getReview(id);
		return memcache[id];
	}
	Class.setReview = function(data) {
		memcache[data.id] = data;
	}
	
	Class.onBeforeShow = function() {
		if (current.review == null) return;
		var data = current.review;
		var spot = Spot.getSpotForId(data.spotId);
		spotBrief.setSpot(spot);
	
		var $page = $(Class.PAGE);
	
		$page.find(".Comment").text(data.comment);
	
		Util.setNavbar(Class.PAGE);
	}
	
	Class.moreUser = function() {
		UserTL.go(current.review.userId);
	}
	
	Class.moreSpot = function() {
		SpotTL.go(current.review.spotId);
	}
	
});