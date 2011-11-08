Module.def(window, function Picasa(){}, function(Class){
		
	var URL_ALBUM = 
		"http://picasaweb.google.com/data/feed/api/user/${user}"
		+"?kind=album&alt=json";
	var URL_PHOTO = 
		"http://picasaweb.google.com/data/feed/api/user/${user}"
		+"/albumid/${albumid}?alt=json";
	
	Class.listAlbum = function(user,  callback)
	{
		var url = URL_ALBUM.replace(/[$][{]user[}]/,user);
		$.getJSON(url, null, function(json, state) {
			if (state != "success") {
				alert("Picasa access error.");
				return;
			}

			var list = [];
			for (var i=0; i<json.feed.entry.length; i++) {
				var e = json.feed.entry[i];
				if (e.gphoto$access.$t == "public") {
					list.push({
						thumbnail: e.media$group.media$thumbnail[0].url,
						albumid: e.gphoto$id.$t
					});
				}
			}
			callback(list);
		});
	}
	
	Class.listPhoto = function(user, albumid, callback)
	{
		var url = URL_PHOTO.replace(/[$][{]user[}]/,user);
		url = url.replace(/[$][{]albumid[}]/,albumid);
	
		$.getJSON(url, null, function(json, state) {
			if (state != "success") {
				alert("Picasa access error.");
				return;
			}

			var list = [];
			if (json.feed.entry == null) {
				callback(list);
				return;
			}
			for (var i=0; i<json.feed.entry.length; i++) {
				var e = json.feed.entry[i];
				if (e.gphoto$access.$t == "public") {
					list.push({
						thumbnail: e.media$group.media$thumbnail[0].url,
						//w:e.media$group.media$thumbnail[0].width,
						//h:e.media$group.media$thumbnail[0].height,
						src: e.content.src,
						thumb2: e.media$group.media$thumbnail[1].url,
					});
				}
			}
			callback(list);
		});
	}
});
