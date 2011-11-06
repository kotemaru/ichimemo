package org.kotemaru.kokorahen.logic;

import java.util.*;
import java.util.logging.Logger;
import org.slim3.datastore.*;
import org.kotemaru.jsrpc.Params;
import org.kotemaru.kokorahen.jsrpc.Kokorahen;
import org.kotemaru.kokorahen.meta.MemoModelMeta;
import org.kotemaru.kokorahen.meta.ReviewModelMeta;
import org.kotemaru.kokorahen.meta.SpotModelMeta;
import org.kotemaru.kokorahen.meta.UserModelMeta;
import org.kotemaru.kokorahen.model.MemoModel;
import org.kotemaru.kokorahen.model.ReviewModel;
import org.kotemaru.kokorahen.model.SpotModel;
import org.kotemaru.kokorahen.model.UserModel;

import twitter4j.TwitterException;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions.Builder;

public class ReviewLogic  {
	private static final long serialVersionUID = 1L;
	private static final Logger LOG = Logger.getLogger(ReviewLogic.class.getName());

	private Kokorahen env;
	
	private ReviewLogic(Kokorahen env) {
		this.env = env;
	}
	
	public static ReviewLogic getInstance(Kokorahen env) {
		return new ReviewLogic(env);
	}
	
	public ReviewModel getReviewModel(Long id) throws Exception {
		if (id == null) return null;
		try {
			Key key = Datastore.createKey(ReviewModel.class, id);
			ReviewModel model = Datastore.get(ReviewModel.class, key);
			return model;
		} catch (EntityNotFoundRuntimeException e) {
			return null;
		}
	}
	public  Long writeReview(Map map) throws Exception {
		Params params = new Params(map);

		Long id = params.toLong("id");
		ReviewModel model = getReviewModel(id);
		if (id == null) {
			model = new ReviewModel();
		}

		UserModel user = env.getLoginUser();
		
		List<String> images = new ArrayList<String>(1);
		images.add(params.toString("image"));

		model.setUserId(user.getUserId());
		model.setNickname(user.getNickname());
		model.setSpotId(params.toLong("spotId"));
		model.setSpotName(params.toString("spotName"));
		model.setSpotKana(params.toString("spotKana"));
		model.setLat(params.toDouble("lat"));
		model.setLng(params.toDouble("lng"));
		model.setAreas(SpotLogic.toAreaList(model.getLat(),model.getLng()));
		model.setCreateDate(new Date());
		model.setUpdateDate(new Date());
		model.setAppraise(params.toFloat("appraise"));
		model.setComment(params.toString("comment"));
		model.setPhotoUrl(params.toString("photoUrl"));
		model.setChecked(params.toBoolean("checked"));
		model.setTwit(params.toBoolean("twit"));
		Key key = Datastore.put(model);

		env.twitterLogic.twit(params.toString("comment")+"@"+params.toString("name"));

		postTask(model.getSpotId());
		
		return key.getId();
	}
	
	private void postTask(Long spotId){

		for (int i=0; i<3; i++) {
			try {
				QueueFactory.getQueue("AppraiseSpot").add(Builder
					.withUrl(env.BASE_PATH+".appraiseTask")
					.param("a0", spotId.toString())
					.countdownMillis(5000)
				);
				return;
			} catch (Exception e) {
				// ignore,retry
				try{Thread.sleep(1000);}catch(Exception ee){}
			}
		}
	}
	
	public  List<ReviewModel> listReview(long spotId, List<Long> follows){
		int limit = 30;
		
		ReviewModelMeta e = ReviewModelMeta.get();
		ModelQuery q = Datastore.query(e);
		// no genre filter
		q.filter(e.spotId.equal(spotId));
		q.sort(e.updateDate.desc);

		if (follows == null) {
			q.limit(limit);
			return collectReviewModels(q.asList());
		}

		q.limit(999);
		List<ReviewModel> list = new ArrayList(limit);
		Iterator<ReviewModel> ite = q.asIterator();
		while (ite.hasNext()) {
			ReviewModel model = ite.next();
			if (follows.contains(model.getUserId())) {
				list.add(model);
				if (list.size() >= limit) break;
			}
		}
		return collectReviewModels(list);
	}
	
