Module.def(window,function Radio(xpath, callback, opts){
	this.xpath = xpath;
	this.callback = callback;
	this.init(opts);
},function(Class) {
	var ACTIVE_BTN = "ui-btn-active";
	var Instance = Class.prototype;

	Instance.init = function(opts) {
		var div = $(this.xpath);

		var opt = div.attr("option");
		this.opts = (opt ? eval('('+opt+')') : {});
		if (opts) {
			for (var k in opts) this.opts[k] = opts[k];
		}

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
			this.values = [];
			for (var i=0; i<defo.length; i++) {
				this.values.push($(defo[i]).attr('value'));
			};
		} else {
			this.values = [div.find("a:first").attr('value')];
		}
	}
	Instance.onclick = function(ev, ui) {
		var val = $(ui).attr('value');
		if (this.opts.multi) {
			var idx = this.values.indexOf(val);
			if (idx >= 0) {
				this.values.splice(idx, 1);
			} else {
				this.values.push(val);
			}
			if (this.callback) this.callback(val, this);
		} else {
			if (this.values[0] != val) {
				this.values[0] = val;
				if (this.callback) this.callback(val, this);
			}
		} 
		
		this.refresh();
	}
	
	Instance.refresh = function() {
		var div = $(this.xpath);
		div.find("a").removeClass(ACTIVE_BTN);
		for (var i=0; i<this.values.length; i++) {
			div.find("a[value='"+this.values[i]+"']").addClass(ACTIVE_BTN);
		}
	}
	Instance.setValue = function(val) {
		this.values[0] = val;
	}
	Instance.getValue = function() {
		return this.values[0];
	}
	Instance.setValues = function(vals) {
		this.values = vals;
	}
	Instance.getValues = function() {
		return this.values;
	}
		
});