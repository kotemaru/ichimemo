
var SpotTags = Page.def(function SpotTags(){}, function(Class){

Class.SELECTOR = "#spotTagsList";
Class.button = null;

	var TAG_TREE = 
	[
		"食事",[
		      "和食",
		      "洋食",
		      "中華料理",
		      "イタリアン",
		      "フレンチ",
		      "エスニック",
		      "ラーメン",
		      "カレー",
		],
		"呑む",[
			      "日本酒",
			      "焼酎",
			      "ワイン",
			      "ビール",
			],
		"喫茶",[
		      "コーヒー",
		      "紅茶",
		      "日本茶",
		      "スイーツ",
		      "軽食",
		],
		"買物",[
		      "百貨店",
		      "スーパー",
		      "コンビニ",
		      "ドラッグショップ",
		      "100円ショップ",
		      "衣料品",
		      "生活雑貨",
		      "酒屋"
		],
		"行楽",[
		      "公園",
		      "イベント",
		      "カラオケ",
		      "映画",
		],
		"病院",[
		      "内科",
		      "外科",
		      "小児科",
		      "産婦人科",
		      "耳鼻科",
		      "眼科",
		      "皮膚科",
		],
	];
Class.searchTags = [];
Class.formTags = [];
Class.openMode = null;


Class.onBeforeShow = function() {
	Class.selector.refresh();
}
Class.open = function(btn, placeMsg, mode) {
	if (Class.selector == null) {
		if (Login.user.tags != null) {
			tagTree = TAG_TREE.concat(Login.user.tags);
		}
		Class.selector = new Selector(Class.SELECTOR, tagTree);
	}

	Class.button = btn;
	Class.placeMsg = placeMsg;
	Class.openMode = mode;
	if (mode == "search") {
		Class.selector.setValue(Class.searchTags);
		Class.selector.isSingle = true;
	} else {
		Class.selector.setValue(Class.formTags);
		Class.selector.isSingle = false;
	}

	Util.dialog(Class.ID);
}

Class.onHide = function() {
	var list = Class.selector.getValue();
	if (Class.openMode == "search") {
		Class.searchTags = list;
	} else {
		Class.formTags = list;
	}
	Class.setLabel(Class.button,list,Class.placeMsg);
}
Class.setFormTags = function(list) {
	Class.formTags = list;
}
Class.setLabel = function(btn, list, placeMsg) {
	var label = list.join(",");
	if (label == "") label = placeMsg;
	$(btn).each(function(){
		var span = $(this).find(".ui-btn-text");
		if (span.length > 0) {
			span.text(label);
		} else {
			$(this).text(label);
		}
	});
}

Class.getSearchTag = function() {
	if (Class.searchTags.length == 0) return null;
	return Class.searchTags[0];
}

});
