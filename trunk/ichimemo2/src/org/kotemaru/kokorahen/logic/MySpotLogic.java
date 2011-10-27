package org.kotemaru.kokorahen.logic;

import java.util.*;
import java.util.logging.Logger;
import org.slim3.datastore.*;
import org.slim3.util.BeanUtil;
import org.kotemaru.jsrpc.Params;
import org.kotemaru.kokorahen.bean.IndexNum;
import org.kotemaru.kokorahen.bean.IndexAvg;
import org.kotemaru.kokorahen.jsrpc.Kokorahen;
import org.kotemaru.kokorahen.meta.ReviewModelMeta;
import org.kotemaru.kokorahen.meta.MySpotModelMeta;
import org.kotemaru.kokorahen.meta.UserModelMeta;
import org.kotemaru.kokorahen.model.ReviewModel;
import org.kotemaru.kokorahen.model.MySpotModel;
import org.kotemaru.kokorahen.model.SpotModel;
import org.kotemaru.kokorahen.model.UserModel;

import twitter4j.TwitterException;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.tools.admin.AppYamlTranslator;
import com.google.appengine.api.taskqueue.TaskOptions.Builder;


public class MySpotLogic  {
	private static final long serialVersionUID = 1L;
	private static final Logger LOG = Logger.getLogger(MySpotLogic.class.getName());

	private Kokorahen env;
	
	private MySpotLogic(Kokorahen env) {
		this.env = env;
	}
	
	public static MySpotLogic getInstance(Kokorahen env) {
		return new MySpotLogic(env);
	}
	
	public MySpotModel getMySpot(Long id){
		if (id == null) return null;
		try {
			Key key = Datastore.createKey(MySpotModel.class, id);
			MySpotModel model = Datastore.get(MySpotModel.class, key);
			return model;
		} catch (EntityNotFoundRuntimeException e) {
			return null;
		}
	}
	public MySpotModel getMySpot(Long userId, Long spotId) throws Exception {
		MySpotModelMeta e = MySpotModelMeta.get();
		ModelQuery<MySpotModel> q = Datastore.query(e);
		q.filter(e.userId.equal(userId));
		q.filter(e.spotId.equal(spotId));
		return q.asSingle();
	}

	public  Long writeMySpot(Map map) throws Exception {
		Params params = new Params(map);
		return writeMySpot(
			env.getLoginUser().getUserId(),
			params.toLong("spotId"),
			params.toFloat("appraise"),
			(List<String>)params.get("tags"),
			params.toBoolean("checked"),
			params.toBoolean("temporal")
		);
	}
	
	public  Long recommandMySpot(Long userId, Long spotId, double appraise
			) throws Exception {
		return writeMySpot(userId, spotId, (float)appraise, null, false, true);
	}
	public  Long writeMySpot(Long userId, Long spotId, Float appraise,
			List<String> tags, Boolean checked, Boolean temporal) throws Exception {
		SpotModel spot = env.spotLogic.getSpot(spotId);
		if (spot == null) {
			throw new RuntimeException("Not found spot "+spotId);
		}
		MySpotModel model = getMySpot(userId, spotId);
		if (model == null) {
			model = new MySpotModel();
			model.setUserId(userId);
			model.setSpotId(spotId);
			model.setCreateDate(new Date());
		}

		model.setName(spot.getName());
		model.setFurikana(spot.getFurikana());
		model.setUpdateDate(new Date());
		model.setLat(spot.getLat());
		model.setLng(spot.getLng());
		model.setAreas(spot.getAreas());
		
		if (tags == null) tags = spot.getTags();
		model.setTags(tags);
		
		model.setAppraise(appraise);
		model.setChecked(checked);
		model.setTemporal(temporal);
		
		Key key = Datastore.put(model);
		return key.getId();
	}
	
	public int recommend(Long userId) throws Exception {
		UserModel user = env.userLogic.getUserModel(userId);
		HashMap <Long,IndexNum> spots = new HashMap<Long,IndexNum>(128);
		int limit = 300;
		List<Long> follows = user.getFollows();
		
		for(Long followId : follows) {
			List<ReviewModel> reviews =
				env.reviewLogic.listReviewForUser(followId, limit);
			for (ReviewModel review : reviews) {
				Long spotId = review.getSpotId();
				IndexNum idx = spots.get(spotId);
				if (idx == null) {
					idx = new IndexAvg();
					spots.put(spotId, idx);
				}
				idx.add(review.getAppraise());
			}
		}
		
		int count = 0;
		Iterator<Map.Entry<Long,IndexNum>> ite = spots.entrySet().iterator();
		while (ite.hasNext()) {
			Map.Entry<Long,IndexNum> ent = ite.next();
			Long spotId = ent.getKey();
			double appraise = ent.getValue().getValue();
			if (appraise >= 3.0) {
				postMySpot(userId, spotId, appraise);
				count++;
			}
		}
	
		return count;
	}

