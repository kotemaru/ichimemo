var Timeline = Page.def(function Timeline(){}, function(Class){

Class.LIST_DIV = null;
Class.LIST_ITEM = null;
Class.FOLLOW_ONLY = "#tlFollowOnly";
Class.NEAR_ONLY = "#tlNearOnly";
Class.LIMIT = 30;

Class.init = function() {
	var $page = $(Class.PAGE)
	Class.LIST_DIV = $page.find(".ReviewList")[0];
	Class.LIST_ITEM = $page.find(".ReviewList ul").html();
	
	//$(Class.FOLLOW_ONLY).change(Class.reload);
	//$(Class.NEAR_ONLY).change(Class.reload);
	$page.find(".Only").change(Class.reload);
	$page.find(".Search").live('keypress', function(ev){
		if (ev.which === 13) {
			Class.reload();
		}
	});
	$page.find(".Search").live('blur', Class.reload);
}

Class.onBeforeShow = function() {
	Util.setNavbar(Class.ID);
	Class.reload();
}
Class.reload = function(ev) {
	$(Class.LIST_DIV).html("Please wait...");

	params = {
		tag: SpotTags.getSearchTag(), 
		limit: Class.LIMIT
	};
/*
	if ($(Class.FOLLOW_ONLY).attr("checked")) {
		params.follows = Login.user.follows;
	}
	if ($(Class.NEAR_ONLY).attr("checked")) {
		var curPos = Map.marker.getPosition();
		params.lat = curPos.lat();
		params.lng = curPos.lng();
	}
*/
	if ($(Class.FOLLOW_ONLY).attr('checked') == "checked") {
		params.follows = Login.user.follows;
	} else {
		var curPos = Map.marker.getPosition();
		params.lat = curPos.lat();
		params.lng = curPos.lng();
	}
	params.search = $(Class.PAGE).find(".Search").val();
	
	Kokorahen.listTimelineAsync({
		success: function(list) {
			Review.makeList(Class.LIST_DIV, null, list);
			Util.setNavbar(Class.PAGE);
		}
	}, params);
}



});

