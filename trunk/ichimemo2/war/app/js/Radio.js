Module.def(window,function Radio(xpath, callback){
	this.xpath = xpath;
	this.callback = callback;
	this.init();
},function(Class) {
	var ACTIVE_BTN = "ui-btn-active";
	var Instance = Class.prototype;

	Instance.init = function() {
		var div = $(this.xpath);

		div.attr({
			"data-role":"controlgroup", 
			"data-type":"horizontal", 
			"align":"center"
		});

		var _this = this;
		div.find("a").attr({
			href:"#", "data-role":"button",
		}).live('click', function(ev) {
			_this.onclick(ev, this);
		});

		
		var defo = div.find("a[checked='true']");
		if (defo.length > 0) {
			this.value = defo.attr('value');
		} else {
			this.value = div.find("a:first").attr('value');
		}
	}
	Instance.onclick = function(ev, ui) {
		var val = $(ui).attr('value');
		if (this.value != val) {
			this.value = val;
			if (this.callback) this.callback(val, this);
		} 
		this.refresh();
	}
	
	Instance.refresh = function() {
		var div = $(this.xpath);
		div.find("a").removeClass(ACTIVE_BTN);
		div.find("a[value='"+this.value+"']").addClass(ACTIVE_BTN);
	}
	Instance.setValue = function(val) {
		this.value = val;
	}
	Instance.getValue = function() {
		return this.value;
	}
		
});