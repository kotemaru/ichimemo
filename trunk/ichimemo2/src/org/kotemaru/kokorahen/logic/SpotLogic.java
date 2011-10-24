package org.kotemaru.kokorahen.logic;

import java.util.*;
import java.util.logging.Logger;
import org.slim3.datastore.*;
import org.slim3.util.BeanUtil;
import org.kotemaru.jsrpc.Params;
import org.kotemaru.kokorahen.jsrpc.Kokorahen;
import org.kotemaru.kokorahen.meta.ReviewModelMeta;
import org.kotemaru.kokorahen.meta.SpotModelMeta;
import org.kotemaru.kokorahen.meta.UserModelMeta;
import org.kotemaru.kokorahen.model.ReviewModel;
import org.kotemaru.kokorahen.model.SpotModel;
import org.kotemaru.kokorahen.model.UserModel;

import twitter4j.TwitterException;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.tools.admin.AppYamlTranslator;


public class SpotLogic  {
	private static final long serialVersionUID = 1L;
	private static final Logger LOG = Logger.getLogger(SpotLogic.class.getName());

	private Kokorahen env;
	
	private SpotLogic(Kokorahen env) {
		this.env = env;
	}
	
	public static SpotLogic getInstance(Kokorahen env) {
		return new SpotLogic(env);
	}
	
	public SpotModel getSpot(Long id){
		if (id == null) return null;
		try {
			Key key = Datastore.createKey(SpotModel.class, id);
			SpotModel model = Datastore.get(SpotModel.class, key);
			return model;
		} catch (EntityNotFoundRuntimeException e) {
			return null;
		}
	}
	
	public  Long writeSpot(Map map) {
		Params params = new Params(map);

		Long id = params.toLong("id");
		SpotModel model = getSpot(id);
		if (id == null) {
			model = new SpotModel();
			model.setOwner(env.getLoginUser().getUserId());
			model.setCreateDate(new Date());
		} else {
			SpotModel backup = new SpotModel();
			BeanUtil.copy(model, backup);
			backup.setKey(null);
			backup.setInvalid(true);
			backup.setMasterSpotId(id);
			Datastore.put(backup);
		}

		model.setUpdater(env.getLoginUser().getUserId());
		model.setName(params.toString("name"));
		model.setFurikana(params.toString("furikana"));
		model.setUpdateDate(new Date());
		model.setLat(params.toDouble("lat"));
		model.setLng(params.toDouble("lng"));
		model.setAreas(toAreaList(model.getLat(), model.getLng()));
		model.setAddress(params.toString("address"));
		model.setTags((List<String>)map.get("tags"));
		model.setImage(params.toString("image"));
		model.setComment(params.toString("comment"));
		model.setClosedDay(params.toString("closedDay"));
		model.setTimeLunchMin(params.toString("timeLunchMin"));
		model.setTimeLunchMax(params.toString("timeLunchMax"));
		model.setTimeDinnerMin(params.toString("timeDinnerMin"));
		model.setTimeDinnerMax(params.toString("timeDinnerMax"));
		model.setEmail(params.toString("email"));
		model.setUrl(params.toString("url"));

		// for Dummy data
		Float appraise = params.toFloat("appraise");
		if (appraise != null) {
			model.setAppraise(appraise);
		}
		
		Key key = Datastore.put(model);
		return key.getId();
	}


	public static List<String> toAreaList(double lat, double lng) {
		// 100K
		int lat0 = (int)Math.floor(lat);
		int lng0 = (int)Math.floor(lng);
		// 10K
		double lat1 = Math.floor(lat*10)/10;
		double lng1 = Math.floor(lng*10)/10;
		// 1K
		double lat2 = Math.floor(lat*100)/100;
		double lng2 = Math.floor(lng*100)/100;
		// 100m
		double lat3 = Math.floor(lat*1000)/1000;
		double lng3 = Math.floor(lng*1000)/1000;
		// 10m
		double lat4 = Math.floor(lat*10000)/10000;
		double lng4 = Math.floor(lng*10000)/10000;
		
		List<String> list = Arrays.asList(
			String.format("%03d,%03d", lat0, lng0),
			String.format("%05.1f,%05.1f", lat1, lng1),
			String.format("%06.2f,%06.2f", lat2, lng2),
			String.format("%07.3f,%07.3f", lat3, lng3),
			String.format("%08.4f,%08.4f", lat4, lng4)
		);
		return list;
	}

	public static String toArea(double lat, double lng) {
		return toArea1k(lat, lng);
	}
	public static String toArea1k(double lat, double lng) {
		// 1K
		double lat2 = Math.floor(lat*100)/100;
		double lng2 = Math.floor(lng*100)/100;
		return String.format("%06.2f,%06.2f", lat2, lng2);
	}

