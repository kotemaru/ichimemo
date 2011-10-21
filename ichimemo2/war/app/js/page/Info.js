var Info = Page.def(function Info(){}, function(Class){

Class.init = function()  {
}

Class.onBeforeShow = function() {
	Util.setNavbar(Class.ID);
}

});

