Page.def(function Info(){}, function(Class){
	
	Class.onBeforeShow = function() {
		Util.setNavbar(Class.ID);
	}
	
	Class.fromGooglePlace = function() {
		var curPos = Map.getPosition();
		var count = Kokorahen.fromGooglePlace({
			genre: Genre.getGenre(),
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

