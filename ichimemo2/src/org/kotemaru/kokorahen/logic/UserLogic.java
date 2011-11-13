package org.kotemaru.kokorahen.logic;

import java.io.IOException;
import java.util.*;
import java.util.logging.Logger;
import org.slim3.datastore.*;
import org.kotemaru.jsrpc.Params;
import org.kotemaru.kokorahen.jsrpc.Kokorahen;
import org.kotemaru.kokorahen.meta.UserModelMeta;
import org.kotemaru.kokorahen.model.UserModel;
import org.kotemaru.util.json.JSONSerializer;

import twitter4j.TwitterException;

import com.google.appengine.api.datastore.Key;


public class UserLogic  {
	private static final long serialVersionUID = 1L;
	private static final Logger LOG = Logger.getLogger(UserLogic.class.getName());

	private Kokorahen env;
	private HashMap<Long,UserModel> cacheUserModel = new HashMap<Long,UserModel>();

	private UserLogic(Kokorahen env) {
		this.env = env;
	}
	
	
	public static UserLogic getInstance(Kokorahen env) {
		return new UserLogic(env);
	}

	public UserModel getUserModel(Long id) {
		UserModel user = cacheUserModel.get(id);
		if (user != null) return user;
		
		Key key = Datastore.createKey(UserModel.class, id);
		try {
			user = Datastore.get(UserModel.class, key);
			cacheUserModel.put(id, user);
			return collectUserInfo(user);
		} catch (EntityNotFoundRuntimeException e) {
			return null;
		}
	}
	public UserModel getGoogleUser(String name) {
		UserModelMeta e = UserModelMeta.get();
		ModelQuery q = Datastore.query(e);
		q.filter(e.googleUser.equal(name));
		q.filter(e.invalid.equal(false));
		List<UserModel> list = q.asList();
		if (list.size() == 0) return null;
		return list.get(0);
	}
	public UserModel getTwitterUser(String name) {
		UserModelMeta e = UserModelMeta.get();
		ModelQuery q = Datastore.query(e);
		q.filter(e.twitterUser.equal(name));
		q.filter(e.invalid.equal(false));
		List<UserModel> list = q.asList();
		if (list.size() == 0) return null;
		return list.get(0);
	}
	public UserModel getGoogleUser(String name, boolean isCreate) {
		UserModel user = getGoogleUser(name);
		if (user != null) return collectUserInfo(user);
		if (!isCreate) return null;
		
		user = new UserModel();
		user.setGoogleUser(name);
		user.setNickname(name.replaceFirst("@.*$", ""));
		//user.setProvider(GOOGLE);
		user.setCreateDate(new Date());
		user.setUpdateDate(new Date());
		user.setLastLogin(new Date());
		Datastore.put(user);
		return collectUserInfo(user);
	}
	
	public UserModel getTwitterUser(String name, boolean isCreate) 
			throws IllegalStateException, TwitterException 
	{
		UserModel user = getTwitterUser(name);
		if (user != null) return collectUserInfo(user);
		if (!isCreate) return null;
		
		twitter4j.User tuser = env.twitterLogic.getTwitterUser();
			
		user = new UserModel();
		user.setTwitterUser(name);
		user.setNickname(tuser.getName());
		//user.setProvider(TWITTER);
		user.setPhotoUrl(tuser.getProfileImageURL().toExternalForm());
		user.setCreateDate(new Date());
		user.setUpdateDate(new Date());
		user.setAutoTwit(true);
		Datastore.put(user);
		return collectUserInfo(user);
	}
	public String checkUser(Map map) throws Exception {
		Params params = new Params(map);
		long userId = params.toLong("userId");
		String gname = params.toString("googleUser");
		String tname = params.toString("twitterUser");

		if (gname != null && gname.length()>0 ) {
			UserModel user = getGoogleUser(gname, false);
			if (user != null && user.getUserId() != userId) {
				return "このGoogleユーザ("+gname+")は既に登録されています。"
					+ " ["+user.getUserId()+","+userId+"]";
			}
		}
		if (tname != null && tname.length()>0 ) {
			UserModel user = getTwitterUser(tname, false);
			if (user != null && user.getUserId() != userId) {
				return "このTwitterユーザ("+tname+")は既に登録されています。"
					+ " ["+user.getUserId()+","+userId+"]";
			}
		}
		return null;
	}

	public UserModel writeUser(Map map) throws Exception {
		Params params = new Params(map);
		Long id = params.toLong("userId");

		UserModel user =  getUserModel(id);
		user.setGoogleUser(params.toString("googleUser"));
		user.setTwitterUser(params.toString("twitterUser"));
		user.setNickname(params.toString("nickname"));
		user.setUpdateDate(new Date());
		user.setAutoTwit(params.toBoolean("autoTwit"));
		user.setFollows((List<Long>)params.get("follows"));
		user.setComment(params.toString("comment"));
		user.setPhotoUrl(params.toString("photoUrl"));
		user.setTags((List<String>)params.get("tags"));

		Datastore.put(user);
		cacheUserModel.remove(id);
		return collectUserInfo(user);
	}
	
	public String invalidUser(Long userId) throws Exception {
		UserModel user =  getUserModel(userId);
		if (UserModel.BAD.equals(user.getRole())) {
			return "このユーザは削除できません。";
		}
		
		user.setInvalid(true);
		user.setUpdateDate(new Date());

		Datastore.put(user);
		cacheUserModel.remove(userId);
		return null;
	}
	
	public UserModel lastLogin(UserModel user) throws Exception {
		user.setLastLogin(new Date());
		Datastore.put(user);
		return user;
	}

	public UserModel collectUserInfo(UserModel user) {
		if (user.getFollows() == null) return user;
		
		Map <Long,String> nicknameMap = new HashMap<Long,String>();
		for (Long name : user.getFollows()) {
			Key key = Datastore.createKey(UserModel.class, name);
			try {
				UserModel u = Datastore.get(UserModel.class, key);
				nicknameMap.put(name, u.getNickname());
			} catch (EntityNotFoundRuntimeException e) {
				LOG.warning("Follow not exitst user:"+name);
			}
		}
		user.setFollowsNickname(nicknameMap);
		return user;
	}

	// debug
	/** 再書き込みでデフォルト値設定 
	 * @throws IOException */
	public void rewriteAll() throws IOException {
		JSONSerializer seri = new JSONSerializer();
		UserModelMeta e = UserModelMeta.get();
		ModelQuery<UserModel> q = Datastore.query(e);
		Iterator<UserModel> ite = q.asIterator();
		while (ite.hasNext()) {
			UserModel model = ite.next();
			model.setInvalid(false);
			model.setRole(model.COMMITER);
			System.out.println(seri.getString(model, "utf-8"));
			Datastore.put(model);
		}
	}

	
	
	
	
}