	public static String toArea10m(double lat, double lng) {
		double lat4 = Math.floor(lat*10000)/10000;
		double lng4 = Math.floor(lng*10000)/10000;
		return String.format("%08.4f,%08.4f", lat4, lng4);
	}
	public static String toArea100m(double lat, double lng) {
		double lat3 = Math.floor(lat*1000)/1000;
		double lng3 = Math.floor(lng*1000)/1000;
		return String.format("%07.3f,%07.3f", lat3, lng3);
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

		SpotModelMeta e = SpotModelMeta.get();
		Iterator<SpotModel>[] qs = new Iterator[areas.size()];
		for (int i=0; i<qs.length; i++) {
			ModelQuery q = Datastore.query(e);
			q.filter(e.invalid.equal(false));
			q.filter(e.areas.in(areas.get(i)));
			q.sort(e.appraise.desc);
			if (tag != null) q.filter(e.tags.in(tag));
			qs[i] = q.asIterator();
		}
		
		SpotModel[] spots = new SpotModel[qs.length];
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
			list.add(spots[maxJ]);
			spots[maxJ] = null;
			while (spots[maxJ] == null && qs[maxJ].hasNext()) {
				spots[maxJ] = qs[maxJ].next();
				if (!isMatch(spots[maxJ],search,latMin,lngMin,latMax,lngMax)) {
					spots[maxJ] = null;
				}
			}
		}
		
		System.out.println("spots="+list.size()+"\n"+params);

		return list;
	}
	
	private boolean isMatch(SpotModel spot, String search, 
			double latMin, double lngMin, double latMax, double lngMax) {
		if (!inBounds(spot,latMin,lngMin,latMax,lngMax)) return false;
		if (search == null || search.length()==0) return true;
		
		String name = spot.getName();
		if (name != null && name.indexOf(search)>=0) return true;
		String kana = spot.getFurikana();
		if (kana != null && kana.indexOf(search)>=0) return true;
		return false;
	}

	private boolean inBounds(SpotModel spot, double latMin, double lngMin,
			double latMax, double lngMax) {
		double lat = spot.getLat();
		double lng = spot.getLng();
		return latMin<=lat && lat<=latMax && lngMin<=lng && lng<=lngMax;
	}