	public List<ReviewModel> collectReviewModels(List<ReviewModel> list) {
		for (ReviewModel model : list) {
			UserModel user = env.userLogic.getUserModel(model.getUserId());
			model.setNickname(user.getNickname());
			model.setUserPhotoUrl(user.getPhotoUrl());
		}
		return list;
	}

	// 使って無い
	public List<ReviewModel> listFollowSpot(
			Long userId,
			List<String> areas,
			String tag,
			double latMin,
			double lngMin,
			double latMax,
			double lngMax,
			int limit
	){

		ReviewModelMeta e = ReviewModelMeta.get();
		Iterator<ReviewModel>[] qs = new Iterator[areas.size()];
		for (int i=0; i<qs.length; i++) {
			ModelQuery q = Datastore.query(e);
			q.filter(e.userId.equal(userId));
			q.filter(e.areas.in(areas.get(i)));
			if (tag != null) q.filter(e.tags.in(tag));
			q.sort(e.appraise.desc);
			q.sort(e.updateDate.desc);
			qs[i] = q.asIterator();
		}

		ReviewModel[] tops = new ReviewModel[qs.length];
		for (int i=0; i<qs.length; i++) {
			while (tops[i] == null && qs[i].hasNext()) {
				tops[i] = qs[i].next();
				if (!inBounds(tops[i],latMin,lngMin,latMax,lngMax)) {
					tops[i] = null;
				}
			}
		}
		
		List<ReviewModel> list = new ArrayList<ReviewModel>(limit);
		for (int i=0; i<limit; i++) {
			int maxJ = -1;
			float maxA = -10000.0F;
			for (int j=0; j<tops.length; j++) {
				if (tops[j] != null && tops[j].getAppraise() > maxA) {
					maxJ = j;
					maxA = tops[j].getAppraise();
				}
			}
			if (maxJ == -1) break;
			list.add(tops[maxJ]);
			tops[maxJ] = null;
			while (tops[maxJ] == null && qs[maxJ].hasNext()) {
				tops[maxJ] = qs[maxJ].next();
				if (!inBounds(tops[maxJ],latMin,lngMin,latMax,lngMax)) {
					tops[maxJ] = null;
				}
			}
		}
		
		return list;
	}
	
	private static class Appraise {
		public long spotId;
		public int count = 0;
		public int total = 0;
		public float value;
	}
	// 使って無い
	public List<SpotModel> listFollowSpot2(
			List<Long> follows,
			List<String> areas,
			String tag,
			double latMin,
			double lngMin,
			double latMax,
			double lngMax,
			int limit
	){

		ReviewModelMeta e = ReviewModelMeta.get();
		Iterator<ReviewModel>[] qs = new Iterator[areas.size()];
		for (int i=0; i<qs.length; i++) {
			ModelQuery q = Datastore.query(e);
			q.filter(e.userId.in(follows));
			q.filter(e.areas.in(areas.get(i)));
			if (tag != null) q.filter(e.tags.in(tag));
			q.sort(e.appraise.desc);
			q.sort(e.updateDate.desc);
			qs[i] = q.asIterator();
		}

		ReviewModel[] tops = new ReviewModel[qs.length];
		for (int i=0; i<qs.length; i++) {
			while (tops[i] == null && qs[i].hasNext()) {
				tops[i] = qs[i].next();
				if (!inBounds(tops[i],latMin,lngMin,latMax,lngMax)) {
					tops[i] = null;
				}
			}
		}
		
		Map<Long,Appraise> appMap = new HashMap<Long,Appraise>();
		for (int i=0; i<limit; i++) {
			int maxJ = -1;
			float maxA = -10000.0F;
			for (int j=0; j<tops.length; j++) {
				if (tops[j] != null && tops[j].getAppraise() > maxA) {
					maxJ = j;
					maxA = tops[j].getAppraise();
				}
			}
			if (maxJ == -1) break;

			ReviewModel review = tops[maxJ];
			Long spotId = review.getSpotId();
			Appraise app = appMap.get(spotId);
			if (app == null) {
				app = new Appraise();
				app.spotId = spotId;
				appMap.put(spotId, app);
			}
			app.count++;
			app.total += review.getAppraise();
			

			tops[maxJ] = null;
			while (tops[maxJ] == null && qs[maxJ].hasNext()) {
				tops[maxJ] = qs[maxJ].next();
				if (!inBounds(tops[maxJ],latMin,lngMin,latMax,lngMax)) {
					tops[maxJ] = null;
				}
			}
		}
		
		// 評価値の平均値を求めて配列に変換する。
		int n = 0;
		Appraise apps[] = new Appraise[appMap.size()];
		for (Appraise app : appMap.values()) {
			app.value = (float)app.total / app.count;
			apps[n++] = app;
		}
		
		// 評価値でソートする。
		Arrays.sort(apps, new Comparator<Appraise>(){
			@Override
			public int compare(Appraise a, Appraise b) {
				if (a.value == b.value) return 0;
				return a.value < b.value ? -1 : 1;
			}
		});
		

		// 平均評価値の上位limit件のSpot情報を返す。
		List<SpotModel> list = new ArrayList<SpotModel>(limit);
		for (int i=0; i<limit && i<apps.length; i++) {
			list.add(env.spotLogic.getSpot(apps[i].spotId));
		}
		return list;
	
	}

