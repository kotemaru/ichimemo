
var SpotTags = Page.def(function SpotTags(){}, function(Class){

Class.SELECTOR = "#spotTagsList";
Class.button = null;

Class.init = function() {
	var tagTree = 
	[
		"めし処",[
			"ラーメン",[
				"醤油ラーメン",
				"味噌ラーメン",
				"豚骨ラーメン",
				"塩ラーメン",
				"二郎系",
			],
			"カレー",[
				"インドカレー",
				"アジアンカレー",
				"洋風カレー",
			],
		],
		"飲み処",[
			"酒",[
				"日本酒",
				"焼酎",
				"ワイン",
				"ビール",
				"洋酒",
			],
			"居酒屋",[
				"和風居酒屋",
				"洋風居酒屋",
				"和民",
			],
			"バー"
		],
	];
	Class.selector = new Selector(Class.SELECTOR, tagTree);
}
Class.searchTags = [];
Class.formTags = [];
Class.openMode = null;


Class.onBeforeShow = function() {
	Class.selector.refresh();
}
Class.open = function(btn, placeMsg, mode) {
	Class.button = btn;
	Class.placeMsg = placeMsg;
	Class.openMode  = mode;
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
	var span = $(".ui-btn-text",$(btn));
	span.text(label);
}

Class.getSearchTag = function() {
	if (Class.searchTags.length == 0) return null;
	return Class.searchTags[0];
}

});
