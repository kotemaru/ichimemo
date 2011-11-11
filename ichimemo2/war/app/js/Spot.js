
//-----------------------------------------------------------------
//Spot


Module.def(window, function Spot(data) {
	this.data = data;
	this.init(data);
}, function(Class){
	//ピンイメージ。
	var PIN = [
		makePinImg("blue"),
		makePinImg("blue"),
		makePinImg("green"),
		makePinImg("orange"),
		makePinImg("red"),
		makePinImg("red")
	];
	//ピンの影イメージ
	var PIN_SHADOW = new google.maps.MarkerImage(
		"/images/pin-shadow.png", // url
		new google.maps.Size(40,24), // size
		new google.maps.Point(0,0),  // origin
		new google.maps.Point(14,24) // anchor
	);

	Class.prototype.init = function(data) {
		var pos = new google.maps.LatLng(data.lat, data.lng);
		var level = Math.floor(data.appraise);
		if (level < 0) level = 0;
		this.marker = new google.maps.Marker({position: pos, map: Map.map,
			icon:PIN[level] , shadow:PIN_SHADOW
		});
		this.marker.spot = this;
		this.marker.setVisible(false);
		this.marker.setZIndex(0);
		google.maps.event.addListener(this.marker, 'click', Class.onSpotMarkerClick);
	}
	
	function makePinImg(color) {
		return new google.maps.MarkerImage(
			"/images/pin-"+color+".png", // url
			new google.maps.Size(24,24), // size
			new google.maps.Point(0,0),  // origin
			new google.maps.Point(12,24) // anchor
		);
	}
	Class.onSpotMarkerClick = function(pos) { // this=marker
		SpotInfo.setCurrent(this.spot);
		if (SpotInfo.current == null) return;
		var addr = SpotInfo.current.data.address.replace(/^日本,/,"");
		var msg = "<div class='BalloonLine1'>"+SpotInfo.current.data.name+"</div>"
			+"<div class='BalloonLine2'>"+addr+"</div>";
		Map.infobox.open(this, msg);

		var min = 0;
		for (var i=0; i<memcacheList.length; i++) {
			var zidx = memcacheList[i].marker.getZIndex();
			min = (min<zidx)?min:zidx;
		};

		this.setZIndex(min-1);
		this.setMap(this.getMap());
	}
	
	//--------------------------------------------------------------
	// Spot Cache
	var memcache = {};
	var memcacheList = [];
	var areaFlags = {};
	var currentRange = 0;
	var currentAreas = null;
	var currentZoom = 0;
	var LIMIT = 20;
	var visibleStack = 0;
	
	
	Class.getSpotForId = function(id) {
		if (memcache[id]) return memcache[id];
		var data = Kokorahen.getSpot(id);
		if (data == null) return null;
		return Class.getSpot(data);
	}
	
	Class.getSpot = function(data) {
		if (memcache[data.id]) return memcache[data.id];
		var spot = new Spot(data);
		memcache[data.id] = spot;
		memcacheList.push(spot);
		return spot;
	}
	Class.newSpot = function(data) {
		return new Spot(data);
	}
	Class.clearCache= function() {
		for (var id in memcache) {
			memcache[id].marker.setMap(null);
			memcache[id].marker = undefined;
			delete memcache[id];
		}
		delete memcacheList;
		memcacheList = [];
		areaFlags = {};
	}
	Class.isClean= function() {
		return memcacheList.length == 0;
	}
	Class.onZoomChanged = function(zoom) {
		currentZoom = zoom;
		currentAreas = null;
	}
	Class.onCenterChanged = function() {
		currentAreas = null;
	}
	
	Class.load = function(map, opts) {
		if (Login.user == null) return;
		
		var areas = Class.getAreas(map);
		var range = areas[0].length;
		if (currentRange != range) {
			Class.clearCache();
			currentRange = range;
		}
	/*
		var alive = 0;
		for (var i=0; i<areas.length; i++) {
			if (areaFlags[areas[i]]) {
				areas[i] = null;
			} else{
				alive++;
			}
		}
		if (alive == 0) return;
		
		Kokorahen.listSpotAsync(Class.onload, {
			areas: areas, tag:Class.searchTag, limit: LIMIT+1, range: range
		});
	*/
	/*
		currentAreas = areas;
		visibleStack = 0;
		setTimeout(function(){
			Class.loadDelay(areas, 0, 1, currentZoom);
		}, 200);
	*/
	
		currentAreas = areas;
		setTimeout(function(){
			if (currentAreas != areas) return;
	
			var params =  {
					genre: Genre.getGenre(),
					areas: areas, tag: SpotTags.getSearchTag(), 
					follows: Login.user.follows,
					limit: LIMIT, range: currentRange,
					general: true
			};
			if (opts) {
				params.general = opts.general;
				params.checked = opts.checked;
				params.limit = opts.limit;
			}
			Class.getBounds(Map.map, params);
			Kokorahen.listMySpotAsync(Class.onloadGetSpots, params);
			//Kokorahen.getSpotsAsync(Class.onloadGetSpots, params);
			//Kokorahen.listFollowSpotAsync(Class.onloadGetSpots, params);
		}, 200);
	};
	Class.onloadGetSpots = {
			success: function(list, args) {
				if (args[1].areas != currentAreas) return;
				
				
				for (var i=0; i<list.length; i++) {
					Class.getSpot(list[i]);
				}
				Class.visibleDelay();
			},
			fail: function(e) {
				alert(e.stack);
			}
	}
	
	
	Class.loadDelay = function(areas, i, n, zoom) {
		if (i >= areas.length) {
			Class.visible();
			return;
		}
		if (currentAreas != areas || currentZoom != zoom) {
			return; 
		}
	
		var _areas = [];
		for (; i<areas.length; i++) {
			if (! areaFlags[areas[i]]) {
				_areas.push(areas[i]);
				if (_areas.length >= n) break;
			}
		}
		if (_areas.length == 0) {
			Class.visible();
			return;
		}
	
		var limit = LIMIT;
		if (currentRange >= 20) limit = 999;
		Kokorahen.listSpotAsync(Class.onload, {
			genre: Genre.getGenre(),
			areas: _areas, tag:Class.searchTag, 
			limit: limit, range: currentRange
		})
			
		setTimeout(function(){
			Class.loadDelay(areas, i+1, (n+1)*(n+1),zoom);
		}, 500);
	
	}
	
	/**
	 * 表示範囲内のマーカー取得コールバック。
	 */
	Class.onload = {
		success: function(data, args) {
			// レンジが変更されていたら処理中止
			if (data.length <= 0) return;
			if (currentRange != data[0].area.length) return; 
	
			for (var j=0; j<data.length; j++) {
				var area = data[j].area;
				var list = data[j].spots;
				areaFlags[area] = true;
				for (var i=0; i<list.length; i++) {
					Class.getSpot(list[i]);
				}
			}
			Class.visibleDelay();
		},
		fail: function(e) {
			alert(e.stack);
		}
	}
	
	Class.visibleDelay = function() {
		visibleStack++;
		setTimeout(function(){
			if (--visibleStack <= 0) {
				Class.visible();
				visibleStack = 0;
			}
			//console.log("-->"+visibleStack);
		}, 200);
	}
	
	
	Class.visible = function(limit) {
		if (undefined === limit) limit = LIMIT;
			
		// マップの表示範囲取得。
		var rect = Map.map.getBounds();
		if (rect == null) return;
		var latNE = rect.getNorthEast().lat();
		var lngNE = rect.getNorthEast().lng();
		var latSW = rect.getSouthWest().lat();
		var lngSW = rect.getSouthWest().lng();
	
		// サーバーから表示範囲内のマーカー取得。非同期。
		var latMin = Math.min(latNE, latSW);
		var lngMin = Math.min(lngNE, lngSW);
		var latMax = Math.max(latNE, latSW);
		var lngMax = Math.max(lngNE, lngSW);
	
		function inBounds(spot) {
			return (latMin <= spot.data.lat && spot.data.lat < latMax
				&& lngMin <= spot.data.lng && spot.data.lng < lngMax);
		}
		
		
		var spots = memcacheList;
		for (var i=0; i<spots.length; i++) {
			spots[i].inBounds = inBounds(spots[i]);
		}
	//console.log("--->"+spots.length);
		spots.sort(function(a,b){
			var ap = a.data.appraise + (a.inBounds?1000.0:0.0);
			var bp = b.data.appraise + (b.inBounds?1000.0:0.0);
			if (ap == bp) return 0;
			return (ap < bp) ? 1 : -1;
		});
		//console.log("----->"+spots.length);
		if (currentZoom >= 20) limit = 1000;
		for (var i=0; i<limit && i<spots.length; i++) {
			if (! spots[i].inBounds) break;
			spots[i].marker.setVisible(true);
		}
	
		if (i<spots.length) {
			for (; i<spots.length; i++) {
				if (spots[i].inBounds) spots[i].marker.setVisible(false);
			}
			return false;
		}
		return true;
	}
	
	Class.AREA_RANGE = [
		{width:5.0,    mode:1,      len:3}, // 100Km
		{width:0.5,    mode:10,     len:5}, // 10Km
		{width:0.05,   mode:100,    len:6}, // 1Km
		{width:0.004,  mode:1000,   len:7}, // 100m
		{width:0.0005, mode:10000,  len:8}  // 10m
	];
	
	
	Class.getAreas = function(map, range){
		// マップの表示範囲取得。
		var rect = map.getBounds();
		if (rect == null) return;
		var latNE = rect.getNorthEast().lat();
		var lngNE = rect.getNorthEast().lng();
		var latSW = rect.getSouthWest().lat();
		var lngSW = rect.getSouthWest().lng();
		// サーバーから表示範囲内のマーカー取得。非同期。
		var minLat = Math.min(latNE, latSW);
		var minLng = Math.min(lngNE, lngSW);
		var maxLat = Math.max(latNE, latSW);
		var maxLng = Math.max(lngNE, lngSW);
		
		
		if (undefined === range) {
			var w = maxLng - minLng;
			range = 0;
			for (var i=1; i<Class.AREA_RANGE.length; i++) {
				if (w < Class.AREA_RANGE[i].width) range = i;
			}
		}
	
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
					Util.toZeroPrefix((lat/mode),len)+","+
					Util.toZeroPrefix((lng/mode),len);
				list.push(area);
				if (list.length>100) return list;
			}
		}
		//return list;
		
	
		if (list.length <= 1) return list;
		// center sort.
		var res = [];
		var center = Math.floor(list.length/2);
		for (var i=0; i<=center; i++) {
			if (0 <= center-i-1) res.push(list[center-i-1]);
			if (list.length > center+i) res.push(list[center+i]);
		}
	//console.log("===>"+list);	
	//console.log("--->"+res);	
		return res;
	
	}
	
	Class.getBounds = function(map, params){
		// マップの表示範囲取得。
		var rect = map.getBounds();
		if (rect == null) return null;
		var latNE = rect.getNorthEast().lat();
		var lngNE = rect.getNorthEast().lng();
		var latSW = rect.getSouthWest().lat();
		var lngSW = rect.getSouthWest().lng();
	
		params.latMin = Math.min(latNE, latSW);
		params.lngMin = Math.min(lngNE, lngSW);
		params.latMax = Math.max(latNE, latSW);
		params.lngMax = Math.max(lngNE, lngSW);
		return params;
	}	

});
