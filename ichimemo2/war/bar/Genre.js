Module.def(window, function Genre(){}, function(Class) {

	var genre = "bar";

	Class.getGenre = function() {
		return genre;
	}

});