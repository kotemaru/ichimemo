

var Kokorahen = {};

Kokorahen.__URL = "/classes/org/kotemaru/kokorahen/jsrpc/Kokorahen";

Kokorahen.appraiseTask = function(spotId){
	return JSRPC.call(Kokorahen.__URL, "appraiseTask", arguments);
}
Kokorahen.appraiseTaskAsync = function(_callback ,spotId){
	return JSRPC.callAsync(Kokorahen.__URL, "appraiseTask", arguments);
}
Kokorahen.deleteDummyData = function(){
	return JSRPC.call(Kokorahen.__URL, "deleteDummyData", arguments);
}
Kokorahen.deleteDummyDataAsync = function(_callback ){
	return JSRPC.callAsync(Kokorahen.__URL, "deleteDummyData", arguments);
}
Kokorahen.fromGooglePlace = function(map){
	return JSRPC.call(Kokorahen.__URL, "fromGooglePlace", arguments);
}
Kokorahen.fromGooglePlaceAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "fromGooglePlace", arguments);
}
Kokorahen.getKana = function(kanji){
	return JSRPC.call(Kokorahen.__URL, "getKana", arguments);
}
Kokorahen.getKanaAsync = function(_callback ,kanji){
	return JSRPC.callAsync(Kokorahen.__URL, "getKana", arguments);
}
Kokorahen.getLoginUser = function(){
	return JSRPC.call(Kokorahen.__URL, "getLoginUser", arguments);
}
Kokorahen.getLoginUserAsync = function(_callback ){
	return JSRPC.callAsync(Kokorahen.__URL, "getLoginUser", arguments);
}
Kokorahen.getMemo = function(userId,spotId){
	return JSRPC.call(Kokorahen.__URL, "getMemo", arguments);
}
Kokorahen.getMemoAsync = function(_callback ,userId,spotId){
	return JSRPC.callAsync(Kokorahen.__URL, "getMemo", arguments);
}
Kokorahen.getReview = function(id){
	return JSRPC.call(Kokorahen.__URL, "getReview", arguments);
}
Kokorahen.getReviewAsync = function(_callback ,id){
	return JSRPC.callAsync(Kokorahen.__URL, "getReview", arguments);
}
Kokorahen.getSpot = function(id){
	return JSRPC.call(Kokorahen.__URL, "getSpot", arguments);
}
Kokorahen.getSpotAsync = function(_callback ,id){
	return JSRPC.callAsync(Kokorahen.__URL, "getSpot", arguments);
}
Kokorahen.getSpots = function(map){
	return JSRPC.call(Kokorahen.__URL, "getSpots", arguments);
}
Kokorahen.getSpotsAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "getSpots", arguments);
}
Kokorahen.getUserModelPublic = function(id){
	return JSRPC.call(Kokorahen.__URL, "getUserModelPublic", arguments);
}
Kokorahen.getUserModelPublicAsync = function(_callback ,id){
	return JSRPC.callAsync(Kokorahen.__URL, "getUserModelPublic", arguments);
}
Kokorahen.googleCallback = function(){
	return JSRPC.call(Kokorahen.__URL, "googleCallback", arguments);
}
Kokorahen.googleCallbackAsync = function(_callback ){
	return JSRPC.callAsync(Kokorahen.__URL, "googleCallback", arguments);
}
Kokorahen.init = function(){
	return JSRPC.call(Kokorahen.__URL, "init", arguments);
}
Kokorahen.initAsync = function(_callback ){
	return JSRPC.callAsync(Kokorahen.__URL, "init", arguments);
}
Kokorahen.isSaveSession = function(){
	return JSRPC.call(Kokorahen.__URL, "isSaveSession", arguments);
}
Kokorahen.isSaveSessionAsync = function(_callback ){
	return JSRPC.callAsync(Kokorahen.__URL, "isSaveSession", arguments);
}
Kokorahen.listAllSpot = function(){
	return JSRPC.call(Kokorahen.__URL, "listAllSpot", arguments);
}
Kokorahen.listAllSpotAsync = function(_callback ){
	return JSRPC.callAsync(Kokorahen.__URL, "listAllSpot", arguments);
}
Kokorahen.listFollowSpot = function(map){
	return JSRPC.call(Kokorahen.__URL, "listFollowSpot", arguments);
}
Kokorahen.listFollowSpotAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "listFollowSpot", arguments);
}
Kokorahen.listNearSpot = function(lat,lng,limit){
	return JSRPC.call(Kokorahen.__URL, "listNearSpot", arguments);
}
Kokorahen.listNearSpotAsync = function(_callback ,lat,lng,limit){
	return JSRPC.callAsync(Kokorahen.__URL, "listNearSpot", arguments);
}
Kokorahen.listReview = function(spotId,follows){
	return JSRPC.call(Kokorahen.__URL, "listReview", arguments);
}
Kokorahen.listReviewAsync = function(_callback ,spotId,follows){
	return JSRPC.callAsync(Kokorahen.__URL, "listReview", arguments);
}
Kokorahen.listTimeline = function(map){
	return JSRPC.call(Kokorahen.__URL, "listTimeline", arguments);
}
Kokorahen.listTimelineAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "listTimeline", arguments);
}
Kokorahen.listTimeline = function(userId,spotId,limit){
	return JSRPC.call(Kokorahen.__URL, "listTimeline", arguments);
}
Kokorahen.listTimelineAsync = function(_callback ,userId,spotId,limit){
	return JSRPC.callAsync(Kokorahen.__URL, "listTimeline", arguments);
}
Kokorahen.login = function(provider){
	return JSRPC.call(Kokorahen.__URL, "login", arguments);
}
Kokorahen.loginAsync = function(_callback ,provider){
	return JSRPC.callAsync(Kokorahen.__URL, "login", arguments);
}
Kokorahen.loginGoogle = function(url){
	return JSRPC.call(Kokorahen.__URL, "loginGoogle", arguments);
}
Kokorahen.loginGoogleAsync = function(_callback ,url){
	return JSRPC.callAsync(Kokorahen.__URL, "loginGoogle", arguments);
}
Kokorahen.logout = function(provider){
	return JSRPC.call(Kokorahen.__URL, "logout", arguments);
}
Kokorahen.logoutAsync = function(_callback ,provider){
	return JSRPC.callAsync(Kokorahen.__URL, "logout", arguments);
}
Kokorahen.removeSpot = function(spotId){
	return JSRPC.call(Kokorahen.__URL, "removeSpot", arguments);
}
Kokorahen.removeSpotAsync = function(_callback ,spotId){
	return JSRPC.callAsync(Kokorahen.__URL, "removeSpot", arguments);
}
Kokorahen.setHttpServletRequest = function(req){
	return JSRPC.call(Kokorahen.__URL, "setHttpServletRequest", arguments);
}
Kokorahen.setHttpServletRequestAsync = function(_callback ,req){
	return JSRPC.callAsync(Kokorahen.__URL, "setHttpServletRequest", arguments);
}
Kokorahen.setHttpServletResponse = function(res){
	return JSRPC.call(Kokorahen.__URL, "setHttpServletResponse", arguments);
}
Kokorahen.setHttpServletResponseAsync = function(_callback ,res){
	return JSRPC.callAsync(Kokorahen.__URL, "setHttpServletResponse", arguments);
}
Kokorahen.setInvalid = function(id){
	return JSRPC.call(Kokorahen.__URL, "setInvalid", arguments);
}
Kokorahen.setInvalidAsync = function(_callback ,id){
	return JSRPC.callAsync(Kokorahen.__URL, "setInvalid", arguments);
}
Kokorahen.setLoginUser = function(name){
	return JSRPC.call(Kokorahen.__URL, "setLoginUser", arguments);
}
Kokorahen.setLoginUserAsync = function(_callback ,name){
	return JSRPC.callAsync(Kokorahen.__URL, "setLoginUser", arguments);
}
Kokorahen.twitterCallback = function(){
	return JSRPC.call(Kokorahen.__URL, "twitterCallback", arguments);
}
Kokorahen.twitterCallbackAsync = function(_callback ){
	return JSRPC.callAsync(Kokorahen.__URL, "twitterCallback", arguments);
}
Kokorahen.writeMemo = function(map){
	return JSRPC.call(Kokorahen.__URL, "writeMemo", arguments);
}
Kokorahen.writeMemoAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "writeMemo", arguments);
}
Kokorahen.writeReview = function(map){
	return JSRPC.call(Kokorahen.__URL, "writeReview", arguments);
}
Kokorahen.writeReviewAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "writeReview", arguments);
}
Kokorahen.writeSpot = function(map){
	return JSRPC.call(Kokorahen.__URL, "writeSpot", arguments);
}
Kokorahen.writeSpotAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "writeSpot", arguments);
}
Kokorahen.writeTestSpot = function(map){
	return JSRPC.call(Kokorahen.__URL, "writeTestSpot", arguments);
}
Kokorahen.writeTestSpotAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "writeTestSpot", arguments);
}
Kokorahen.writeUser = function(map){
	return JSRPC.call(Kokorahen.__URL, "writeUser", arguments);
}
Kokorahen.writeUserAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "writeUser", arguments);
}
Kokorahen.writeUserDebug = function(map){
	return JSRPC.call(Kokorahen.__URL, "writeUserDebug", arguments);
}
Kokorahen.writeUserDebugAsync = function(_callback ,map){
	return JSRPC.callAsync(Kokorahen.__URL, "writeUserDebug", arguments);
}
