var List = Page.def(function List(){}, function(Class){

Class.LIST_DIV = null;
Class.LIST_ITEM = null;
Class.RADIUS = "input[name='radius']";
Class.SORT = "input[name='sort']";

Class.init = function()  {
	var $page = $(Class.PAGE)
	Class.LIST_DIV = $page.find(".SpotList")[0];
	Class.LIST_ITEM = $page.find(".SpotList ul").html();
	$page.find(".Search").live('keypress', function(ev){
		if (ev.which === 13) {
			Class.load();
		}
	});
	$page.find(".Search").live('blur', Class.load);

	$(Class.PAGE).find(Class.RADIUS).change(function(ev) {
		Class.load();
	});
	$(Class.PAGE).find(Class.SORT).change(function(ev) {
		Class.load();
	});

}

Class.load = function() {
	var div = $(Class.LIST_DIV);
	div.html("Please wait...");
	
	var curPos = Map.marker.getPosition();
	var sort = $(Class.PAGE).find(Class.SORT).filter(':checked').val();

	if (sort == "appraise") {
		$(Class.PAGE).find(".Radius").show();
		var range = $(Class.PAGE).find(Class.RADIUS).filter(':checked').val()/100;
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
		Kokorahen.listNearSpotAsync(Class.onloadGetSpots,
			curPos.lat(),curPos.lng(),Spot.LIMIT);
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
	Class.load();
	Util.setNavbar(Class.ID);
}

Class.listview = function(spots) {
	var div = $(Class.LIST_DIV);

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
	var appraise = Math.floor(data.appraise);
	if (appraise<0) appraise = 0;
	var photo = data.image;
	if (photo == null || photo == "") photo = "/images/noimage.gif";

	var html = Class.LIST_ITEM
	.replace(/[$][{]id[}]/g, data.id)
	.replace(/[$][{]photo[}]/g, photo)
	.replace(/[$][{]name[}]/g, data.name)
	.replace(/[$][{]address[}]/g, data.address)
	.replace(/[$][{]appraise[}]/g, appraise)
	.replace(/[$][{]distance[}]/g, Math.floor(spot._distance));
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

