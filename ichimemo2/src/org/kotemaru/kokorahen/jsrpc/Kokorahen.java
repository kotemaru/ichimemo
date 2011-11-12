package org.kotemaru.kokorahen.jsrpc;

import java.io.IOException;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slim3.datastore.*;

import org.kotemaru.jsrpc.JsrpcEnvironment;
import org.kotemaru.jsrpc.JsrpcException;
import org.kotemaru.jsrpc.Params;
import org.kotemaru.jsrpc.annotation.JsRpc;
import org.kotemaru.kokorahen.bean.UserPublicBean;
import org.kotemaru.kokorahen.logic.GPlaceLogic;
import org.kotemaru.kokorahen.logic.KakasiLogic;
import org.kotemaru.kokorahen.logic.MemoLogic;
import org.kotemaru.kokorahen.logic.MySpotLogic;
import org.kotemaru.kokorahen.logic.ReviewLogic;
import org.kotemaru.kokorahen.logic.SpotLogic;
import org.kotemaru.kokorahen.logic.TimelineLogic;
import org.kotemaru.kokorahen.logic.TwitterLogic;
import org.kotemaru.kokorahen.logic.UserLogic;
import org.kotemaru.kokorahen.meta.MySpotModelMeta;
import org.kotemaru.kokorahen.meta.ReviewModelMeta;
import org.kotemaru.kokorahen.meta.SpotModelMeta;
import org.kotemaru.kokorahen.model.MemoModel;
import org.kotemaru.kokorahen.model.MySpotModel;
import org.kotemaru.kokorahen.model.ReviewModel;
import org.kotemaru.kokorahen.model.SpotModel;
import org.kotemaru.kokorahen.model.UserModel;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;


@JsRpc()
public class Kokorahen implements JsrpcEnvironment {
	private static final long serialVersionUID = 1L;

	private static final Logger LOG = Logger.getLogger(Kokorahen.class.getName());

	private static final String  GOOGLE = "google";
	private static final String  TWITTER = "twitter";

	public static final String BASE_PATH = "/classes/"
		+ Kokorahen.class.getName().replace('.','/');

	private transient HttpServletRequest request;
	private transient HttpServletResponse response;

	public transient UserLogic userLogic;// = UserLogic.getInstance(this);
	public transient SpotLogic spotLogic;// = SpotLogic.getInstance(this);
	public transient MySpotLogic mySpotLogic;// = SpotLogic.getInstance(this);
	public transient ReviewLogic reviewLogic;// = ReviewLogic.getInstance(this);
	public transient TimelineLogic timelineLogic;// = TimelineLogic.getInstance(this);
	public transient MemoLogic memoLogic;// = TimelineLogic.getInstance(this);
	public transient GPlaceLogic gplaceLogic;// = TimelineLogic.getInstance(this);
	public TwitterLogic twitterLogic = TwitterLogic.getInstance(this);

	private UserModel loginUser;
	private String topPageUrl = "/";

	public void init() {
		userLogic = UserLogic.getInstance(this);
		spotLogic = SpotLogic.getInstance(this);
		mySpotLogic = MySpotLogic.getInstance(this);
		reviewLogic = ReviewLogic.getInstance(this);
		timelineLogic = TimelineLogic.getInstance(this);
		memoLogic = MemoLogic.getInstance(this);
		gplaceLogic = GPlaceLogic.getInstance(this);
	}

	
	//-----------------------------------------------------------------------
	// for JsrpcEnviroment
	public void setHttpServletRequest(HttpServletRequest req) {
		this.request = req;
	}
	public void setHttpServletResponse(HttpServletResponse res) {
		this.response = res;
	}
	public boolean isSaveSession() {
		return true;
	}

	//-----------------------------------------------------------------------
	// コンビにメソッド
	private HttpSession getSession(boolean b) {
		return request.getSession(b);
	}
	private void redirect(String url) throws IOException {
		response.sendRedirect(url);
	}
	private String getServerUrl() throws IOException {
		String url = request.getScheme()+"://"
			+request.getServerName()+":"
			+request.getServerPort();
		return url;
	}
	
