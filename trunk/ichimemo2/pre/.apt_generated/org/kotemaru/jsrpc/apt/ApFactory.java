package org.kotemaru.jsrpc.apt;

import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.*;
import java.lang.reflect.*;

import org.kotemaru.apthelper.AptUtil;
import org.kotemaru.apthelper.MultiAp;

import com.sun.mirror.apt.AnnotationProcessor;
import com.sun.mirror.apt.AnnotationProcessorEnvironment;
import com.sun.mirror.apt.AnnotationProcessorFactory;
import com.sun.mirror.apt.AnnotationProcessors;
import com.sun.mirror.declaration.AnnotationTypeDeclaration;

public class ApFactory implements AnnotationProcessorFactory {
	private static final List OPTIONS = new ArrayList(0);
	private static  List<String> TYPES = new ArrayList(1);
	static {
		TYPES.add("org.kotemaru.jsrpc.annotation.*");
	}

	public Collection supportedOptions() {
		return OPTIONS;
	}

	public Collection<String> supportedAnnotationTypes() {
		return TYPES;
	}

	public AnnotationProcessor getProcessorFor(
			Set<AnnotationTypeDeclaration> atds, AnnotationProcessorEnvironment env) {
		return new MultiAp(atds, env, "org.kotemaru.jsrpc.annotation");
	}
}
