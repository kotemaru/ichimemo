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

	Class.init = function() {
		spotBrief = new SpotBrief().init(Class.PAGE);
		var $page = $(Class.PAGE);
		var $form = $page.find("form");
		$form.find(TODO).live('change',function(){
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
		Class.onFaceClick(data.myAppraise);
		
		Util.changePage(Class.ID);
	}
	
	Class.onBeforeShow = function() {
		var spot = Spot.getSpotForId(currentSpotId);
		spotBrief.setSpot(spot);
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
		Spot.clearCache();
		Util.backPage();
	}

});