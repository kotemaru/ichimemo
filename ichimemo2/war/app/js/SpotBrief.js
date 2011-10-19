var SpotBrief = Module.def(window, function SpotBrief(){}, function(Class){

	Class.TEMPL = $("#spotBrief").html();

	Class.prototype.init = function(page) {
		var $brief = $(page).find(".SpotBrief");
		$brief.html(Class.TEMPL);
		this.brief = $brief[0];
		return this;
	}
	
	Class.prototype.setSpot = function(spot) {
		this.spot = spot;
		var data = spot.data;
		var $brief = $(this.brief);
		$brief.find(".Thumbnail img").attr("src",Util.correctImg(data.image));
		$brief.find(".Title").text(data.name);
		$brief.find(".SubTitle").text(data.address);
		$brief.find(".Distance").text(Util.spotDistance(spot)+"m");
	}

});