Module.def(window,function Radio(xpath, vals, labels, opts){
	this.xpath = xpath;
	this.values = vals;
	this.labels = labels
	this.opts = opts;
	this.init(vals, labels);
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

		var html = "";
		for (var i=0; i<this.values.length; i++) {
			html += "<a href='#' data-role='button' "
					+"style='margin-right:0;' "
					+"value='"
					+this.values[i]+"' >"
					+this.labels[i]+"</a>";
		}
		div.html(html);
		var _this = this;
		div.find("a").live('click', function(ev) {
			_this.onclick(ev, this);
		});

		if (this.opts.default) {
			this.value = this.opts.default;
		} else {
			this.value = this.values[0];
		}

	}
	Instance.onclick = function(ev, ui) {
		var val = $(ui).attr('value');
		if (this.value != val) {
			this.value = val;
			if (this.opts.callback) {
				this.opts.callback(val, this);
			}
		} 
		this.refresh();
	}
	
	Instance.refresh = function() {
		var div = $(this.xpath);
		div.find("a").removeClass(ACTIVE_BTN);
		div.find("a[value='"+this.value+"']").addClass(ACTIVE_BTN);
	}
	Instance.getValue = function() {
		return this.value;
	}
		
});