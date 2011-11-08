Page.def(function ExistSpot(){}, function(Class){
	
	var LIST_DIV;
	var LIST_ITEM;
	var address;
	var spots;

	Class.init = function()  {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".SpotList")[0];
		LIST_ITEM = $page.find(".SpotList ul").html();
	}
	Class.go = function(addr, list) {
		adress = addr;
		spots = raw2spot(list);			
		Util.dialog(Class.ID);
	}
	function raw2spot(list) {
		var curPos = Map.getPosition();
		var spots = [];
		for (var i=0; i<list.length; i++) {
			var spot = Spot.newSpot(list[i]);
			spot._distance = 0;
			spots.push(spot);
		}
		return spots;
	}

	Class.onBeforeShow = function() {
		List.listview(spots, LIST_DIV, LIST_ITEM);
	}
	Class.onItemClick = function(id) {
		SpotInfo.go(id);
	}

});

