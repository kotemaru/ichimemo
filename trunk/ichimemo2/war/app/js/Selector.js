Module.def(window,function Selector(xpath, tree){
	this.xpath = xpath;
	this.mapping = {};
	this.values = {};
	this.isSingle = false;

	var sel = $(xpath);
	var html = this.tree2html(tree,"",0);
	sel.html(html);
	sel.data("Selector", this);
},function(Class) {
	var Instance = Class.prototype;
	
	Instance.tree2html = function(tree, parent, indent) {
		var html = "";
		for (var i=0; i<tree.length; i++) {
			var key = tree[i];
			var val = parent+"/"+key;
			html += "<li data-icon='checkbox-off' parent='"+parent+"' val='"+val+"'"
			+" onclick='Selector.onClick(event,this)'"
						+"><a href='#'"
						+" style='margin-left:"+(indent*2)+"em;'>"
						+key+"</a></li>";
	
			if (typeof tree[i+1] == "object") {
				html += this.tree2html(tree[++i], val, indent+1);
			}
			this.mapping[key] = val;
			//this.values[val] = false;
		}
		return html;
	}
	
	Instance.setValue = function(list) {
		this.values = {};
		if (list == null) return;
		for (var i=0; i<list.length; i++) {
			var val = this.mapping[list[i]];
			if (val != null) {
				this.values[val] = true;
			}
		}
	}
	Instance.clear = function() {
		this.values = {};
	}
	Instance.getValue = function() {
		var list = [];
		for (var val in this.values) {
			if (this.values[val]) {
				list.push(val.match(/[^/]*$/)[0]);
			}
		}
		return list;
	}
	
	Instance.refresh = function() {
		var sel = $(this.xpath);
		var lis = sel.find("li");
		var values = this.values;

		sel.find("li[parent!='']").hide();
		lis.each(function(){
			var li = $(this).removeClass( "ui-btn-active");
			var val = li.attr("val");
			var icon = li.find(".ui-icon")
				.removeClass( "ui-icon-checkbox-on")
				.removeClass( "ui-icon-checkbox-off");
			
			var val = li.attr("val");
			if (values[val]) {
				li.addClass( "ui-btn-active" );
				icon.addClass( "ui-icon-checkbox-on" );
				showItem(sel, val);
			} else {
				icon.addClass( "ui-icon-checkbox-off" );
			}
		});
	}
	function showItem(sel, val) {
		console.log("=-===>"+sel+","+val+","+val.length);
		if (val.length <= 1) return;
		sel.find("li[parent='"+val+"']").show();
		showItem(sel, val.replace(/[/][^/]*$/,""));
	}
	
	Class.onClick = function(ev, ui) {
		//var li = $(ev.target).parents("li");
		var li = $(ui);
		var sel = li.parent("ul");
		var val = li.attr("val");
		var _this = sel.data("Selector");
	
		if (_this.isSingle) {
			var flag = !_this.values[val];
			_this.values = {};
			_this.values[val] = flag;
			_this.refresh();
			return;
		}
		
		var values = _this.values;
		var flag = !values[val];
		values[val] = flag;
		if (flag) {
			// 祖先をtrueにする
			while(val.length > 0) {
				values[val] = true;
				val = val.replace(/[/][^/]*$/,"");
			}
		} else {
			// 子孫をfalseにする
			var prefix = val+"/";
			for (var v in values) {
				if (v.indexOf(prefix) == 0) {
					values[v] = false;
				}
			}
		}
		_this.refresh();	
		var xxx = sel.find("li[parent='"+val+"']");
		xxx.show();
	}

});