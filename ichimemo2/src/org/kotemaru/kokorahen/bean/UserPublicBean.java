package org.kotemaru.kokorahen.bean;

import java.io.Serializable;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.kotemaru.kokorahen.model.UserModel;
import org.slim3.datastore.Attribute;
import org.slim3.datastore.Datastore;
import org.slim3.datastore.InverseModelRef;
import org.slim3.datastore.Model;

import com.google.appengine.api.datastore.Key;

public class UserPublicBean  {
	private static final long serialVersionUID = 1L;

	private UserModel origin;
	public UserPublicBean(UserModel org) {
		this.origin = org;
	}

	public Long getUserId() {
		return origin.getUserId();
	}
	public String getNickname() {
		return origin.getNickname();
	}
	public String getComment() {
		return origin.getComment();
	}
	public List<Long> getFollows() {
		return origin.getFollows();
	}
	public Map<Long, String> getFollowsNickname() {
		return origin.getFollowsNickname();
	}

}
