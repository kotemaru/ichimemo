var ReviewInput = Page.def(function ReviewInput(){}, function(Class){

	var LIST_DIV;
	var LIST_ITEM;
	var LIMIT = 20;
	
	var current = {
			review: null,
			checked: null,
	};
	var spotBrief;
	var faceMarkTex;
	
	
	Class.onPageCreate = function() {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".ReviewList")[0];
		LIST_ITEM = $page.find(".ReviewList ul").html();
		
		spotBrief = new SpotBrief().init(Class.PAGE);
	}
	
	Class.go = function(id, spotId, checked) {
		var spot = Spot.getSpotForId(spotId);
		if (spot == null || spot.data.closed) {
			alert("スポットは存在しません。");
			return;
		}

		var $page = $(Class.PAGE);
		current.checked = checked;
		if (current.checked) { // rewview mode
			if (id === undefined) {
				current.review = {
					id: null, spotId: spotId, appraise: 3, comment: "",
					nickname: Login.user.nickname, isNewReview:true,
					photoUrl: "/images/noimage.gif"
				};
			} else {
				current.review = Review.getReview(id);
			}
			$page.find(".Header").text("レビュー登録");
			faceMarkText = Review.FACE_MARK_TEXT.checked;
		} else { // todo mode
			current.review = Kokorahen.getTodo(spotId);
			$page.find(".Header").text("TODO登録");
			faceMarkText = Review.FACE_MARK_TEXT.todo;
			if (current.review == null) {
				current.review = {
					id: null, spotId: spotId, appraise: 3, comment: "",
					nickname: Login.user.nickname, isNewReview:true,
					photoUrl: "/images/noimage.gif"
				};
			}
		}
		
		Class.onFaceClick(current.review.appraise);
		$page.find(".ReviewPhoto")
			.attr("src", Util.correctImg(current.review.photoUrl));
		$page.find(".Comment").val(current.review.comment);
				
		Util.changePage(Class.ID);
	}
	
	Class.onBeforeShow = function() {
		var spot = Spot.getSpotForId(current.review.spotId);
		spotBrief.setSpot(spot);
		reload();
		Util.setNavbar(Class.PAGE);
	}
	
	Class.addFollow = function() {
		UserConf.addFollow(current.review.userId);
	}
	Class.onFaceClick = function(n) {
		var $page = $(Class.PAGE);
		var faces = $page.find(".Faces img.FaceMark");
		for (var i=0; i<faces.length; i++) {
			$(faces[i]).width(16);
		}
		if (n>0) $(faces[n-1]).width(32);
		$page.find(".FaceMarkText").text(faceMarkText[n]);
		current.review.appraise = n;
	}
	
	Class.write = function() {
		var $page = $(Class.PAGE);
		var sd = Spot.getSpotForId(current.review.spotId).data;
		var params = {};
		
		params.id = current.review.id;
		params.genres = sd.genres;
		params.spotId = sd.id;
		params.spotName = sd.name;
		params.lat = sd.lat;
		params.lng = sd.lng;
		params.tags = sd.tags;
		params.appraise = current.review.appraise;
		params.comment = $page.find(".Comment").val();
		params.photoUrl = $page.find(".ReviewPhoto").attr("src");
		params.checked = current.checked;
		params.twit = false;
		params.autoTwitter = $page.find(".Twitter").is(":checked");
		if (params.photoUrl.match(/^\/images/)) params.photoUrl = null;
	
		var id = Kokorahen.writeReview(params);
		alert("レビュー登録しました。("+id+")");
		Map.clear();
		Timeline.clear();
		Timeline.go();
	}
	
	function reload() {
		$(LIST_DIV).html("Please wait...");
	
		Kokorahen.listTimelineAsync({
			success: function(list) {
				Review.makeList(LIST_DIV, null, list);
				Util.setNavbar(Class.PAGE);
			}
		}, Login.user.userId, current.review.spotId, LIMIT);
	}
});