	//-----------------------------------------------------------------------
	// ログイン処理

	public  UserModel getLoginUser() {
		return loginUser;
	}
	private long checkLogin() throws JsrpcException {
		if (loginUser == null) {
			throw new JsrpcException("Not login.");
		}
		return loginUser.getUserId();
	}
	private long checkLogin(Long id) throws JsrpcException {
		checkLogin();
		long curId = loginUser.getUserId();
//System.out.println("checkLogin:"+curId+":"+id);
		if (curId != id) {
			throw new JsrpcException("Not you.");
		}
		return curId;
	}
	private void checkAdmin() throws JsrpcException {
		checkLogin();
		if (!loginUser.isAdmin()) {
			throw new JsrpcException("Not admin.");
		}
	}

	public  String login(String provider, String top) throws Exception {
		topPageUrl = top;
		String url = getServerUrl();
		if (GOOGLE.equals(provider)) {
			return loginGoogle(url);
		} else if (TWITTER.equals(provider)) {
			return loginTwitter(url);
		} else {
			throw new RuntimeException("Unsupported login provider "+provider);
		}
	}


	public  String loginGoogle(String url) throws Exception {
		UserService us = UserServiceFactory.getUserService();
		if (us.getCurrentUser() != null) {
			String name = us.getCurrentUser().getEmail();
			UserModel user = userLogic.getGoogleUser(name, true);
			userLogic.lastLogin(user);
			user.setProvider(GOOGLE);
			user.setAdmin(us.isUserAdmin());
			this.loginUser = user;
			return topPageUrl;
		}

		String callback = url+ BASE_PATH+".googleCallback";
		return us.createLoginURL(callback);
	}
	public  void googleCallback() throws Exception {
		redirect(login(GOOGLE, topPageUrl));
	}

	private  String loginTwitter(String url) throws Exception {
		String callback = url+ BASE_PATH+".twitterCallback";
		String loginUrl = twitterLogic.login(callback);
		return loginUrl;
	}

	public  void twitterCallback() throws Exception {
		String verifier = request.getParameter("oauth_verifier");
		if (twitterLogic.verify(verifier) == false) {
			LOG.warning("Not twitter login");
			getSession(true).invalidate();
			redirect(topPageUrl);
			return;
		}

		String name = twitterLogic.getScreenName();
		UserModel user = userLogic.getTwitterUser(name, true);
		userLogic.lastLogin(user);
		this.loginUser = user;
		user.setProvider(TWITTER);
		redirect(topPageUrl);
		return;
	}

	public  String logout(String provider) throws Exception {
		this.loginUser = null;
		getSession(true).invalidate();
		String url = this.getServerUrl();
		if (GOOGLE.equals(provider)) {
			return logoutGoogle(url);
		} else if (TWITTER.equals(provider)) {
			return logoutTwitter(url);
		} else {
			//throw new RuntimeException("Unsupported login provider "+provider);
			return url;
		}
	}

	private  String logoutGoogle(String url) throws Exception {
		UserService us = UserServiceFactory.getUserService();
		return us.createLogoutURL(url);
	}
	private  String logoutTwitter(String url) throws Exception {
		return url;
	}


	//------------------------------------------------------------------------------
	// ユーザ管理
	