	private boolean inBounds(ReviewModel spot, double latMin, double lngMin,
			double latMax, double lngMax) {
		double lat = spot.getLat();
		double lng = spot.getLng();
		return latMin<=lat && lat<=latMax && lngMin<=lng && lng<=lngMax;
	}
	
	public float calcAppraise(Long spotId){
		ReviewModelMeta e = ReviewModelMeta.get();
		ModelQuery q = Datastore.query(e);
		q.sort(e.updateDate.desc);
		q.filter(e.spotId.equal(spotId));
		//q.filter(e.twit.equal(false));
		q.filter(e.checked.equal(true));
		q.limit(100);

		// TODO: 現状は単純平均値
		double total = 0;
		int count = 0;
		Iterator<ReviewModel> ite = q.asIterator();
		while (ite.hasNext()) {
			ReviewModel review = ite.next();
			Float app = review.getAppraise();
			if (app != null && app>=1.0F) {
				total += review.getAppraise();
				count++;
			}
		}
		float appraise = (float)(total/count);
		return appraise;
	}
	
	// MySpotLogicのrecommand専用。
	public  List<ReviewModel> listReviewForUser(Long userId, int limit){
		ReviewModelMeta e = ReviewModelMeta.get();
		ModelQuery<ReviewModel> q = Datastore.query(e);
		q.filter(e.userId.equal(userId));
		// no genre filter;
		q.sort(e.appraise.desc);
		q.sort(e.updateDate.desc);
		q.limit(limit);
		return q.asList();
	}

	public ReviewModel getTodo(Long userId, Long spotId) {
		ReviewModelMeta e = ReviewModelMeta.get();
		ModelQuery<ReviewModel> q = Datastore.query(e);
		// no genre filter
		q.filter(e.userId.equal(userId));
		q.filter(e.spotId.equal(spotId));
		Iterator<ReviewModel> ite = q.asIterator();
		if (ite.hasNext()) {
			return ite.next();
		}
		return null;
	}
	
	
	// debug
	public void setupTwitFlag(){
		ReviewModelMeta e = ReviewModelMeta.get();
		ModelQuery q = Datastore.query(e);
		q.filter(e.twit.equal(null));
		q.filter(e.appraise.lessThan(0.1F));

		Iterator<ReviewModel> ite = q.asIterator();
		while (ite.hasNext()) {
			ReviewModel model = ite.next();
			model.setTwit(true);
			Datastore.put(model);
		}
	}

}
