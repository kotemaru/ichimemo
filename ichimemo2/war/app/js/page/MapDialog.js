Page.def(function MapDialog(){}, function(Class){
	var CANVAS = null;
	var DEFAULT_CENTER = new google.maps.LatLng(35.684699,139.753897);
	
	var OPTIONS = {
		zoom: 14,
		center: DEFAULT_CENTER ,
		scaleControl: true,
		mapTypeControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = null;
	var marker = null;
	var position;
	var initFlag = false;

	function autoInit() {
		if (initFlag) return;
		initFlag = true;

		var $page = $(Class.PAGE);

		// マップ生成
		CANVAS = $page.find("div[data-role='content']");
		CANVAS.css("padding","0");
		map = new google.maps.Map(CANVAS[0], OPTIONS);

		// 現在位置マーカー生成
		marker = new google.maps.Marker({
			position: DEFAULT_CENTER, map: map 
		});

	}
	
	Class.updateOrientation = function(ev) {
		var h1 = 43; // $("#mapHeader").height();
		var h2 = 0; //$("#tabbar").height();
		$(CANVAS).height(window.innerHeight - h1 - h2);
		if (window.innerHeight<300) {
			alert("画面が小さ過ぎます。");
		}
		//$(CANVAS).height($("html").height() - h1 - h2);
	}

	Class.go = function(pos) {
		autoInit();
		position = pos;
		Class.updateOrientation();
		Util.changePage(Class.ID);
		map.setZoom(18);
	}
	
	Class.onShow= function() {
		google.maps.event.trigger(map, "resize");
		marker.setPosition(position);
		map.setCenter(position);
	}

});
