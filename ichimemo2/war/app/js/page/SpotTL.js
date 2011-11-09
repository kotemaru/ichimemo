
Page.def(function SpotTL(){}, function(Class){
	
	var LIST_DIV = null;
	var LIST_ITEM = null;
	var currentSpotId = null;
	var spotBrief = null;
	var radioOnly = null;
	
	Class.init = function() {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".ReviewList")[0];
		LIST_ITEM = $page.find(".ReviewList ul").html();
		spotBrief = new SpotBrief().init(Class.PAGE);
		radioOnly = new Radio($page.find(".Only"),function(ev) {
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
		radioOnly.refresh();
		Util.setNavbar(Class.PAGE);
	}
	Class.load = function(spotId) {
		var follows = null;
		var only = radioOnly.getValue();
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
		ReviewInput.go(undefined, currentSpotId, true);
	}
	Class.newTodo = function() {
		ReviewInput.go(undefined, currentSpotId, false);
	}
	Class.newTwit = function() {
		TwitInput.go(undefined, currentSpotId);
	}
	Class.goMemo = function() {
		MemoInput.go(currentSpotId);
	}
	Class.checkIn = function() {
		// TODO:checkIn
	}
	Class.goMap = function() {
		var spot = Spot.getSpotForId(currentSpotId);
		//Map.setCenter(spot.marker.getPosition(), 17);
		//Map.go();
		MapDialog.go(spot.marker.getPosition());
	}

});
