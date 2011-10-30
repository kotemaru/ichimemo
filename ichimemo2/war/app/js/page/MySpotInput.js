var MySpotInput = Page.def(function MySpotInput(){}, function(Class){
	var Instance = Class.prototype;
	
	var APPRAISE = "input[name='appraise']";
	var TODO = "input[name='todo']";
	var FACE_MARK_TEXT = [
		"未",
		"まずそー",
		"いまいちそー",
		"ふつうそー",
		"うまそー",
		"めちゃうまそー",
	];
	
	var spotBrief = null;
	var currentSpotId = null;
	var currentSpot = null;
	var radioTodo = null;

	Class.init = function() {
		var $page = $(Class.PAGE);
		spotBrief = new SpotBrief().init(Class.PAGE);
		radioTodo = new Radio($page.find(".Todo")[0], function(){
			Class.onFaceClick();
		});
	}
	
	Class.go = function(spotId) {
		currentSpotId = spotId;
		currentSpot = Spot.getSpotForId(spotId);
		var data = currentSpot.data;
		var $page = $(Class.PAGE);

		var tags = (data.myTags==null) ? data.tags : data.myTags;
		SpotTags.setValue(SpotTags.MYSPOT, tags);
		SpotTags.setLabel($page.find(".tags"), tags, "ジャンル選択(複数可)");
		$page.find(TODO).val([data.checked?"checked":"todo"]);
		if (data.myAppraise) {
			Class.onFaceClick(data.myAppraise);
		} else {
			Class.onFaceClick(3);
		}
		
		Util.changePage(Class.ID);
	}
	
	Class.onBeforeShow = function() {
		var $page = $(Class.PAGE);
		var spot = Spot.getSpotForId(currentSpotId);
		spotBrief.setSpot(spot);
		if (spot.data.myAppraise) {
			$page.find("a.WriteBtn").hide();
			$page.find("a.UpdateBtn").show();
			$page.find("a.DeleteBtn").show();
		} else {
			$page.find("a.WriteBtn").show();
			$page.find("a.UpdateBtn").hide();
			$page.find("a.DeleteBtn").hide();
		}
		radioTodo.refresh();
		Util.setNavbar(Class.PAGE);
	}
	
	Class.onFaceClick = function(n) {
		var $page = $(Class.PAGE);
		var $form = $page.find("form");
		if (undefined == n) {
			n = $form.find(APPRAISE).val();
		}
		
		var faces = $page.find(".Faces img.FaceMark");
		for (var i=0; i<faces.length; i++) {
			$(faces[i]).width(16);
		}
		if (n>0) $(faces[n-1]).width(32);
		var $todo = $form.find(TODO).filter(":checked");
		if ($todo.val() == "todo") {
			$page.find(".FaceMarkText").text(FACE_MARK_TEXT[n]);
		} else {
			$page.find(".FaceMarkText").text(Review.FACE_MARK_TEXT[n]);
		}
		$form.find(APPRAISE).val(n);
	}
	
	Class.write = function() {
		var $page = $(Class.PAGE);
		var $form = $page.find("form");
		var params = {
			spotId: currentSpotId,
			appraise: $form.find(APPRAISE).val(),
			checked: $form.find(TODO).filter(":checked").val() == "checked",
			tags: SpotTags.getValue(SpotTags.MYSPOT),
			temporal: false
		};
		var id = Kokorahen.writeMySpot(params);
		alert("マイスポットに登録しました。"+id);
		Map.clear();
		Util.backPage();
	}
	Class.del = function() {
		var id = Kokorahen.removeMySpot(currentSpotId);
		if (id>0) {
			alert("マイスポットから削除しました。"+id);
		} else {
			alert("削除に失敗しました。"+id);
		}
		Map.clear();
		Util.backPage();
	}
});