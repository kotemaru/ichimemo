var TagsConf = Page.def(function TagsConf(){}, function(Class){
	
	var LIST_ID = ".TagList";
	var LIST_ITEM = null;
	$(Class.PAGE).find(".TagList ul").html();
	var NEW_TAG = ".NewTag";
	
	Class.init = function() {
		LIST_ITEM = $(Class.PAGE).find(".TagList ul").html();
	}
	
	Class.onBeforeShow = function() {
		makeList();
		Util.setNavbar(Class.PAGE);
	}
	Class.add = function() {
		var tagName = $(Class.PAGE).find(NEW_TAG).val();
		if (Login.user.tags == null) Login.user.tags = [];
		if (Login.user.tags.indexOf(tagName)>=0) {
			alert("既に存在します。");
		} else {
			Login.user.tags.push(tagName);
			Kokorahen.writeUser(Login.user);
			Login.refresh();
			alert("ジャンルを追加しました。");
		}
		Util.backPage();
	}
	Class.del = function(_this) {
		var tagName = $(_this).text();
		var idx = Login.user.tags.indexOf(tagName);
		if (idx < 0) return;
		Login.user.tags.splice(idx, 1);
		Kokorahen.writeUser(Login.user);
		Login.refresh();
		alert("'"+tagName+"' を削除しました。");
		Util.backPage();
	}	

	function makeList()  {
		var div = $(Class.PAGE).find(LIST_ID);
		div.html("");
		
		var list = Login.user.tags;
		if (list == null || list.length == 0) {
			div.html("タグは未定義です。");
			return;
		}
	
		var ul = $('<ul data-role="listview" data-inset="true" ></ul>');
		div.append(ul);
		
		for (var i=0; i<list.length; i++) {
			ul.append($(getListItem(list[i])));
		}
		ul.listview();
	}
	function getListItem(tagName) {
		return LIST_ITEM.replace(/[$][{]tagName[}]/, tagName);
	}
	
});
