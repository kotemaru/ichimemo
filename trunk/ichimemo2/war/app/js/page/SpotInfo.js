Page.def(function SpotInfo(){}, function(Class){
	
	var MAP = "#mapCanvas2";
	var MAP_MASK = "#mapCanvas2Mask";
	var HOME_IMG = "/images/Home.png";
	Class.current = null;
	
	var radioGenre = null;

	Class.init = function() {
		$page = $(Class.PAGE);
		
		var mapopts2 = {
				zoom: 18, noClear: true,
				center: Map.DEFAULT_CENTER,
				scaleControl: false, disableDefaultUI: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
		}
	
		Class.map = new google.maps.Map(document.getElementById("mapCanvas2"),mapopts2);
		Class.marker2 = new google.maps.Marker({
			position: Map.DEFAULT_CENTER, map: Class.map,
			draggable: true
		});
		google.maps.event.addListener(Class.map, 'idle', Class.onMap2Idle);
		google.maps.event.addListener(Class.map, 'click', Class.onMap2Click);
	
		$(MAP_MASK).click( function(){
			$(document.spot.address).focus();
		});
		$(Class.ID).click( function(){
			$(document.spot).blur();
		});
	
		var form = document.spot;
		$(form.address).focus( function(){
			$(MAP_MASK).hide();
		}).blur( function(){
			$(MAP_MASK).show();
			Class.searchAddr(form.address.value);
		});
	
		$(form.name).blur(Class.onNameBlur);
	
		$(form.timeLunchMax).focus(function(ev) {
			var min = $(form.timeLunchMin);
			var max = $(this);
			if (min.val() > max.val()) {
				max.val(min.val());
				//max.selectmenu("refresh");
				max.blur();
				max.focus();
			}
		});
		$(form.timeDinnerMax).focus(function(ev) {
			var min = $(form.timeDinnerMin);
			var max = $(this);
			if (min.val() > max.val()) {
				max.val(min.val());
				//max.selectmenu("refresh");
				max.blur();
				max.focus();
			}
		});
	
		function getTimeHtml(start, end) {
			var html = "";
			for (var h=start; h<=end; h++) {
				var hh = ("0"+h).match(/[0-9]{2}$/)[0];
				for (var m=0; m<60; m+=30) {
					var hhmm = hh + ":" + ("0"+m).match(/[0-9]{2}$/)[0];
					html += "<option>"+hhmm+"</option>"
				}
			}
			return html;
		}
		
		var optNil = "<option value=''>--:--</option>";
		var opt0_6   = getTimeHtml(0,6);
		var opt7_13  = getTimeHtml(7,13);
		var opt14_23 = getTimeHtml(14,23);
		var opt24_30 = getTimeHtml(24,30);
	
		var lunch = optNil+opt7_13+opt14_23+opt0_6;
		var dinner = optNil+opt14_23+opt24_30+opt7_13;
		$(form.timeLunchMin).html(lunch);
		$(form.timeLunchMax).html(lunch);
		$(form.timeDinnerMin).html(dinner);
		$(form.timeDinnerMax).html(dinner);
		
		radioGenre = new Radio($page.find(".Genre"));
	}
	Class.go = function(id) {
		if (id != undefined) {
			Class.setCurrent(Spot.getSpotForId(id));
		}
		Util.changePage(Class.ID);
	}
	
	Class.onClassMarkerClick = function(ev) {
		Class.setCurrent(this.spot);
		if (Class.current == null) return;
		var addr = Class.current.data.address.replace(/^日本,/,"");
		var msg = "<div class='BalloonLine1'>"+Class.current.data.name+"</div>"
			+"<div class='BalloonLine2'>"+addr+"</div>";
		Map.infobox.open(this, msg);
	}
	Class.onMap2Click = function(ev) {
		Class.marker2.setPosition(ev.latLng);
		Class.marker2.setVisible(true);
		Class.setSpotPos(Class.marker2.getPosition());
		//Class.map.setCenter(Class.marker2.getPosition());
	}
	Class.onMap2Idle = function(ev) {
		$("//a[target='_blank']").attr("href","#");
	}
	
	Class.onNameBlur = function(ev) {
		var spotForm = document.spot;
		if (spotForm.name.value != ""
			&& spotForm.furikana.value == "") {
			Kokorahen.getKanaAsync({
				success:function(kana){
					if (spotForm.furikana.value == "") {
						spotForm.furikana.value = kana;
					}
				}
			}, spotForm.name.value);
		}
	}
	
	Class.setCurrent = function(cur){
		Class.current = cur;
		var pos;
	
		var spotForm = document.spot;
		var spotImage = $(Class.PAGE).find(".Thumbnail img");
		spotImage.attr("src", HOME_IMG);
	
		var sd = Class.current.data;
		if (sd == null) {
			pos = Class.current.marker.getPosition();
	
			for (var i=0; i<spotForm.length; i++) {
				spotForm[i].value = "";
			}
			radioGenre.setValues([Genre.getGenre()]);
			SpotTags.setValue("spot",[]);
			ClosedDays.clear();
			Class.setSpotPos(pos);
	
			$("#spotReviewBtn").hide();
	
		} else {
			pos = new google.maps.LatLng(sd.lat, sd.lng);
	
			for (var key in sd) {
				if (spotForm[key]) spotForm[key].value = sd[key];
			}
			radioGenre.setValues(sd.genres);
			SpotTags.setValue("spot",sd.tags);
			if (sd.closedDay != null) {
				ClosedDays.setValue(sd.closedDay.split(","));
			}
			
			if (sd.image != null && sd.image != "") {
				spotImage.attr("src", sd.image);
			}
			$("#spotReviewBtn").show();
		}
	
		Class.marker2.setPosition(pos);
		//Class.marker2.setVisible(true);
		//Class.map.setCenter(pos);
	};
	
	//Class.onBeforeShow = function(ev, info){
		//Util.dialogFinally();
	//}
	
	Class.onShow = function(ev, info){
		Util.dialogFinally();
		// Note: 地図が初期状態で非表示だと誤動作するのでその対処。
		google.maps.event.trigger(Class.map, "resize");
		Class.marker2.setVisible(true);
		Class.map.setCenter(Class.marker2.getPosition());
	
		SpotTags.setLabel($("#spotTags")[0],SpotTags.getValue("spot"),"タグ選択");

		radioGenre.refresh();
		ClosedDays.updateLabel();
		Util.setNavbar(Class.PAGE);
	};
	
	Class.searchAddr = function(addr){
		var spotForm = document.spot;
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({address: addr, region:"JP"}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK){
				var pos = results[0].geometry.location;
				Class.marker2.setPosition(pos);
				Class.map.setCenter(pos);
				Class.setSpotPos(results[0].geometry.location);
			} else {
				spotForm.address.value = "???";
			}
		});
	}
	
	Class.setSpotPos = function(pos){
		var spotForm = document.spot;
		spotForm.lat.value = pos.lat();
		spotForm.lng.value = pos.lng();
	
		// 座標から住所を取得しinputタグに設定。
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({latLng: pos}, function(results, status){
			var addr = "???";
			if(status == google.maps.GeocoderStatus.OK){
				addr = results[0].formatted_address;
				addr = addr.replace(/^[^,]*[,][ ]/,"");
				if (spotForm.address.value != addr) {
					checkExistSpot(addr);
				}
			}
			spotForm.address.value = addr;
			spotForm.address.scrollLeft = 1000;
		});
	};

	function checkExistSpot(addr) {
		Kokorahen.listSpotForAddrAsync(function(list){
			if (list.length > 0) {
				var msg = "住所: "+addr
					+"\nこの住所にはスポットが "
					+list.length+"件存在します。"
					+"\n重複を確認しますか？"
				if(confirm(msg)){
					ExistSpot.go(addr, list);
				}
			}
		}, {address:addr, genre:Genre.getGenre()});
	} 


	Class.write = function(){
		var params = {};
		var elems = document.spot.elements;
		for (var i=0; i<elems.length; i++) {
			params[elems[i].name] = elems[i].value;
		}
		params.image = $(Class.PAGE).find(".Thumbnail img").attr('src');
		if (/^\/images/.test(params.image)) params.image = null;
		
		params.genres = radioGenre.getValues();
		params.tags = SpotTags.getValue("spot");
		params.closedDay = ClosedDays.getValue().join(",");

		if (params.name == null || params.name == ""
			|| params.furikana == null || params.furikana == ""
			|| params.address == null || params.address == ""
			|| params.genres == null || params.genres.length == 0
		) {
			alert("必須項目が入力されていません。");
			return;
		}


		var id = Kokorahen.writeSpot(params);
		alert("登録しました。("+id+")");
		Spot.clearCache();
		List.go();
	}
	
	Class.remove = function(){
		var msg = Kokorahen.removeSpot(Class.current.data.id);
		if (msg == null) {
			alert("スポットを削除しました。");
			Spot.clearCache();
			List.go();
		} else {
			alert("スポットの削除に失敗しました。("+msg+")");
		}
	}
	Class.setDefaultPhoto = function(img)  {
		img.src = "/images/Home.png";
	}
});
