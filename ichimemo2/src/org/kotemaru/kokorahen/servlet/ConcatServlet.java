package org.kotemaru.kokorahen.servlet;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.*;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import org.kotemaru.kokorahen.model.ImageModel;
import org.kotemaru.util.IOUtil;
import org.kotemaru.util.json.JSONParser;
import org.kotemaru.util.json.JSONSerializer;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.EntityNotFoundRuntimeException;

import com.google.appengine.api.datastore.Key;

@SuppressWarnings("serial")
public class ConcatServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		try {
		String path = req.getPathInfo().replaceFirst("^/", "app/");

		if (!path.endsWith(".list")) {
			resp.setStatus(404);
			return;
		}
		
		String listStr = IOUtil.getFile(path);
		String[] list = listStr.split("\n");

		OutputStream out = resp.getOutputStream();
		for (int i=0; i<list.length; i++ ) {
			String name = list[i];
			if (name.startsWith("#")) continue;
			if (name.startsWith("@")) {
				String[] kv = name.substring(1).split(":");
				resp.addHeader(kv[0].trim(), kv[1]);
				continue;
			}
			name = name.trim();
			if (name.length() == 0) continue;
			InputStream in = new FileInputStream(name);
			IOUtil.transrate(in, out, true, false);
		}
		out.close();
		} catch (IOException e) {
			e.printStackTrace();
			throw e;
		}
	}
}	