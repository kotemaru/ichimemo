function Page() {}
Page.modules = {}
Page.def = function(cls, defFunc) {
	window[cls.name] = Module.def(Page.modules, cls, defFunc);
	return cls;
}

Page.onload = function() {
	for (var name in Page.modules ) {
		Page[name] = Page.init(Page.modules[name]); // 関数のフロパティと衝突注意
	}
}

Page.go = function(m) {
	Util.changePage(m.ID);
}

Page.init = function(m) {
	m.ID = "#"+m.name;
	m.PAGE = document.getElementById(m.name);

	if (m.init != undefined) m.init();

	if (m.go === undefined) {
		m.go = function() {Page.go(this);}
	}

	var $obj = $(m.ID);
	if (m.onBeforeShow) {
		$obj.live('pagebeforeshow', function(ev, ui) {
			try {
				m.onBeforeShow(ev,ui);
			} catch(e) {
				// TODO: 例外が上がるとJQM(b2)が止まる。
				alert(e.message+"\n"+e.stack);
			}
		});
	}
	if (m.onShow) {
		$obj.live('pageshow', function(ev, ui) {
			try {
				m.onShow(ev,ui);
			} catch(e) {
				// TODO: 例外が上がるとJQM(b2)が止まる。
				alert(e.message+"\n"+e.stack);
			}
		});
	}
	if (m.onHide) {
		$obj.live('pagebeforehide', function(ev, ui) {
			try {
				m.onHide(ev,ui);
			} catch(e) {
				// TODO: 例外が上がるとJQM(b2)が止まる。
				alert(e.message+"\n"+e.stack);
			}
		});
	}
	return m;
};
