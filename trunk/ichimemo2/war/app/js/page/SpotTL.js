var SpotTL = Page.def(function SpotTL(){}, function(Class){

Class.ONLY = "input[name='SpotTL-only']";
Class.LIST_DIV = null;
Class.LIST_ITEM = null;
Class.spotId = null;
Class.current = null;
Class.spotBrief = null;


Class.init = function() {
	var $page = $(Class.PAGE)
	Class.LIST_DIV = $page.find(".ReviewList")[0];
	Class.LIST_ITEM = $page.find(".ReviewList ul").html();
	Class.spotBrief = new SpotBrief().init(Class.PAGE);
	
	$(Class.PAGE).find(Class.ONLY).change(function(ev) {
		Class.load(Class.current.data.id);
	});

}

Class.go = function(spotId){
	Class.current = Spot.getSpotForId(spotId);
	Util.changePage(Class.ID);
}

Class.onBeforeShow = function(ev, info){
	Class.spotBrief.setSpot(Class.current);

	var $brief = $(Class.PAGE).find(".SpotBrief");
	$brief.find(".Appraise").text(Class.current.data.appraise);

	Class.load(Class.current.data.id);
	Util.setNavbar(Class.PAGE);
}
Class.load = function(spotId) {
	var follows = null;
	var only = $(Class.PAGE).find(Class.ONLY).filter(':checked').val();
	if (only == "follow") {
		follows = Login.user.follows;
	}
	
	$(Class.LIST_DIV).html("Please wait...");
	Kokorahen.listReviewAsync({
		success: function(list) {
			Review.makeList(Class.LIST_DIV, null, list);
			Util.setNavbar(Class.PAGE);
		}
	}, spotId, follows);
}


Class.newReview = function() {
	ReviewInput.go(undefined, Class.current.data.id);
}
Class.newTwit = function() {
	TwitInput.go(undefined, Class.current.data.id);
}
Class.goMemo = function() {
	MemoInput.go(Class.current.data.id);
}

});
