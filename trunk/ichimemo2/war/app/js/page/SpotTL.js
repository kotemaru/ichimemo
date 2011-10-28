
Page.def(function SpotTL(){}, function(Class){
	
	var ONLY = "input[name='SpotTL-only']";
	var LIST_DIV = null;
	var LIST_ITEM = null;
	var currentSpotId = null;
	var spotBrief = null;
	
	
	Class.init = function() {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".ReviewList")[0];
		LIST_ITEM = $page.find(".ReviewList ul").html();
		spotBrief = new SpotBrief().init(Class.PAGE);
		
		$(Class.PAGE).find(ONLY).change(function(ev) {
			Class.load(currentSpotId);
		});
	
	}
	
	Class.go = function(spotId){
		currentSpotId = spotId;
		Util.changePage(Class.ID);
	}
	
	Class.onBeforeShow = function(ev, info){
		var spot = Spot.getSpotForId(currentSpotId);
		spotBrief.setSpot(spot);
	
		var $brief = $(Class.PAGE).find(".SpotBrief");
		$brief.find(".Appraise").text(spot.data.appraise);
	
		Class.load(currentSpotId);
		Util.setNavbar(Class.PAGE);
	}
	Class.load = function(spotId) {
		var follows = null;
		var only = $(Class.PAGE).find(ONLY).filter(':checked').val();
		if (only == "follow") {
			follows = Login.user.follows;
		}
		
		$(LIST_DIV).html("Please wait...");
		Kokorahen.listReviewAsync({
			success: function(list) {
				Review.makeList(LIST_DIV, null, list);
				Util.setNavbar(Class.PAGE);
			}
		}, spotId, follows);
	}
	
	
	Class.newReview = function() {
		ReviewInput.go(undefined, currentSpotId);
	}
	Class.newTwit = function() {
		TwitInput.go(undefined, currentSpotId);
	}
	Class.goMemo = function() {
		MemoInput.go(currentSpotId);
	}
	Class.goMySpot = function() {
		MySpotInput.go(currentSpotId);
	}

});
