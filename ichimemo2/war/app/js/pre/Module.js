function Module() {}
Module.defs = [];
Module.def = function(pkg, cls, defFunc) {
	Module.defs.push({
		pkg:pkg, cls:cls, defFunc:defFunc
	});
	return cls;
}

Module.onload = function() {
	for (var i=0; i<Module.defs.length; i++) {
		var def = Module.defs[i];
		def.defFunc(def.cls);
		def.pkg[def.cls.name] = def.cls;
	}
}

