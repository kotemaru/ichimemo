Module.def(window, function Util(){}, function(Class) {

Class.navbar = $("#navbar")[0];

(function() {
	//$.mobile.navbar(Class.navbar); 
	$("#navbar a").live('click', function(){
		$("a",Class.navbar).removeClass("ui-btn-active");
		$(this).addClass("ui-btn-active");
	})
})();

Class.compDistance = google.maps.geometry.spherical.computeDistanceBetween;
Class.spotDistance = function(spot) {
	var curPos = Map.marker.getPosition();
	return Math.floor(Class.compDistance(curPos, spot.marker.getPosition()));
}

Class.setNavbar = function(id) {
	// TODO: JQMがβのせいかFooterの共有が出来ないので自前で対処。
	$(id).find("div[data-role='footer']").append(Class.navbar);
	if ("string" === typeof id) {
		var $navbar = $(Class.navbar);
		$navbar.find("a").removeClass("ui-btn-active");
		$navbar.find("a[href='"+id+"']").addClass("ui-btn-active");
	}
	
	$.mobile.silentScroll(0);
}

Class.changePage = function(id) {
	var title = $.mobile.activePage.find("h1").text();

	$.mobile.showPageLoadingMsg();
	setTimeout(function(){
		//jqt.goTo(Spot.ID, "slideleft");
		$.mobile.changePage(id, "slide");
		$.mobile.activePage.find("a[data-icon='back'] .ui-btn-text").text(title);
	},100);
}
Class.backPage = function() {
	$.mobile.showPageLoadingMsg();
	setTimeout(function(){
		history.back();
	},100);
}
Class.dialog = function(id) {
	$.mobile.showPageLoadingMsg();
	Class.dialogOwner = $.mobile.activePage[0];
	Class.currentScrollTop = $(document.body).scrollTop()
	setTimeout(function(){
		$.mobile.changePage(id, "pop");
	},100);
}
Class.dialogFinally = function(id) {
	if (Class.dialogOwner == $.mobile.activePage[0]) {
		$.mobile.silentScroll(Class.currentScrollTop);
	}
	Class.dialogOwner = null;
}

Class.AREA_RANGE = [
	{width:5.0,    mode:1,      len:3}, // 100Km
	{width:0.5,    mode:10,     len:5}, // 10Km
	{width:0.05,   mode:100,    len:6}, // 1Km
	{width:0.004,  mode:1000,   len:7}, // 100m
	{width:0.0005, mode:10000,  len:8}  // 10m
];

Class.getAreasOld = function(minLat, minLng, maxLat, maxLng){
	var w = maxLng - minLng;
	var range = 0;

	for (var i=1; i<Class.AREA_RANGE.length; i++) {
		if (w < Class.AREA_RANGE[i].width) range = i;
	}
	return Class.getAreas(minLat, minLng, maxLat, maxLng, range);
}

Class.getBounds = function(map) {
	// マップの表示範囲取得。
	var rect = map.getBounds();
	if (rect == null) return;
	var latNE = rect.getNorthEast().lat();
	var lngNE = rect.getNorthEast().lng();
	var latSW = rect.getSouthWest().lat();
	var lngSW = rect.getSouthWest().lng();

	// サーバーから表示範囲内のマーカー取得。非同期。
	return {
	latMin : Math.min(latNE, latSW),
	lngMin : Math.min(lngNE, lngSW),
	latMax : Math.max(latNE, latSW),
	lngMax : Math.max(lngNE, lngSW)
	};
}

Class.getAreas = function(minLat, minLng, maxLat, maxLng, range){
	var list = [];
	var mode = Class.AREA_RANGE[range].mode;
	var len = Class.AREA_RANGE[range].len;
	
	minLat = Math.floor(minLat*mode);
	minLng = Math.floor(minLng*mode);
	maxLat = Math.floor(maxLat*mode);
	maxLng = Math.floor(maxLng*mode);

	for (var lat = minLat; lat<=maxLat; lat+=1) {
		for (var lng = minLng; lng<=maxLng; lng+=1) {
			var area =
				Class.toZeroPrefix((lat/mode),len)+","+
				Class.toZeroPrefix((lng/mode),len);
			list.push(area);
			if (list.length>100) return list;
		}
	}

	if (list.length <= 1) return list;
	// center sort.
	var res = [];
	var center = Math.floor(list.length/2);
	for (var i=0; i<center; i++) {
		res.push(list[center-i]);
		if (list.length > center+i+1) res.push(list[center+i+1]);
	}
	
	return res;
}
Class.toZeroPrefix = function(val, len) {
	var str = "00"+ val;
	var idx = str.indexOf(".");
	if (idx == -1) {
		str += ".0000000";
		idx = str.indexOf(".");
	} else {
		str += "0000000";
	}
	return str.substr(idx-3,len);
}
Class.eventBreaker = function(ev) {
	if (ev == undefined) return;
	if (ev.stopPropagation) ev.stopPropagation();
	if (ev.stopPropagation) ev.preventDefault();
	return false;
}
Class.setNoImage = function(img) {
	img.src = "/images/noimage.gif";
}

Class.correntTextarea = function(input) {
	setTimeout(function() {
		var extraLineHeight = 1,
			scrollHeight = input[0].scrollHeight,
			clientHeight = input[0].clientHeight;
	
		if ( clientHeight < scrollHeight ) {
			input.css({
				height: (scrollHeight + extraLineHeight)
			});
		}
	}, 500);
}

Class.correctImg = function(img) {
	if (img == null) return "/images/noimage.gif";
	return img;
}

});