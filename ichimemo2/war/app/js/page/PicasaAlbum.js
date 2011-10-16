var PicasaAlbum = Page.def(function PicasaAlbum(){}, function(Class){

Class.ALBUMS_DIV = ".PicasaAlbumDiv";
Class.PHOTOS_DIV = ".PicasaPhotoDiv";
Class.BACK_BTN = ".PicasaAlbumBack";
Class.AREAT_DIV = ".PicasaAreatDiv";
Class.albumid = null;
Class.target = null;

Class.init = function() {
}
Class.go = function(tgt) {
	Class.target = tgt;
	Class.albumid = null;
	Util.changePage(Class.ID);
}

Class.onBeforeShow = function() {
	var $page = $(Class.PAGE);
	$page.find(Class.ALBUMS_DIV).hide();
	$page.find(Class.PHOTOS_DIV).hide();
	$page.find(Class.BACK_BTN).hide();
	if (Login.user.googleUser == null 
			|| Login.user.googleUser=="") {
		$page.find(Class.AREAT_DIV).show();
		return;
	}
	
	$(Class.AREAT_DIV).hide();
	if (Class.albumid == null) {
		Class.showAlbums();
	} else {
		Class.showPhotos(Class.albumid);
	}
}
Class.showAlbums = function() {
	Class.albumid = null;
	Picasa.listAlbum(Login.user.googleUser, function(list) {
		var html = "";
		for (var i=0; i<list.length; i++) {
			html += "<img class='ui-shadow ui-btn-up-c' src='"
				+list[i].thumbnail+"' "
				+"onclick='PicasaAlbum.showPhotos(\""+list[i].albumid+"\")'/>";
		}
		var $page = $(Class.PAGE);
		$page.find(Class.ALBUMS_DIV+" div").html(html);
		$page.find(Class.ALBUMS_DIV).show(1000);
		$page.find(Class.PHOTOS_DIV).hide(1000);
		$page.find(Class.BACK_BTN).hide();
	});
}

Class.showPhotos = function(albumid) {
	Class.albumid = albumid;
	Picasa.listPhoto(Login.user.googleUser, albumid, function(list) {
		var html = "";
		for (var i=0; i<list.length; i++) {
			html += "<span class='ui-shadow ui-btn-up-c' ><p><img src='"
				+list[i].thumbnail+"' "
				+"onclick='PicasaAlbum.onItemClick(\""+list[i].thumb2+"\")'/>"
				+"</p></span>";
		}
		var $page = $(Class.PAGE);
		$page.find(Class.PHOTOS_DIV+" div").html(html);	
		$page.find(Class.ALBUMS_DIV).hide(1000);
		$page.find(Class.PHOTOS_DIV).show(1000);
		$page.find(Class.BACK_BTN).show();
	});
}


Class.onItemClick = function(url) {
	$(Class.target).val(url);
	$(Class.target).attr('src', url);
	$(Class.PAGE).dialog("close");
}

});