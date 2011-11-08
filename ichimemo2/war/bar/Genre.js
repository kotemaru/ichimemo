Module.def(window, function Genre(){}, function(Class) {

	var genre = "bar";

	Class.getGenre = function() {
		return genre;
	}
	
	Class.getTagTree = function() { 
		return [
			"日本酒",
			"焼酎",
			"ワイン",
			"ビール",
			"激安",
			"お洒落"
		];
	}

});