/*
	public  List<AreaSpotBean> listSpot(Map map){
		Params params = new Params(map);
		//String area = params.toString("area");
		List<String> areas = (List<String>) params.get("areas");
		String tag = params.toString("tag");
		Integer limit = params.toInteger("limit");
		Integer range = params.toInteger("range");

		List<AreaSpotBean> result = new ArrayList<AreaSpotBean>(areas.size());
		SpotModelMeta e = SpotModelMeta.get();
		for (String area : areas) {
			if (area == null) continue; // ignore null.

			ModelQuery q = Datastore.query(e);
			q.filter(e.areas.in(area));
			q.sort(e.appraise.desc);
			if (tag != null) q.filter(e.tags.in(tag));
			if (limit != null) q.limit(limit);
			List<SpotModel> list = q.asList();

			result.add(new AreaSpotBean(area, list));
		}

		System.out.println("listSpot:"+areas);
		return result;
	}
*/
	private static class Appraise {
		public long spotId;
		public int count = 0;
		public int total = 0;
		public float value;
	}

	public List<SpotModel> listFollowSpot(Map map){
		Params params = new Params(map);
		double latMin =  params.toDouble("latMin");
		double lngMin =  params.toDouble("lngMin");
		double latMax =  params.toDouble("latMax");
		double lngMax =  params.toDouble("lngMax");
		Integer limit = params.toInteger("limit");
		List<String> areas = (List<String>) params.get("areas");
		String tag = params.toString("tag");
		List<Long> follows = (List<Long>) params.get("follows");

		// 各follow ユーザの上位レビュー評価をかき集める。
		Map<Long,Appraise> appMap = new HashMap<Long,Appraise>();
		for (int i=0; i<follows.size(); i++) {
			// follow ユーザのエリア内レビュー上位limit件を得る。
			List<ReviewModel> reviews = env.reviewLogic.listFollowSpot(
				follows.get(i),	areas, tag,
				latMin, lngMin, latMax, lngMax,
				limit
			);
			
			// 評価値をSpotに追加する。
			for (int j=0; j<reviews.size(); j++) {
				System.out.println("listFollowSpot-1.2="+i+","+j+":"+reviews.size());
				ReviewModel review = reviews.get(j);
				Long spotId = review.getSpotId();
				Appraise app = appMap.get(spotId);
				if (app == null) {
					app = new Appraise();
					app.spotId = spotId;
					appMap.put(spotId, app);
				}
				app.count++;
				app.total += review.getAppraise();
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
			list.add(getSpot(apps[i].spotId));
		}
		return list;
	}
	public List<SpotModel> listFollowSpot2(Map map){
		Params params = new Params(map);
		double latMin =  params.toDouble("latMin");
		double lngMin =  params.toDouble("lngMin");
		double latMax =  params.toDouble("latMax");
		double lngMax =  params.toDouble("lngMax");
		Integer limit = params.toInteger("limit");
		List<String> areas = (List<String>) params.get("areas");
		String tag = params.toString("tag");
		List<Long> follows = (List<Long>) params.get("follows");
		return env.reviewLogic.listFollowSpot2(
				follows,	areas, tag,
				latMin, lngMin, latMax, lngMax,
				limit
			);
	}
	
	public String removeSpot(Long spotId, Long userId){
		for (int i = 0; i < 3; i++) {
			Transaction tx = Datastore.beginTransaction();
			try {
				Key key = Datastore.createKey(SpotModel.class, spotId);
				SpotModel model = Datastore.get(tx, SpotModel.class, key);
				if (userId != null && !userId.equals(model.getOwner())) {
					return "Not owner "+userId;
				}
				model.setInvalid(true);
				Datastore.put(tx, model);
				tx.commit();
				return null;
			} catch (Throwable t) {
				if (tx.isActive()) tx.rollback();
			}
		}
		return "Retry over.";
	}

	public void appraiseTask(Long spotId){
		float appraise = env.reviewLogic.calcAppraise(spotId);

		Transaction tx = Datastore.beginTransaction();
		try {
			Key key = Datastore.createKey(SpotModel.class, spotId);
			SpotModel model = Datastore.get(tx, SpotModel.class, key);
			model.setAppraise(appraise);
			Datastore.put(tx, model);
			tx.commit();
		} catch (Throwable t) {
			if (tx.isActive()) tx.rollback();
			throw new RuntimeException(t);
			// Memo:リトライはタスクでする。
		}
	}

	public List<SpotModel> listNearSpot(double lat, double lng, int limit){
		return listNear100mSpot(lat, lng, limit);
	}
	private static class DistComparator implements Comparator<SpotModel> {
		public int compare(SpotModel a, SpotModel b) {
			return a.getDistance()>b.getDistance()?1:-1;
		}
	};
	
	private List<SpotModel> listNear100mSpot(double lat, double lng, int limit){
	
		// 現在値を中心とする策的半径内の3x3ブロック。
		final double r100m = 0.001;
		String[] areas = new String[]{
			toArea100m(lat, lng),
			
		 	toArea100m(lat-r100m, lng-r100m),
		 	toArea100m(lat-r100m, lng+r100m),
		 	toArea100m(lat+r100m, lng-r100m),
		 	toArea100m(lat+r100m, lng+r100m),
		 	
		 	toArea100m(lat-r100m, lng),
		 	toArea100m(lat      , lng+r100m),
		 	toArea100m(lat+r100m, lng),
		 	toArea100m(lat      , lng+r100m),
		 	toArea100m(lat, lng),
		};

		List<SpotModel> list = new ArrayList<SpotModel>(32);
		HashSet<Long> exists = new HashSet<Long>(32);
		for (int i=0; i<areas.length; i++) {
			takeSpots(list, areas[i], lat, lng, exists);
		}
		if (list.size() < limit) {
			return listNear1kSpot(lat, lng, limit, list, exists);
		}
		
		Collections.sort(list, new DistComparator());
		if (list.size()>limit) {
			return list.subList(0, limit);
		}
		return list;
	}

	
	private List<SpotModel> listNear1kSpot(double lat, double lng, int limit,
			List<SpotModel> list, HashSet<Long> exists) {

		// 現在値を中心とする策的半径内の2x2ブロック。
		final double r500m = 0.005;
		String[] areas = new String[]{
		 	toArea1k(lat-r500m, lng-r500m),
		 	toArea1k(lat-r500m, lng+r500m),
		 	toArea1k(lat+r500m, lng-r500m),
		 	toArea1k(lat+r500m, lng+r500m),
		};

		for (int i=0; i<areas.length; i++) {
			takeSpots(list, areas[i], lat, lng, exists);
		}
		
		Collections.sort(list, new DistComparator());
		if (list.size()>limit) {
			return list.subList(0, limit);
		}
		return list;
	}

	public void takeSpots(List<SpotModel> list, String area,
			double lat, double lng, HashSet<Long> exists){
		SpotModelMeta e = SpotModelMeta.get();
		ModelQuery q = Datastore.query(e);
		q.filter(e.invalid.equal(false));
		q.filter(e.areas.equal(area));
		q.limit(999);

		Iterator<SpotModel> ite = q.asIterator();
		while (ite.hasNext()) {
			SpotModel model = ite.next();
			if (exists.contains(model.getId())) {
				continue;
			}

			double latR = lat-model.getLat();
			double lngR = lng-model.getLng();
			double dist = Math.sqrt(latR*latR + lngR*lngR);
			model.setDistance(dist);
			list.add(model);
			exists.add(model.getId());
		}
	}


	
	// for debug
	public List<SpotModel> listAllSpot(){
		SpotModelMeta e = SpotModelMeta.get();
		ModelQuery q = Datastore.query(e);
		q.filter(e.invalid.equal(false));
		return q.asList();
	}
	public Long setInvalid(Long id) {
		Key key = Datastore.createKey(SpotModel.class, id);
		SpotModelMeta e = SpotModelMeta.get();
		try {
			ModelQuery q = Datastore.query(e);
			q.filter(e.key.greaterThan(key));
			Iterator<SpotModel> ite = q.asIterator();
			while (ite.hasNext()) {
				SpotModel model = ite.next();
				model.setInvalid(false);
				Datastore.put(model);
				id = model.getId();
			}
		} catch (Exception ex) {
			return id;
		}
		return null;
	}

}
