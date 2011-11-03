Page.def(function Review(){}, function closure(Class){
	
	Class.FACE_MARK_TEXT = {
		checked:[
	             		    "未",
	                		"まずい",
	                		"いまいち",
	                		"ふつう",
	                		"うまい",
	                		"めちゃうまー",
	    ],
	    todo:[
                     		"未",
                     		"まずそー",
                     		"いまいちそー",
                     		"ふつうそー",
                     		"うまそー",
                     		"めちゃうまそー",
	    ]
	};
	var memcache = {};
	var current = {
		review: null
	};
	var LIST_ITEM = null;
	var spotBrief = null;
	var faceMarkText = null;
	var mode = null;
	var M_REVIEW = 'review';
	var M_TWIT = 'twit';
	var M_TODO = 'todo';

	Class.init = function() {
		LIST_ITEM = $("#reviewListItem").html();
		spotBrief = new SpotBrief().init(Class.PAGE);
	}
	
	Class.go = function(id) {
		current.review = Class.getReview(id);
		if (current.review.appraise <= 0) return Twit.go(id);

		if (current.review.checked) {
			faceMarkText = Class.FACE_MARK_TEXT.checked;
			mode = M_REVIEW;
		} else {
			faceMarkText = Class.FACE_MARK_TEXT.todo;
			mode = M_TODO;
		}
		Util.procIf(Class.PAGE, function(c){return eval(c)});
		Util.changePage(Class.ID);
	}
	
	Class.getReview = function(id) {
		if (memcache[id]) return memcache[id];
		memcache[id] =  Kokorahen.getReview(id);
		return memcache[id];
	}
	Class.setReview = function(data) {
		memcache[data.id] = data;
	}
	
	Class.onBeforeShow = function() {
		if (current.review == null) return;
		var data = current.review;
		var spot = Spot.getSpotForId(data.spotId);
		spotBrief.setSpot(spot);
	
		var appraise = Math.floor(data.appraise);
		var $page = $(Class.PAGE);
	
		$page.find(".ThumbnailL").attr("src", Util.correctImg(data.photoUrl));
		$page.find(".FaceMark").attr("src", "/images/face-"+appraise+".png");
		$page.find(".FaceMarkText").text(faceMarkText[appraise]);
		$page.find(".Comment").text(data.comment);
	
		Util.setNavbar(Class.PAGE);
	}
	
	Class.makeList = function(tgt, html, list) {
		var div = $(tgt)
		if (html == null) html = LIST_ITEM;
		if (list.length == 0) {
			div.html("まだレビューはありません。");
			return;
		}
	
		var ul = $('<ul data-role="listview" data-inset="true" ></ul>');
		div.html("");
		div.append(ul);
		
		for (var i=0; i<list.length; i++) {
			Class.setReview(list[i]);
			ul.append($(Review.getListItem(html,list[i])));
		}
		ul.listview();
	}
	Class.getListItem = function(html, data) {
		var appraise = Math.floor(data.appraise);
		if (appraise<0) appraise = 0;
		var photo = data.photoUrl;
		if (photo == null || photo == "") photo = "/images/noimage.gif";

		var faceMark = (appraise > 0)
			? "/images/face-"+appraise+".png"
			: "/images/twit-16.png"
		;
		var mySpotMark = (data.checked && appraise > 0)
			? "/images/flag-16.png"
			: "/images/null.png"
		;
	
		html = html.replace(/[$][{]id[}]/g, data.id)
			.replace(/[$][{]photo[}]/g, photo)
			.replace(/[$][{]appraise[}]/g, appraise)
			.replace(/[$][{]faceMark[}]/g, faceMark)
			.replace(/[$][{]mySpotMark[}]/g, mySpotMark)
			.replace(/[$][{]nickname[}]/g, data.nickname)
			.replace(/[$][{]spotname[}]/g, data.spotName)
			.replace(/[$][{]comment[}]/g, data.comment);
		return html;
	}
	
	Class.moreUser = function() {
		UserTL.go(current.review.userId);
	}
	
	Class.moreSpot = function() {
		SpotTL.go(current.review.spotId);
	}
	
});