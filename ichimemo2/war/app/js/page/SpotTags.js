
Page.def(function SpotTags(){}, function(Class){
	
	var TAG_TREE = [
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
			]
	];
	Class.MYSPOT = "myspot";
	Class.SEARCH = "search";
	Class.SPOT = "spot";

	var button = null;
	var openMode = null;
	var placeMsg = null;
	var selectorMy = null;
	var selector = null;
	var values = {
		search: [],
		spot: [],
		myspot: []
	};

	
	Class.onBeforeShow = function() {
		var sel = getSelector(openMode);
		sel.refresh();
	}
	Class.open = function(btn, placeMsg, mode) {
		button = btn;
		placeMsg = placeMsg;
		openMode = mode;
		var sel = getSelector(openMode);
		sel.isSingle = (openMode == Class.SEARCH);
		sel.setValue(values[mode]);
		Util.dialog(Class.ID);
	}
	
	Class.onHide = function() {
		var sel = getSelector(openMode);
		values[openMode] = sel.getValue();
		setLabel(button, values[openMode], placeMsg);
	}
	
	Class.getSearchTag = function() {
		if (values.search.length == 0) return null;
		return values.search[0];
	}
	
	Class.setValue = function(mode, list) {
		values[mode] = list;
	}
	Class.getValue = function(mode) {
		return values[mode];
	}
	
	Class.refresh = function() {
		selectorMy = null;
	}

	function getSelector(mode) {
		var isMy = (mode == Class.SEARCH || mode == Class.MYSPOT);
		if (isMy) {
			if (selectorMy == null) {
				var tagTree = TAG_TREE;
				if (Login.user.tags != null) {
					tagTree = tagTree.concat(Login.user.tags);
				}
				selectorMy = new Selector($(Class.PAGE).find(".TagListMy")[0], tagTree);
			}
			$(Class.PAGE).find(".TagListMy").show();
			$(Class.PAGE).find(".TagList").hide();
			return selectorMy;
		} else {
			if (selector == null) {
				selector = new Selector($(Class.PAGE).find(".TagList")[0], TAG_TREE);
			}
			$(Class.PAGE).find(".TagList").show();
			$(Class.PAGE).find(".TagListMy").hide();
			return selector;
		}
	}
	function setLabel(btn, list, placeMsg) {
		var label = (list==null) ? "" : list.join(",");
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
	Class.setLabel = setLabel;

});
