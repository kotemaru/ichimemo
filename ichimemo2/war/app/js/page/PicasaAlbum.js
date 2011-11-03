Page.def(function PicasaAlbum(){}, function(Class){
	
	ALBUMS_DIV = ".PicasaAlbumDiv";
	PHOTOS_DIV = ".PicasaPhotoDiv";
	BACK_BTN = ".PicasaAlbumBack";
	AREAT_DIV = ".PicasaAreatDiv";
	albumid = null;
	target = null;
	
	Class.init = function() {
	}
	Class.go = function(tgt) {
		target = tgt;
		albumid = null;
		Util.changePage(Class.ID);
	}
	
	Class.onBeforeShow = function() {
		var $page = $(Class.PAGE);
		$page.find(ALBUMS_DIV).hide();
		$page.find(PHOTOS_DIV).hide();
		$page.find(BACK_BTN).hide();
		if (Login.user.googleUser == null 
				|| Login.user.googleUser=="") {
			$page.find(AREAT_DIV).show();
			return;
		}
		
		$(AREAT_DIV).hide();
		if (albumid == null) {
			Class.showAlbums();
		} else {
			Class.showPhotos(albumid);
		}
	}
	Class.showAlbums = function() {
		albumid = null;
		Picasa.listAlbum(Login.user.googleUser, function(list) {
			var html = "";
			for (var i=0; i<list.length; i++) {
				html += "<img class='ui-shadow ui-btn-up-c' src='"
					+list[i].thumbnail+"' "
					+"onclick='PicasaAlbum.showPhotos(\""+list[i].albumid+"\")'/>";
			}
			var $page = $(Class.PAGE);
			$page.find(ALBUMS_DIV+" div").html(html);
			$page.find(ALBUMS_DIV).show(1000);
			$page.find(PHOTOS_DIV).hide(1000);
			$page.find(BACK_BTN).hide();
		});
	}
	
	Class.showPhotos = function(aid) {
		albumid = aid;
		Picasa.listPhoto(Login.user.googleUser, albumid, function(list) {
			var html = "";
			for (var i=0; i<list.length; i++) {
				html += "<span class='ui-shadow ui-btn-up-c' ><p><img src='"
					+list[i].thumbnail+"' "
					+"onclick='PicasaAlbum.onItemClick(\""+list[i].thumb2+"\")'/>"
					+"</p></span>";
			}
			var $page = $(Class.PAGE);
			$page.find(PHOTOS_DIV+" div").html(html);	
			$page.find(ALBUMS_DIV).hide(1000);
			$page.find(PHOTOS_DIV).show(1000);
			$page.find(BACK_BTN).show();
		});
	}
	
	
	Class.onItemClick = function(url) {
		$(target).val(url).attr('src', url);
		$(Class.PAGE).dialog("close");
	}

});