	private void postMySpot(Long userId, Long spotId, double appraise)
		throws Exception 
	{
		if (getMySpot(userId, spotId) != null) return;
		for (int i=0; i<3; i++) {
			try {
				QueueFactory.getQueue("MySpot").add(Builder
					.withUrl(env.BASE_PATH+".recommandMySpotTask")
					.param("a0", userId.toString())
					.param("a1", spotId.toString())
					.param("a2", Double.toString(appraise))
					.countdownMillis(5000)
				);
				return;
			} catch (Exception e) {
				// ignore,retry
				try{Thread.sleep(1000);}catch(Exception ee){}
			}
		}
	}
	
	public List<SpotModel> listSpot(Map map){
		Params params = new Params(map);
		double latMin =  params.toDouble("latMin");
		double lngMin =  params.toDouble("lngMin");
		double latMax =  params.toDouble("latMax");
		double lngMax =  params.toDouble("lngMax");
		Integer limit = params.toInteger("limit");
		List<String> areas = (List<String>) params.get("areas");
		String tag = params.toString("tag");
		String search = params.toString("search");
		
		MySpotModelMeta e = MySpotModelMeta.get();
		Iterator<MySpotModel>[] qs = new Iterator[areas.size()];
		for (int i=0; i<qs.length; i++) {
			ModelQuery q = Datastore.query(e);
			q.filter(e.areas.in(areas.get(i)));
			q.sort(e.appraise.desc);
			if (tag != null) q.filter(e.tags.in(tag));
			qs[i] = q.asIterator();
		}
		
		MySpotModel[] spots = new MySpotModel[qs.length];
		for (int i=0; i<qs.length; i++) {
			while (spots[i] == null && qs[i].hasNext()) {
				spots[i] = qs[i].next();
				if (!isMatch(spots[i],search,latMin,lngMin,latMax,lngMax)) {
					spots[i] = null;
				}
			}
		}

		List<SpotModel> list = new ArrayList<SpotModel>(limit);
		for (int i=0; i<limit; i++) {
			int maxJ = -1;
			float maxA = -10000.0F;
			for (int j=0; j<spots.length; j++) {
				if (spots[j] != null && spots[j].getAppraise() > maxA) {
					maxJ = j;
					maxA = spots[j].getAppraise();
				}
			}
			if (maxJ == -1) break;

			SpotModel spot = toSpotModel(spots[maxJ]);
			if (spot != null){
				list.add(spot);
			}

			spots[maxJ] = null;
			while (spots[maxJ] == null && qs[maxJ].hasNext()) {
				spots[maxJ] = qs[maxJ].next();
				if (!isMatch(spots[maxJ],search,latMin,lngMin,latMax,lngMax)) {
					spots[maxJ] = null;
				}
			}
		}
		
		if (list.size()<limit) {
			env.spotLogic.listSpot(
				latMin,
				lngMin,
				latMax,
				lngMax,
				areas,
				tag,
				search,
				limit,
				list
			);
		}
		
		System.out.println("spots="+list.size()+"\n"+params);

		return list;
	}
	
	private SpotModel toSpotModel(MySpotModel mySpot) {
		SpotModel spot = env.spotLogic.getSpot(mySpot.getSpotId());
		if (spot == null) return null;
		spot.setMyAppraise(mySpot.getAppraise());
		spot.setMyTags(mySpot.getTags());
		spot.setChecked(mySpot.getChecked());
		spot.setTemporal(mySpot.getTemporal());
		return spot;
	}

	private boolean isMatch(MySpotModel spot, String search, 
			double latMin, double lngMin, double latMax, double lngMax) {
		if (!inBounds(spot,latMin,lngMin,latMax,lngMax)) return false;
		if (search == null || search.length()==0) return true;
		
		String name = spot.getName();
		if (name != null && name.indexOf(search)>=0) return true;
		String kana = spot.getFurikana();
		if (kana != null && kana.indexOf(search)>=0) return true;
		return false;
	}

	private boolean inBounds(MySpotModel spot, double latMin, double lngMin,
			double latMax, double lngMax) {
		double lat = spot.getLat();
		double lng = spot.getLng();
		return latMin<=lat && lat<=latMax && lngMin<=lng && lng<=lngMax;
	}
}
