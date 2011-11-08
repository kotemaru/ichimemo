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


public class TimelineLogic  {
	private static final long serialVersionUID = 1L;
	private static final Logger LOG = Logger.getLogger(TimelineLogic.class.getName());

	private Kokorahen env;
	
	private TimelineLogic(Kokorahen env) {
		this.env = env;
	}
	
	public static TimelineLogic getInstance(Kokorahen env) {
		return new TimelineLogic(env);
	}
	
	public  List<ReviewModel> listTimeline(Map map){
		Params params = new Params(map);
		String ganre = params.toString("ganre");
		String tag = params.toString("tag");
		Long userId = params.toLong("userId");
		Integer limit = params.toInteger("limit");
		Double lat =  params.toDouble("lat");
		Double lng =  params.toDouble("lng");
		List<Long> follows = (List<Long>)params.get("follows");

		if (follows != null) {
			follows.add(env.getLoginUser().getUserId());
		}
		
		ReviewModelMeta e = ReviewModelMeta.get();
		if (lat == null && follows == null) {
			ModelQuery q = Datastore.query(e);
			q.filter(e.genres.in(ganre));
			if (userId != null) q.filter(e.userId.equal(userId));
			if (tag != null) q.filter(e.tags.in(tag));
			q.sort(e.updateDate.desc);
			if (limit != null) q.limit(limit);
			List<ReviewModel> list = q.asList();
			// TODO:searchフィルター
			System.out.println("review=" + list);
			return list;
		} else if (lat != null && follows == null) {
			return listTimeline(params, lat, lng, limit);
		} else if (lat == null && follows != null) {
			return listTimeline(params, follows, limit);
		} else if (lat != null && follows != null) {
			return listTimeline(params, lat, lng, follows, limit);
		}
		return null; // error
	}
	private List<ReviewModel> listTimeline(Params params, 
			Double lat, Double lng, List<Long> follows, 
			Integer limit) {
		String genre = params.toString("genre");
		String tag = params.toString("tag");
		List<String> areas = getAreas5km(lat,lng);

		ReviewModelMeta e = ReviewModelMeta.get();
		Iterator<ReviewModel>[] qs = new Iterator[areas.size()*follows.size()];
		for (int i=0; i<areas.size(); i++) {
			for (int j=0; j<follows.size(); j++) {
				ModelQuery q = Datastore.query(e);
				q.filter(e.genres.in(genre));
				q.filter(e.areas.in(areas.get(i)));
				q.filter(e.userId.equal(follows.get(j)));
				if (tag != null) q.filter(e.tags.in(tag));
				q.sort(e.updateDate.desc);
				qs[i] = q.asIterator();
			}
		}
		return listTimeline(params,qs, limit);
	}
	
	private List<ReviewModel> listTimeline(Params params, 
			Double lat, Double lng,
			Integer limit) {

		String genre = params.toString("genre");
		String tag = params.toString("tag");
		List<String> areas = getAreas5km(lat,lng);
		
		ReviewModelMeta e = ReviewModelMeta.get();
		Iterator<ReviewModel>[] qs = new Iterator[areas.size()];
		for (int i=0; i<qs.length; i++) {
			ModelQuery q = Datastore.query(e);
			q.filter(e.genres.in(genre));
			q.filter(e.areas.in(areas.get(i)));
			if (tag != null) q.filter(e.tags.in(tag));
			q.sort(e.updateDate.desc);
			qs[i] = q.asIterator();
		}
		return listTimeline(params, qs, limit);
	}
	
	private List<String> getAreas5km(Double lat, Double lng) {
		double latMin = lat - 0.025;
		double lngMin = lng - 0.025;
		double latMax = lat + 0.025;
		double lngMax = lng + 0.025;

		List<String> areas = new ArrayList<String>(36);
		for (double _lat=latMin; _lat<latMax; _lat+=0.01) {
			for (double _lng=lngMin; _lng<lngMax; _lng+=0.01) {
				areas.add(SpotLogic.toArea(_lat,_lng));
			}
		}
		
		return areas;
	}
	
	private List<ReviewModel> listTimeline(Params params, 
			List<Long> follows, Integer limit) {
		
		String genre = params.toString("genre");
		String tag = params.toString("tag");

		ReviewModelMeta e = ReviewModelMeta.get();
		Iterator<ReviewModel>[] qs = new Iterator[follows.size()];
		for (int i=0; i<qs.length; i++) {
			ModelQuery q = Datastore.query(e);
			q.filter(e.genres.in(genre));
			q.filter(e.userId.equal(follows.get(i)));
			if (tag != null) q.filter(e.tags.in(tag));
			q.sort(e.updateDate.desc);
			qs[i] = q.asIterator();
		}
		return listTimeline(params, qs, limit);
	}
	private List<ReviewModel> listTimeline(Params params, Iterator<ReviewModel>[] qs, Integer limit) {
		String search = params.toString("search");
		if (search != null && search.length()==0) search = null;
		
		ReviewModel[] models = new ReviewModel[qs.length];
		for (int i=0; i<qs.length; i++) {
			while (models[i] == null && qs[i].hasNext()) {
				models[i] = qs[i].next();
				if (!isMatch(models[i], search)) {
						models[i] = null;
				}
			}
		}

		List<ReviewModel> list = new ArrayList<ReviewModel>(limit);
		for (int i=0; i<limit; i++) {
			int maxJ = -1;
			long maxA = 0L;
			for (int j=0; j<models.length; j++) {
				if (models[j] != null && models[j].getUpdateDate().getTime() > maxA) {
					maxJ = j;
					maxA = models[j].getUpdateDate().getTime();
				}
			}
			if (maxJ == -1) break;
			list.add(models[maxJ]);
			models[maxJ] = null;
			while (models[maxJ] == null && qs[maxJ].hasNext()) {
				models[maxJ] = qs[maxJ].next();
				if (!isMatch(models[maxJ], search)) {
					models[maxJ] = null;
				}
			}
		}
		return list;
	}
	private boolean isMatch(ReviewModel spot, String search) {
		if (search == null || search.length()==0) return true;
		
		String name = spot.getSpotName();
		if (name != null && name.indexOf(search)>=0) return true;
		String kana = spot.getSpotKana();
		if (kana != null && kana.indexOf(search)>=0) return true;
		return false;
	}


	public  List<ReviewModel> listTimeline(Long userId, Long spotId, int limit){
		ReviewModelMeta e = ReviewModelMeta.get();
		ModelQuery<ReviewModel> q = Datastore.query(e);
		q.filter(e.userId.equal(userId));
		q.filter(e.spotId.equal(spotId));
		q.sort(e.updateDate.desc);
		q.limit(limit);
		return q.asList();
	}
}
