Page.def(function MemoInput(){}, function(Class){

	Class.spotId = null;
	Class.spotBrief = null;
	
	Class.onPageCreate = function() {
		var $page = $(Class.PAGE);
		Class.LIST_DIV = $page.find(".ReviewList")[0];
		Class.spotBrief = new SpotBrief().init(Class.PAGE);
	}
	
	Class.go = function(spotId) {
		var $page = $(Class.PAGE);
		Class.spotId = spotId;
		var spot = Spot.getSpotForId(spotId);

		if (spot == null || spot.data.myMemo == null) {
			$page.find(".Comment").val("");
		} else {
			$page.find(".Comment").val(spot.data.myMemo);
		}
		
		if (spot != null) {
			var data = spot.data;
			var tags = (data.myTags==null) ? data.tags : data.myTags;
			SpotTags.setValue(SpotTags.MYSPOT, tags);
			SpotTags.setLabel($page.find(".tags"), tags, "ジャンル選択(複数可)");
		}
		Util.changePage(Class.ID);
	}
	
	Class.onBeforeShow = function() {
		var spot = Spot.getSpotForId(Class.spotId);
		Class.spotBrief.setSpot(spot);
		Util.setNavbar(Class.PAGE);
	}
	
	Class.write = function() {
		var $page = $(Class.PAGE);
		var params = {};
		params.spotId = Class.spotId;
		params.tags = SpotTags.getValue(SpotTags.MYSPOT);
		params.comment = $page.find(".Comment").val();
		
		var id = Kokorahen.writeMemo(params);
		alert("memo id="+id);
	}

});