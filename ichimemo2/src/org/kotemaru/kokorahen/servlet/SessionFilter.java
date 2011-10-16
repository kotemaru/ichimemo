package org.kotemaru.kokorahen.servlet;

import java.io.IOException;

import javax.servlet.*;
import javax.servlet.http.*;



public class SessionFilter implements Filter {
	public void init(FilterConfig conf) throws ServletException {
	}

	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws ServletException, IOException {
		chain.doFilter(req, res);
		HttpServletRequest _req = (HttpServletRequest) req;
		HttpServletResponse _res = (HttpServletResponse) res;
		HttpSession session = _req.getSession();
		Cookie jsid = new Cookie("JSESSIONID", session.getId());
		jsid.setMaxAge(session.getMaxInactiveInterval());
		jsid.setPath("/");
//System.out.println("JSESSIONID="+session.getId());
		_res.addCookie(jsid);
	}

	public void destroy() {
	}
}
