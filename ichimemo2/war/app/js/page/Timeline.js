Page.def(function Timeline(){}, function(Class){
	
	var LIST_DIV = null;
	var LIST_ITEM = null;
	var LIMIT = 30;
	var radioOnly = null;
	var reloadFlag = true;
	
	Class.init = function() {
		var $page = $(Class.PAGE)
		LIST_DIV = $page.find(".ReviewList")[0];
		LIST_ITEM = $page.find(".ReviewList ul").html();
		
		$page.find(".Only").change(reload);
		radioOnly = new Radio($page.find(".Only")[0], reload);
		$page.find(".Search").live('keypress', function(ev){
			if (ev.which === 13) {
				reload();
			}
		});
		$page.find(".Search").live('blur', reload);
	}

	Class.onBeforeShow = function() {
		Util.setNavbar(Class.ID);
		radioOnly.refresh();
		if (reloadFlag) {
			reload();
			reloadFlag = false;
		}
	}
	Class.clear = function(){
		reloadFlag = true;
	}
	
	function reload() {
		$(LIST_DIV).html("Please wait...");
	
		params = {
			tag: SpotTags.getSearchTag(), 
			limit: LIMIT
		};
		if ($(Class.FOLLOW_ONLY).attr('checked') == "checked") {
			params.follows = Login.user.follows;
		} else {
			var curPos = Map.getPosition();
			params.lat = curPos.lat();
			params.lng = curPos.lng();
		}
		params.search = $(Class.PAGE).find(".Search").val();
		
		Kokorahen.listTimelineAsync({
			success: function(list) {
				Review.makeList(LIST_DIV, null, list);
				Util.setNavbar(Class.PAGE);
			}
		}, params);
	}



});

