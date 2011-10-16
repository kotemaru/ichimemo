package org.kotemaru.jsrpc.apt;

import org.apache.velocity.VelocityContext;
import java.lang.annotation.Annotation;

import com.sun.mirror.apt.AnnotationProcessor;
import com.sun.mirror.apt.AnnotationProcessorEnvironment;
import com.sun.mirror.apt.Filer;
import com.sun.mirror.declaration.TypeDeclaration;
import org.kotemaru.apthelper.*;
import org.kotemaru.apthelper.annotation.*;

public class JsRpcAp extends ClassProcessorBase
{
	public JsRpcAp(AnnotationProcessorEnvironment env) {
		super(env);
	}

	public boolean processClass(TypeDeclaration classDecl) throws Exception {
		Annotation anno = classDecl.getAnnotation(org.kotemaru.jsrpc.annotation.JsRpc.class);
		if(anno == null) return false;

		ProcessorGenerate pgAnno =
			org.kotemaru.jsrpc.annotation.JsRpc.class.getAnnotation(ProcessorGenerate.class);

		VelocityContext context = initVelocity();
		//VelocityContext context = new VelocityContext();
		context.put("masterClassDecl", classDecl);
		context.put("annotation", anno);

		Object helper   = getHelper(classDecl, pgAnno.helper());
		context.put("helper", helper);

		String pkgName = getPackageName(classDecl, pgAnno.path());
		String clsName = classDecl.getSimpleName() + pgAnno.suffix();
		String templ = getResourceName(pgAnno.template());
		//String templ = pgAnno.template();

		if (pgAnno.isResource()) {
			applyTemplateText(context, pkgName, clsName, templ);
		} else {
			applyTemplate(context, pkgName, clsName, templ);
		}
		//applyTemplate(context, pkgName, clsName, anno.getClass(), templ);
		return true;
	}

	private String getResourceName(String name) {
		if (name.startsWith("/")) return name;
		if (name.length() == 0) {
			name = "JsRpc.vm";
		}
		String pkg = "org.kotemaru.jsrpc.annotation";
		return pkg.replace('.', '/') +'/'+name;
	}


}
