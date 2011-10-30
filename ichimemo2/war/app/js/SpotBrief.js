Module.def(window, function SpotBrief(){}, function(Class){

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
		$brief.data("that", this);

		$brief.find("a.Edit").click(function(){
			SpotInfo.setCurrent(spot);
			SpotInfo.go();
		});
		$brief.find(".Thumbnail img").attr("src",Util.correctImg(data.image));

		var title = data.name;
		if (data.url != null && data.url != "") {
			title = "<a target='_blank' href='"+data.url+"'>"+data.name+"</a>";
		}
		$brief.find(".Title").html(title);
		$brief.find(".SubTitle").text(data.address);
		$brief.find(".Distance").text(Util.spotDistance(spot)+"m");

		if (data.appraise > 0) {
			$brief.find(".appraise").text(Math.floor(data.appraise*10)/10);
			$brief.find(".FaceMark").attr('src',
					"/images/face-"+Math.floor(data.appraise+0.9999999)+".png");
		} else {
			$brief.find(".appraise").text("？");
			$brief.find(".FaceMark").attr('src',"/images/face-0.png");
		}

		if (data.myAppraise > 0) {
			$brief.find(".FaceMark").attr('src',
					"/images/face-"+Math.floor(data.myAppraise)+".png");
			
			var label = data.checked ? "評価:" : "期待:";
			$brief.find(".myAppraiseLabel").text(label);
			$brief.find(".myAppraise").text(Math.floor(data.myAppraise*10)/10);
			var star = data.checked ? "/images/star.png" : "/images/star-blue.png";
			$brief.find(".MySpotMark").show().attr('src', star);
			
		} else {
			$brief.find(".myAppraiseLabel").text("");
			$brief.find(".myAppraise").text("");
			$brief.find(".MySpotMark").hide();
		}

		
		Class._setText($brief, data, "tags");
		Class._setText($brief, data, "timeLunchMin");
		Class._setText($brief, data, "timeLunchMax");
		Class._setText($brief, data, "timeDinnerMin");
		Class._setText($brief, data, "timeDinnerMax");
		Class._setText($brief, data, "closedDays");
		Class._setText($brief, data, "openHours");
		Class._setText($brief, data, "comment");

		if (data.placeId != null) {
			$brief.find(".GoogleLogo").html(
				"<img src='/images/powered-by-google.png' />"
			);
		} else {
			$brief.find(".GoogleLogo").html("");
		}
	}
	Class._setText = function($brief, data, name) {
		var val = data[name];
		if (val == null) val = "";
		if (val.join) val = val.join(",");
		$brief.find("."+name).text(val);
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

	Class.prototype.showDetail = function() { 
		$(this.brief).find(".SpotDetail").show();
		$(this.brief).find(".SpotDetailKnob img").attr('src',"/images/pushup.gif");
	}
	Class.prototype.hideDetail = function() { 
		$(this.brief).find(".SpotDetail").hide();
		$(this.brief).find(".SpotDetailKnob img").attr('src',"/images/pulldown.gif");
	}


	
});