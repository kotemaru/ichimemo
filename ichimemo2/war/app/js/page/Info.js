var Info = Page.def(function Info(){}, function(Class){

Class.init = function()  {
}

Class.onBeforeShow = function() {
	Util.setNavbar(Class.ID);
}

Class.fromGooglePlace = function() {
	var curPos = Map.marker.getPosition();
	var count = Kokorahen.fromGooglePlace({
		lat : curPos.lat(),
		lng : curPos.lng(),
		radius: 250
	});
	if (count>0) {
		alert(""+count+"件のデータを取得しました。");
	} else {
		alert("データは取得できませんでした。");
	}
}

});