	public UserPublicBean getUserModelPublic(Long id) {
		UserModel user = userLogic.getUserModel(id);
		return new UserPublicBean(user);
	}
	public UserPublicBean getGoogleUser(String username) {
		UserModel user = userLogic.getGoogleUser(username);
		return new UserPublicBean(user);
	}
	public UserPublicBean getTwitterUser(String username) {
		UserModel user = userLogic.getTwitterUser(username);
		return new UserPublicBean(user);
	}
	public  void writeUser(Map map) throws Exception {
		Params params = new Params(map);
		checkLogin(params.toLong("userId"));
		this.loginUser = userLogic.writeUser(map);
		this.loginUser.setProvider(params.toString("provider"));
	}

	
	//------------------------------------------------------------------------------
	// Spot管理
	public SpotModel getSpot(Long id) throws Exception{
		Long userId = checkLogin();
		SpotModel spot = spotLogic.getSpot(id);
		if (spot != null) {
			MySpotModel mySpot = mySpotLogic.getMySpot(userId, id);
			if (mySpot != null) {
				mySpotLogic.toSpotModel(mySpot, spot);
			}
		}
		return spot;
	}
	public List<SpotModel> getSpots(Map map){
		return spotLogic.listSpot(map);
	}
	public List<SpotModel> listNearSpot(Map map) throws Exception{
		Long userId = checkLogin();
		List<SpotModel> list = spotLogic.listNearSpot(map);
		return mySpotLogic.margeMySpot(userId, list);
	}
	public List<SpotModel> listFollowSpot(Map map){
		return spotLogic.listFollowSpot2(map);
	}
	public  Long writeSpot(Map map) {
		checkLogin();
		return spotLogic.writeSpot(map);
	}
	public String getKana(String kanji) throws IOException {
		return KakasiLogic.getInstance().toKana(kanji);
	}
	public void appraiseTask(long spotId){
		spotLogic.appraiseTask(spotId);
	}
	public String removeSpot(long spotId){
		Long userId = loginUser.isAdmin() ? null : loginUser.getUserId();
		return spotLogic.removeSpot(spotId, userId);
	}
	public String mergeSpot(long srcSpotId, long dstSpotId){
		checkLogin();
		//Long userId = loginUser.isAdmin() ? null : loginUser.getUserId();
		return spotLogic.mergeSpot(srcSpotId, dstSpotId);
	}
	//------------------------------------------------------------------------------
	// MySpot管理
	public  Long writeMySpot(Map map) throws Exception {
		checkLogin();
		return mySpotLogic.writeMySpot(map);
	}
	public  Long removeMySpot(long spotId) throws Exception {
		checkLogin();
		return mySpotLogic.removeMySpot(loginUser.getUserId(), spotId);
	}
	public List<SpotModel> listMySpot(Map map){
		checkLogin();
		return mySpotLogic.listSpot(map);
	}
	public List<SpotModel> listSpotForAddr(Map map){
		return spotLogic.listSpotForAddr(map);
	}

	public int recommand() throws Exception {
		checkLogin();
		return mySpotLogic.recommend(loginUser.getUserId());
	}
	public void recommandMySpotTask(long userId, long spotId, double appraise)
		throws Exception
	{
		mySpotLogic.recommandMySpot(userId, spotId, appraise);
	}
	public long checkin(long spotId, double lat, double lng)
		throws Exception
	{
		return mySpotLogic.checkin(spotId, lat, lng);
	}

	//------------------------------------------------------------------------------
	// Review管理
	public  List<ReviewModel> listReview(long spotId, List<Long> follows){
		return reviewLogic.listReview(spotId, follows);
	}
	public  ReviewModel getReview(long id) throws Exception{
		return reviewLogic.getReviewModel(id);
	}
	public  ReviewModel getTodo(long spotId) throws Exception{
		Long userId = checkLogin();
		return reviewLogic.getTodo(userId, spotId);
	}

	public  Long writeReview(Map map) throws Exception {
		checkLogin();
		mySpotLogic.writeMySpotFromReview(map);
		return reviewLogic.writeReview(map);
	}

	public  List<ReviewModel> listTimeline(Map map){
		return reviewLogic.collectReviewModels(timelineLogic.listTimeline(map));
	}
	public  List<ReviewModel> listTimeline(Long userId, Long spotId, long limit){
		return reviewLogic.collectReviewModels(timelineLogic.listTimeline(
				userId, spotId, (int)limit));
	}
	//------------------------------------------------------------------------------
	// Memo管理
	public  MemoModel getMemo(long userId, long spotId) throws Exception{
		return memoLogic.getMemoModel(userId, spotId);
	}

