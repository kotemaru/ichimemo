var Map = Page.def(function Map(){}, function(Class){
Class.CANVAS = null;
Class.map = null;
Class.marker = null;
Class.markers = null;
Class.DEFAULT_CENTER = new google.maps.LatLng(35.684699,139.753897);
Class.searchTag = null;

Class.options = {
	zoom: 14,
	center: Class.DEFAULT_CENTER ,
	scaleControl: true,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};

Class.init = function() {

		// マップ生成
		Class.CANVAS = $(Class.PAGE).find("div[data-role='content']");
		Class.CANVAS.css("padding","0");
		Class.map = new google.maps.Map(Class.CANVAS[0], Class.options);
		Class.updateOrientation();

		// バルーン生成。
		Class.infobox = new InfoBox(Class.map);

		// 現在位置マーカー生成
		Class.marker = new google.maps.Marker({
			position: Class.DEFAULT_CENTER, map: Class.map 
		});

		// マップ、バルーンのイベントハンドラ設定。
		google.maps.event.addListener(Class.map, 'click', Class.onMapClick);
		google.maps.event.addListener(Class.map, 'idle', Class.onMapIdol);
		google.maps.event.addListener(Class.map, 'zoom_changed', Class.onZoomChanged);
		google.maps.event.addListener(Class.map, 'center_changed', Class.onCenterChanged);
		google.maps.event.addListener(Class.marker, 'click', Class.onMarkerClick);
		Class.infobox.addEventListener('click', Class.onBalloonClick, false);

		Class.setCenterFromGPS();
}
/**
 * GPS取得イベント処理。
 * <li>navigator.geolocation.watchPosition()
 */
Class.setCenterFromGPS = function() {
	// GPSから現在位置取得、
	navigator.geolocation.getCurrentPosition(function(position){
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		// 地図の中央にGPS位置を設定。
		var center = new google.maps.LatLng(lat, lng);
		Class.map.setCenter(center);
		Class.marker.setPosition(center);
	}, function(e){
		alert("現在位置が取得できません。\n"+e.message);
	});
}

Class.onMapClick = function(ev) {
	// 現在位置マーカをクリック位置に移動。
	Class.marker.setPosition(ev.latLng);
	Class.marker.setVisible(true);
	Class.infobox.close();
}
Class.onBalloonClick = function(ev) {
	//SpotInfo.go();
	SpotTL.go(SpotInfo.current.data.id);
	return Util.eventBreaker(ev);
}

Class.onMarkerClick = function(ev) {
	SpotInfo.setCurrent({marker:Class.marker});
	Class.infobox.close();
	SpotInfo.go();
	return Util.eventBreaker(ev);
}
Class.onZoomChanged = function(ev) {
	Spot.onZoomChanged(Class.map.getZoom());
}
Class.onCenterChanged = function(ev) {
	Spot.onCenterChanged();
}

Class.updateOrientation = function(ev) {
	var h1 = 43; // $("#mapHeader").height();
	var h2 = 50; //$("#tabbar").height();
	$(Class.CANVAS).height($("html").height() - h1 - h2);
}

Class.onBeforeShow = function(ev) {
	if (Login.user == null) {
		Util.changePage("#Login");
	}
	
	Class.onTagChange();
	//Spot.visible(Class.LIMIT);
	Util.setNavbar(Class.PAGE);
}
Class.onTagChange = function() {
	var tag = SpotTags.getSearchTag();
	if (tag != Class.searchTag) {
		// reload.
		Class.searchTag = tag;
		Spot.clearCache();
		Spot.load(Class.map);
		var label = (tag==null) ? "ジャンル" : tag;
		$(".TagSelectBtn .ui-btn-text").text(label);
	}
}

Class.onShow = function(ev, info){
	// Note: 地図が初期状態で非表示だと誤動作するのでその対処。
	google.maps.event.trigger(Class.map, "resize");
	//Class.map.setCenter(Class.marker.getPosition());
}

/**
 * マップクリックイベント処理。
 */
Class.onMapIdol = function(ev) {
	Spot.load(Class.map);
	Class.infobox.close();
}

});
