Page.def(function MergeSpot(){}, function(Class){
	
	var ACTIVE_BTN = "ui-btn-active";
	var LIST_DIV ;
	var LIST_ITEM ;
	var LIMIT = 20;
	var targetSpot;
	var distSpot;
	var spotBrief1;
	var spotBrief2;

	Class.init = function(){
		var $page = $(Class.PAGE);
		LIST_ITEM = $page.find(".SpotList ul").html();
	}

	Class.onPageCreate = function()  {
		var $page = $(Class.PAGE);
		LIST_DIV = $page.find(".SpotList")[0];
		spotBrief1 = new SpotBrief().init($page.find(".SB1")[0]);
		spotBrief2 = new SpotBrief().init($page.find(".SB2")[0]);

 	}
	Class.go = function(spot){
		targetSpot = spot;
		distSpot = null;
		Util.changePage(Class.ID);
	}
	Class.onBeforeShow = function() {
		spotBrief1.setSpot(targetSpot);
		spotBrief2.setSpot(distSpot);
		load();
	}

	function load() {
		//Util.procIf(Class.PAGE, function(c){return eval(c)});

		var div = $(LIST_DIV);
		div.html("Please wait...");

		var params =  {
			general: true,
			limit: LIMIT,
			lat : targetSpot.data.lat,
			lng : targetSpot.data.lng,
		};
		Kokorahen.listNearSpotAsync(onloadGetSpots, params);
	}
	
	var onloadGetSpots = {
		success: function(list, args){
			var spots = raw2spot(list);			
			List.listview(spots, LIST_DIV, LIST_ITEM);
			Util.setNavbar(Class.PAGE);
		}
	}
	function raw2spot(list) {
		var curPos = Map.getPosition();
		var spots = [];
		for (var i=0; i<list.length; i++) {
			if (list[i].id == targetSpot.data.id) continue;
			
			var spot = Spot.newSpot(list[i]);
			spot._distance =
				Util.compDistance(curPos, spot.marker.getPosition());
			spots.push(spot);
		}
		return spots;
	}
	
	Class.onItemClick = function(spotId) {
		distSpot = Spot.getSpotForId(spotId);
		spotBrief2.setSpot(distSpot);
	}
	Class.doMerge = function(spotId) {
		if (distSpot == null) {
			alert("統合先を指定して下さい。");
			return;
		}

		Kokorahen.mergeSpot(targetSpot.data.id, distSpot.data.id);
		alert("統合しました。");
		List.go();
	}

});

