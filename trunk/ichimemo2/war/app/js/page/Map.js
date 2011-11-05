Page.def(function Map(){}, function(Class){
	var CANVAS = null;
	var DEFAULT_CENTER = new google.maps.LatLng(35.684699,139.753897);
	var searchTag = null;
	var initFlag = true;
	var isClean = false;
	var centerReserve = null;
	var positionReserve = null;
	var todoFlag = false;

	var gevent = google.maps.event;
	
	var OPTIONS = {
		zoom: 14,
		center: DEFAULT_CENTER ,
		scaleControl: true,
		mapTypeControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	Class.map = null;
	marker = null;
	Class.infobox = null;

	Class.init = function() {
		var $page = $(Class.PAGE);

		// マップ生成
		CANVAS = $page.find("div[data-role='content']");
		CANVAS.css("padding","0");
		Class.map = new google.maps.Map(CANVAS[0], OPTIONS);
		Class.updateOrientation();

		// バルーン生成。
		Class.infobox = new InfoBox(Class.map);

		// 現在位置マーカー生成
		marker = new google.maps.Marker({
			position: DEFAULT_CENTER, map: Class.map 
		});

		// カスタムコントロール。
		var $mapBtn = $("#MapButton");
		Class.map.controls[google.maps.ControlPosition.TOP_RIGHT].push($mapBtn[0]);
		$mapBtn.find("input").bind('change', function() {
			reload(true);
		});
		$mapBtn.find("label").bind('click', function(ev) {
			Map.onClickLabel(ev,ev.target);
		});
		

		// マップ、バルーンのイベントハンドラ設定。
		gevent.addListener(Class.map, 'click', Class.onMapClick);
		gevent.addListener(Class.map, 'idle', Class.onMapIdol);
		gevent.addListener(Class.map, 'zoom_changed', Class.onZoomChanged);
		gevent.addListener(Class.map, 'center_changed', Class.onCenterChanged);
		gevent.addListener(marker, 'click', Class.onMarkerClick);
		gevent.addDomListener($mapBtn[0], 'click', function() {
			var $mapMenu = $mapBtn.find(".MapMenu")
			if ($mapMenu.is(':visible')) {
				$mapMenu.fadeTo(1000, 0, function(){$mapMenu.hide()});
			} else {
				$mapMenu.fadeTo(0, 1);
				$mapMenu.show();
			}
		});		
  		Class.infobox.addEventListener('click', Class.onBalloonClick, false);

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
			marker.setPosition(center);
			centerReserve = center;
			positionReserve = center;
		}, function(e){
			alert("現在位置が取得できません。\n"+e.message);
		});
	}
	Class.setCenter = function(pos, zoom) {
		//Class.map.setCenter(pos);
		centerReserve = pos;
		if (zoom) Class.map.setZoom(zoom);
		//marker.setPosition(pos);
	}
	Class.getPosition = function(){
		return marker.getPosition();
	}
	Class.setPosition = function(pos){
		positionReserve = pos;
		return marker.getPosition(pos);
	}
	
	Class.onMapClick = function(ev) {
		// 現在位置マーカをクリック位置に移動。
		marker.setPosition(ev.latLng);
		marker.setVisible(true);
		Class.infobox.close();
	}
	Class.onBalloonClick = function(ev) {
		SpotTL.go(SpotInfo.current.data.id);
		return Util.eventBreaker(ev);
	}
	
	Class.onMarkerClick = function(ev) {
		SpotInfo.setCurrent({marker:marker});
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
		$(CANVAS).height(window.innerHeight - h1 - h2);
		if (window.innerHeight<300) {
			alert("画面が小さ過ぎます。");
		}
		//$(CANVAS).height($("html").height() - h1 - h2);
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
		if (tag != searchTag) {
			// reload.
			searchTag = tag;
			reload(true);
			var label = (tag==null) ? "ジャンル" : tag;
			$(".TagSelectBtn .ui-btn-text").text(label);
		}
	}
	Class.clear = function(ev, info){
		Spot.clearCache();
		isClean = true;
	}
	
	Class.onShow = function(ev, info){
		if (initFlag) {
			Class.setCenterFromGPS();
			initFlag = false;
		}
		if (isClean) {
			Class.onMapIdol();
		}
		// Note: 地図が初期状態で非表示だと誤動作するのでその対処。
		google.maps.event.trigger(Class.map, "resize");
		if (centerReserve) {
			Class.map.setCenter(centerReserve);
			centerReserve = null;
		}
		if (positionReserve) {
			marker.setPosition(positionReserve);
			positionReserve = null;
		}
	}
	
	/**
	 * マップクリックイベント処理。
	 */
	Class.onMapIdol = function(ev) {
		reload(false);
		Class.infobox.close();
		Class.autoMoveMarker();
		isClean = false
	}
	Class.autoMoveMarker = function() {
		var r = Util.getBounds(Class.map);
		var pos = 	marker.getPosition();
		var lat = pos.lat();
		var lng = pos.lng();
	
		if (r.latMin > lat || lat > r.latMax
			|| r.lngMin > lng || lng > r.lngMax) {
			lat = (r.latMin + r.latMax) / 2;
			lng = (r.lngMin + r.lngMax) / 2;
			marker.setPosition(new google.maps.LatLng(lat,lng));
		}
	}
	Class.onClickLabel = function(ev,label) {
		var $cbox = $(label).parent().find("input");
		$cbox.click();
		return Util.eventBreaker(ev);
	}
	function reload(withClear) {
		var $page = $(Class.PAGE);
		var filter = $(Class.PAGE).find("input[name='filter']").filter(":checked").val();
		var limit = $(Class.PAGE).find("input[name='limit']").filter(":checked").val();
		if (limit == null) limit = 30; // for iPhone.
		var opts = {
			general: (filter=="all"),
			checked: (filter=="todo"?false:null),
			limit: limit
		}
		if (withClear) Spot.clearCache();
		Spot.load(Class.map, opts);
	}
	Class.reload = reload; // export

});
