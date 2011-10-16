package org.kotemaru.kokorahen.logic;

import java.util.*;
import java.util.logging.Logger;
import org.slim3.datastore.*;
import org.kotemaru.jsrpc.Params;
import org.kotemaru.kokorahen.jsrpc.Kokorahen;
import org.kotemaru.kokorahen.meta.MemoModelMeta;
import org.kotemaru.kokorahen.meta.UserModelMeta;
import org.kotemaru.kokorahen.model.MemoModel;
import org.kotemaru.kokorahen.model.UserModel;

import twitter4j.TwitterException;

import com.google.appengine.api.datastore.Key;


public class MemoLogic  {
	private static final long serialVersionUID = 1L;
	private static final Logger LOG = Logger.getLogger(MemoLogic.class.getName());

	private Kokorahen env;
	private HashMap<Long,UserModel> cacheUserModel = new HashMap<Long,UserModel>();

	private MemoLogic(Kokorahen env) {
		this.env = env;
	}
	
	public static MemoLogic getInstance(Kokorahen env) {
		return new MemoLogic(env);
	}

	public MemoModel getMemoModel(Long id) throws Exception {
		if (id == null) return null;
		try {
			Key key = Datastore.createKey(MemoModel.class, id);
			MemoModel model = Datastore.get(MemoModel.class, key);
			return model;
		} catch (EntityNotFoundRuntimeException e) {
			return null;
		}
	}
	public MemoModel getMemoModel(Long userId, Long spotId) throws Exception {
		MemoModelMeta e = MemoModelMeta.get();
		ModelQuery<MemoModel> q = Datastore.query(e);
		q.filter(e.userId.equal(userId));
		q.filter(e.spotId.equal(spotId));
		return q.asSingle();
	}

	public  Long writeMemo(Map map) throws Exception {
		Params params = new Params(map);

		Long id = params.toLong("id");
		MemoModel model = getMemoModel(id);
		if (model == null) {
			model = new MemoModel();
			model.setCreateDate(new Date());
		}

		List<String> images = new ArrayList<String>(1);
		images.add(params.toString("image"));

		model.setUserId(params.toLong("userId"));
		model.setSpotId(params.toLong("spotId"));
		model.setComment(params.toString("comment"));
		model.setUpdateDate(new Date());
		Key key = Datastore.put(model);

		return key.getId();
	}

}
