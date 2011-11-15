Module.def(window, function SpotBrief(){}, function(Class){
	var Instance = Class.prototype;


	Class.TEMPL = $("#spotBrief").html();

	Instance.init = function(page) {
		var $brief = $(page).find(".SpotBrief");
		$brief.attr("scope","local");
		$brief.html(Class.TEMPL);
		this.brief = $brief[0];
		return this;
	}
	
	Instance.setSpot = function(spot) {
		this.spot = spot;
		var that = this;
		var data = {};
		if (spot != null) {
			data = spot.data;
			var $brief = $(this.brief);
			$brief.data("that", this);
			$brief.find("a.Edit").click(function(){
				SpotInfo.setCurrent(spot);
				SpotInfo.go();
			});
		}
		Util.evalAttr(this.brief, function(c){return eval(c)});
	}

	function f3(val) {
		if (val == null || val <= 0) return "?";
		return Math.floor(val*10)/10
	}

	function text2html(text) {
		return Util.text2html(text);
	}

	Instance.titleHtml = function() {
		if (this.spot == null) return "?";
		var data = this.spot.data;
		if (data.url != null && data.url != "") {
			return "<a target='_blank' href='"+data.url+"'>"+data.name+"</a>";
		}
		return Util.text2html(data.name);
	}

	Instance.faceMarkImg = function() {
		if (this.spot == null) return "?";
		var data = this.spot.data;
		if (null != data.myAppraise && data.myAppraise > 0) {
			return "/images/face-"+Math.floor(data.myAppraise)+".png";
		} else if (data.appraise > 0) {
			return "/images/face-"+Math.floor(data.appraise)+".png";
		}
		return "/images/face-0.png";
	}
	Instance.data = function(name){
		if (this.spot == null) return "";
		var val = this.spot.data[name];
		if (val == null) val = "";
		if (val.join) return val.join(",");
		return val;
	}
	Instance.placeUrl = function(){
		if (this.spot == null) return "";
		var data = this.spot.data;
		if (data.placeId != null) {
			return "[<a href='"+data.placeUrl+"' target='_blank'>GooglePlaceへ</a>]";
		}
		return "";
	}

	
	Class.toggleDetail = function(ev,_this) { // this=img
		var $brief = $(_this.parentNode.parentNode);
		var that = $brief.data("that");
		if ($brief.find(".SpotDetail").is(':visible')) {
			that.hideDetail();
		} else {
			that.showDetail();
		}
		Util.eventBreaker(ev);
	}

	Instance.showDetail = function() { 
		$(this.brief).find(".SpotDetail").show();
		$(this.brief).find(".SpotDetailKnob img").attr('src',"/images/pullup.png");
	}
	Instance.hideDetail = function() { 
		$(this.brief).find(".SpotDetail").hide();
		$(this.brief).find(".SpotDetailKnob img").attr('src',"/images/pulldown.png");
	}


	
});