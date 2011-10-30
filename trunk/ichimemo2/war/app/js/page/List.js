Page.def(function List(){}, function(Class){
	
	var ACTIVE_BTN = "ui-btn-active";
	var LIST_DIV = null;
	var LIST_ITEM = null;
	var sortMode = "near";
	var radius = "5";
	var radioSort = null;
	var radioRadius = null;

	Class.init = function()  {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".SpotList")[0];
		LIST_ITEM = $page.find(".SpotList ul").html();
		$page.find(".Search").live('keypress', function(ev){
			if (ev.which === 13) {
				load();
			}
		});
		$page.find(".Search").live('blur', load);

		//$page.find(".Sort").find("a[value='"+sortMode+"']").addClass(ACTIVE_BTN);
		radioSort = new Radio($page.find(".Sort")[0],
			["near","appraise"],
			["&nbsp;周辺&nbsp;","高評価"],
			{default:"near", callback:load}
		);
		radioRadius = new Radio($page.find(".Radius")[0],
			[1,3,5,10,30],
			["1Km","3Km","5Km","10Km","30Km"],
			{default:5, callback:load}
		);
	}
	

	function load() {
		var div = $(LIST_DIV);
		div.html("Please wait...");
		
		var curPos = Map.marker.getPosition();
		var sort = radioSort.getValue();

		if (sort == "appraise") {
			$(Class.PAGE).find(".Radius").show();
			var range = radioRadius.getValue()/100;
			var params =  {
				tag: SpotTags.getSearchTag(), 
				limit: Spot.LIMIT,
				latMin : curPos.lat()-range,
				lngMin : curPos.lng()-range,
				latMax : curPos.lat()+range,
				lngMax : curPos.lng()+range,
				search : $(Class.PAGE).find(".Search").val()
			};
			params.areas = Class.getAreas(params);
			Kokorahen.listMySpotAsync(Class.onloadGetSpots, params);
			//Kokorahen.getSpotsAsync(Class.onloadGetSpots, params);
		} else { // near
			$(Class.PAGE).find(".Radius").hide();
			var params =  {
					tag: SpotTags.getSearchTag(), 
					limit: Spot.LIMIT,
					lat : curPos.lat(),
					lng : curPos.lng(),
					search : $(Class.PAGE).find(".Search").val()
				};
			Kokorahen.listNearSpotAsync(Class.onloadGetSpots, params);
		}
	}
	
	Class.onloadGetSpots = {
		success: function(list, args){
			var curPos = Map.marker.getPosition();
			var spots = [];
			for (var i=0; i<list.length; i++) {
				var spot = Spot.getSpot(list[i]);
				spot._distance =
					Util.compDistance(curPos, spot.marker.getPosition());
				spots.push(Spot.getSpot(list[i]));
			}
			
			//spots.sort(function(a,b){
			//	if (a._distance == b._distance) return 0;
			//	return (a._distance > b._distance) ? 1 : -1;
			//});
			Class.listview(spots);
			Util.setNavbar(Class.PAGE);
		}
	}
	
	Class.onBeforeShow = function() {
		Map.onTagChange();
		load();
		radioSort.refresh();
		radioRadius.refresh();
		Util.setNavbar(Class.ID);
	}

	Class.listview = function(spots) {
		var div = $(LIST_DIV);
	
		if (spots.length == 0) {
			div.html("周辺にSpotは有りません。");
			return;
		}
		
		var ul = $('<ul data-role="listview" data-inset="true" ></ul>');
		div.html("");
		div.append(ul);
	
		for (var i=0; i<spots.length; i++) {
			ul.append(Class.getListItem(spots[i]));
		}
		
		//jqt.setPageHeight();
		ul.listview();
	}
	Class.getListItem = function(spot) {
		var data = spot.data;
		var appraise = 
			Math.floor(data.myAppraise ? data.myAppraise : data.appraise);
		if (appraise<0) appraise = 0;
		var photo = data.image;
		if (photo == null || photo == "") photo = "/images/noimage.gif";
	
		var star = data.checked ? "/images/star.png" : "/images/star-blue.png";
		var html = LIST_ITEM
		.replace(/[$][{]id[}]/g, data.id)
		.replace(/[$][{]photo[}]/g, photo)
		.replace(/[$][{]name[}]/g, data.name)
		.replace(/[$][{]address[}]/g, data.address)
		.replace(/[$][{]appraise[}]/g, appraise)
		.replace(/[$][{]distance[}]/g, Math.floor(spot._distance))
		.replace(/[$][{]MySpotMark[}]/g, (data.myAppraise ? "MySpotMark":"Hide"))
		.replace(/[$][{]mySpotMark[}]/g, star)
		;
		return html;
	}
	
	Class.onItemClick = function(id) {
		SpotTL.go(id);
	}
	
	Class.getAreas = function(params, range){
		var latMin = params.latMin;
		var lngMin = params.lngMin;
		var latMax = params.latMax;
		var lngMax = params.lngMax;
		
		
		if (undefined === range) {
			var w = lngMax - lngMin;
			range = 0;
			for (var i=1; i<Spot.AREA_RANGE.length; i++) {
				if (w < Spot.AREA_RANGE[i].width) range = i;
			}
		}
	
		var list = [];
		var mode = Spot.AREA_RANGE[range].mode;
		var len = Spot.AREA_RANGE[range].len;
		
		latMin = Math.floor(latMin*mode);
		lngMin = Math.floor(lngMin*mode);
		latMax = Math.floor(latMax*mode);
		lngMax = Math.floor(lngMax*mode);
	
		for (var lat = latMin; lat<=latMax; lat+=1) {
			for (var lng = lngMin; lng<=lngMax; lng+=1) {
				var area =
					Util.toZeroPrefix((lat/mode),len)+","+
					Util.toZeroPrefix((lng/mode),len);
				list.push(area);
				if (list.length>100) return list;
			}
		}
		return list;
		
	}

});

