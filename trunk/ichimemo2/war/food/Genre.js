Module.def(window, function Genre(){}, function(Class) {

	var genre = "food";

	Class.getGenre = function() {
		return genre;
	}
	Class.getTagTree = function() { 
		return [
			"和食",
			"洋食",
			"中華料理",
			"イタリアン",
			"フレンチ",
			"エスニック",
			"ラーメン",
			"カレー",
		];
	}

});