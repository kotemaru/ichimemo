package org.kotemaru.kokorahen.logic;

import java.util.*;
import java.io.IOException;
import java.net.*;
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
import org.kotemaru.util.json.JSONData;
import org.kotemaru.util.json.JSONParser;

import twitter4j.TwitterException;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions.Builder;
import com.google.appengine.api.urlfetch.*;

public class GPlaceLogic  {
	private static final long serialVersionUID = 1L;
	private static final Logger LOG = Logger.getLogger(GPlaceLogic.class.getName());
	private static final String KEY =
		"AIzaSyAvupK0sGEXAAu2FPi69iJZOasSXVtvF0c"; // TODO:->web.xml
	private static final String URL_SEARCH =
		"https://maps.googleapis.com/maps/api/place/search/json"
		+"?location=${lat},${lng}"
		+"&radius=${radius}"
		+"&types=restaurant"
		+"&sensor=false"
		+"&language=ja"
		+"&key="+KEY
	;
	private static final String URL_DETAIL =
		"https://maps.googleapis.com/maps/api/place/details/json"
		+"?reference=${refer}"
		+"&sensor=true"
		+"&key="+KEY
	;
	private static final String OK = "OK";

	private Kokorahen env;
	
	private GPlaceLogic(Kokorahen env) {
		this.env = env;
	}
	
	public static GPlaceLogic getInstance(Kokorahen env) {
		return new GPlaceLogic(env);
	}
/**
	{
		"status": "OK",
		"html_attributions": [ ],
		"results": [
			{
				"geometry": {
					"location": {"lat": 35.68039,"lng": 139.743577}
				},
				"icon": "http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png",
				"id": "e23dce37187af004ba97654382706abe174bb75d",
				"name": "最高裁判所 守衛室",
				"reference": "CnRwAAAAIRamCp-...",
				"types": ["restaurant","food","establishment"],
				"vicinity": "東京都千代田区隼町４−２"
			},
			:
		]
	}
*/		
	public Map listPlace(Double lat, Double lng, int radius) throws IOException {
		String url = URL_SEARCH
			.replaceAll("[$][{]lat[}]", lat.toString())
			.replaceAll("[$][{]lng[}]", lng.toString())
			.replaceAll("[$][{]radius[}]", Integer.toString(radius))
		;
		Map map = fetchJsonData(url);
		String status = (String)map.get("status");
		if (!OK.equals(status)) {
			throw new IOException("Place api status "+status);
		}
		return map;
	}

/**
{
	"status": "OK",
	"html_attributions": ["copy right"],
	"result": {
		"address_components": [
			{
				"long_name": "JP",
				"short_name": "JP",
				"types": ["country","political"]
			},
			{
				"long_name": "100-0005",
				"short_name": "100-0005",
				"types": ["postal_code"]
			}
		],
		"formatted_address": "日本, 東京都千代田区丸の内２丁目７−３",
		"formatted_phone_number": "03-3216-2336",
		"geometry": {
			"location": {"lat": 35.678555,"lng": 139.764753}
		},
		"icon": "http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png",
		"id": "d1534e8b57a2fad4856744787f277024192e1531",
		"international_phone_number": "+81 3-3216-2336",
		"name": "インデアンカレー",
		"rating": 4.2,
		"reference": "CnRwAAAA7hua...",
		"types": ["restaurant","food","establishment"],
		"url": "http://maps.google.com/maps/place?cid=13618664654404771710",
		"vicinity": "東京都千代田区丸の内２丁目７−３",
		"website": "http://www.indiancurry.jp/"
	}
}

 */
	public Map getPlace(String refer) throws IOException {
		String url = URL_DETAIL.replaceAll("[$][{]refer[}]", refer);
		Map map = fetchJsonData(url);
		String status = (String)map.get("status");
		if (!OK.equals(status)) {
			throw new IOException("Place api status "+status);
		}
		return map;
	}

	public SpotModel place2spot(Map place, SpotModel spot) throws IOException {
		if (spot == null) {
			spot = new SpotModel();
		}

		JSONData data = new JSONData(place);
		Double ratingD = (Double)data.get("result.rating");
		Float rating = (ratingD == null) ? -1.0F : ratingD.floatValue();
		
		spot.setLat((Double)data.get("result.geometry.location.lat"));
		spot.setLng((Double)data.get("result.geometry.location.lng"));
		spot.setAddress((String)data.get("result.vicinity"));
		spot.setName((String)data.get("result.name"));
		spot.setFurikana(env.getKana(spot.getName()));
		spot.setUrl((String)data.get("result.website"));
		spot.setPlaceRating(rating);
		spot.setAppraise(rating);
		spot.setPlaceId((String)data.get("result.id"));

		List<String> htmlAttrs = (List<String>)place.get("html_attributions");
		if (htmlAttrs != null && htmlAttrs.size()>0) {
			spot.setComment(htmlAttrs.toString());
		}
	
		return spot;
	}
	
	public static Map fetchJsonData(String url) throws IOException {
		URLFetchService fetcher = URLFetchServiceFactory.getURLFetchService();
		HTTPRequest request = new HTTPRequest(new URL(url), HTTPMethod.GET);
		HTTPResponse response = fetcher.fetch(request);
		int status = response.getResponseCode();
		byte[] resbody = response.getContent();
		String responseText = new String(resbody, "utf-8");
		if (status != 200) {
			String msg = "listPlace:"+url+"\n status="+status+"\n"+responseText;
			LOG.severe(msg);
			throw new IOException(msg);
		}
		JSONParser parser = new JSONParser();
		Map map = parser.parse(responseText);
		return map;
	}
	
	public int fromPlace(Map map) throws IOException {
		Params params = new Params(map);
		Double lat  = params.toDouble("lat");
		Double lng  = params.toDouble("lng");
		Long radius  = params.toLong("radius");
		return fromPlace(lat, lng, radius.intValue());
	}
	
	public int fromPlace(Double lat, Double lng, int radius) throws IOException {
		Map listMap = listPlace(lat,lng,radius);
		List<Map> list = (List<Map>)listMap.get("results");
		int count = 0;
		
		for (Map breif : list) {
			String id = (String)breif.get("id");
			String refer = (String)breif.get("reference");
			if (! hasSpot(id)) {
				makeSpot(refer);
				count++;
			}
		}
		return count;
	}

	public boolean hasSpot(String placeId) {
		SpotModelMeta e = SpotModelMeta.get();
		ModelQuery<SpotModel> q = Datastore.query(e);
		q.filter(e.placeId.equal(placeId));
		SpotModel model = q.asSingle();
		return model != null;
	}

	public Long makeSpot(String refer) throws IOException {
		Map place = getPlace(refer);
		SpotModel model = place2spot(place, null);

		model.setOwner(env.getLoginUser().getUserId());
		model.setCreateDate(new Date());
		model.setUpdateDate(new Date());
		model.setUpdater(env.getLoginUser().getUserId());
		model.setAreas(SpotLogic.toAreaList(model.getLat(), model.getLng()));
		Key key = Datastore.put(model);
		return key.getId();
	}

}