	public  Long writeMemo(Map map) throws Exception {
		checkLogin();
		return mySpotLogic.writeMySpotFromMemo(map);
	}
	//------------------------------------------------------------------------------
	// Google Place連係
	public long fromGooglePlace(Map map) throws Exception {
		checkLogin();
		try {
			int count = gplaceLogic.fromPlace(map);
			return count;
		} catch (IOException e) {
			LOG.warning(e.toString());
			return -1;
		}
	}

	//------------------------------------------------------------------------------
	// デバッグ
	public  void deleteDummyData(){
		SpotModelMeta e = SpotModelMeta.get();
		ModelQuery q = Datastore.query(e);
		q.filter(e.address.equal("ダミー"));
		List<Key> list = q.asKeyList();
		Datastore.delete(list);
		System.out.println("delete dummy");
	}
	// 
	public UserModel writeUserDebug(Map map) throws Exception {
		checkAdmin();
	
		Params params = new Params(map);
		//checkLogin(params.toLong("userId"));
		if (params.toString("googleUser") != null) {
			UserModel u = userLogic.getGoogleUser(params.toString("googleUser"), true);
			map.put("userId", u.getUserId());
		} else if (params.toString("twitterUser") != null) {
			UserModel u = userLogic.getTwitterUser(params.toString("twitterUser"), true);
			map.put("userId", u.getUserId());
		}

		UserModel user = userLogic.writeUser(map);
		user.setProvider(params.toString("provider"));
		return user;
	}
	public void setLoginUser(String name) throws Exception {
		checkAdmin();
		this.loginUser = userLogic.getGoogleUser(name, false);
	}
	public List<SpotModel> listAllSpot(){
		return spotLogic.listAllSpot();
	}
	public  Long writeTestSpot(Map map) throws Exception {
		checkLogin();
		Long spotId = spotLogic.writeSpot(map);
		map.put("spotId", spotId);
		map.put("spotName", map.get("name"));
		reviewLogic.writeReview(map);
		return spotId;
	}
	public Long setInvalid(Long id) {
		checkAdmin();
		return spotLogic.setInvalid(id);
	}
	public void setupTwitFlag() {
		checkAdmin();
		reviewLogic.setupTwitFlag();
	}
	public long setupGenre(long mode) {
		checkAdmin();
		List<String> genres = new ArrayList<String>(3);
		genres.add("food");
		genres.add("bar");
		genres.add("restaurant");

		java.util.Date date =  new java.util.Date();
		long count = 0;
	
		if (mode == 1) {
			SpotModelMeta e = SpotModelMeta.get();
			ModelQuery<SpotModel> q = Datastore.query(e);
			q.sort(e.updateDate.asc);
			q.limit(1000);
			Iterator<SpotModel> ite = q.asIterator();
			while (ite.hasNext()) {
				SpotModel model = ite.next();
				if (model.getGenres().size() == 0) {
					model.setGenres(genres);
					model.setUpdateDate(date);
					Datastore.put(model);
					count++;
				}
			}
			return count;
		}
		if (mode == 2) {
			MySpotModelMeta e = MySpotModelMeta.get();
			ModelQuery<MySpotModel> q = Datastore.query(e);
			q.sort(e.updateDate.asc);
			q.limit(1000);
			Iterator<MySpotModel> ite = q.asIterator();
			while (ite.hasNext()) {
				MySpotModel model = ite.next();
				if (model.getGenres().size() == 0) {
					model.setGenres(genres);
					model.setUpdateDate(date);
					Datastore.put(model);
					count++;
				}
			}
			return count;
		}
		if (mode == 3) {
			ReviewModelMeta e = ReviewModelMeta.get();
			ModelQuery<ReviewModel> q = Datastore.query(e);
			q.sort(e.updateDate.asc);
			q.limit(1000);
			Iterator<ReviewModel> ite = q.asIterator();
			while (ite.hasNext()) {
				ReviewModel model = ite.next();
				if (model.getGenres().size() == 0) {
					model.setGenres(genres);
					model.setUpdateDate(date);
					Datastore.put(model);
					count++;
				}
			}
			return count;
		}
		return -1;
	}

}
