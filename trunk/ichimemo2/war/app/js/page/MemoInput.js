var MemoInput = Page.def(function MemoInput(){}, function(Class){

Class.LIST_DIV = null;
Class.LIST_ITEM = null;
Class.LIMIT = 30;
Class.spotId = null;
Class.current = null;
Class.all = {};
Class.spotBrief = null;

Class.init = function() {
	var $page = $(Class.PAGE);
	Class.LIST_DIV = $page.find(".ReviewList")[0];
	Class.spotBrief = new SpotBrief().init(Class.PAGE);
}

Class.go = function(spotId) {
	Class.spotId = spotId;
	Class.current = Class.getMemo(Login.user.userId, spotId);
	if (Class.current == null) {
		$(document.memo.comment).val("");
	} else {
		$(document.memo.comment).val(Class.current.comment);
	}
	Util.changePage(Class.ID);
}

Class.getMemo = function(userId, spotId) {
	var id = userId+","+spotId;
	if (Class.all[id] != null) return Class.all[id];
	Class.all[id] = Kokorahen.getMemo(userId, spotId);
	return Class.all[id];
}

Class.onBeforeShow = function() {
	var spot = Spot.getSpotForId(Class.spotId);
	Class.spotBrief.setSpot(spot);

	Class.load(Login.user.userId, Class.spotId);
	Util.setNavbar(Class.PAGE);
}
Class.load = function(userId, spotId) {
	$(Class.LIST_DIV).html("");
	Kokorahen.listTimelineAsync({
		success: function(list) {
			Review.makeList(Class.LIST_DIV, null, list);
			Util.setNavbar(Class.PAGE);
		}
	}, userId, spotId, Class.LIMIT);
}

Class.write = function() {
	var params = {};
	var elems = document.memo.elements;
	for (var i=0; i<elems.length; i++) {
		params[elems[i].name] = elems[i].value;
	}
	var sd = Spot.getSpotForId(Class.spotId).data;

	params.spotId = sd.id;
	params.spotName = sd.name;
	params.lat = sd.lat;
	params.lng = sd.lng;
	params.tags = sd.tags;

	var id = Kokorahen.writeMemo(params);
	alert("memo id="+id);
}

});