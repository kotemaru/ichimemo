package org.kotemaru.kokorahen.model;

import java.io.Serializable;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import org.slim3.datastore.Attribute;
import org.slim3.datastore.InverseModelRef;
import org.slim3.datastore.Model;

import com.google.appengine.api.datastore.Key;

@Model
public class SpotModel extends ModelBase {
	private static final long serialVersionUID = 1L;

	private List<String> genres;
	private String name;
	private String furikana;
	private Date createDate;
	private Date updateDate;
	private Double lat;
	private Double lng;
	private List<String> areas;
	private String address;
	private List<String> tags;
	private Float appraise = -1.0F;
	private String timeLunchMin;
	private String timeDinnerMin;
	private String timeLunchMax;
	private String timeDinnerMax;
	private String closedDay;
	private String email;
	private String url;
	private Boolean invalid = false;
	private Long masterSpotId;
	private Long owner;
	private Long updater;
	private String placeId;

	
	@Attribute(unindexed = true)
	private Long dupSpotId;
	@Attribute(unindexed = true)
	private Boolean closed = false;
	@Attribute(unindexed = true)
	private Float placeRating;
	@Attribute(unindexed = true)
	private String placeUrl;
	@Attribute(unindexed = true)
	private String image;
	@Attribute(unindexed = true)
	private String comment;

	
	@Attribute(persistent = false)
	private double distance;
	@Attribute(persistent = false)
	private Boolean temporal;  // true=フォロイーの推薦
	@Attribute(persistent = false)
	private Boolean checked; // true=確認済み
	@Attribute(persistent = false)
	private Float myAppraise;
	@Attribute(persistent = false)
	private List<String> myTags; 
	@Attribute(persistent = false)
	private String myMemo; 
	@Attribute(persistent = false)
	private Boolean mySpot = false; 

	public long getId() {
		return getKey().getId();
	}

	//-------------------------------------------------
	// Setter/Getter
	public List<String> getGenres() {
		return genres;
	}

	public void setGenres(List<String> genres) {
		this.genres = genres;
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}


	public Date getCreateDate() {
		return createDate;
	}


	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}


	public Date getUpdateDate() {
		return updateDate;
	}


	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}


	public Double getLat() {
		return lat;
	}


	public void setLat(Double lat) {
		this.lat = lat;
	}


	public Double getLng() {
		return lng;
	}


	public void setLng(Double lng) {
		this.lng = lng;
	}



	public List<String> getAreas() {
		return areas;
	}


	public void setAreas(List<String> areas) {
		this.areas = areas;
	}


	public String getAddress() {
		return address;
	}


	public void setAddress(String address) {
		this.address = address;
	}


	public List<String> getTags() {
		return tags;
	}


	public void setTags(List<String> tags) {
		this.tags = tags;
	}


	public Float getAppraise() {
		if (Float.isNaN(appraise)) return 0.0F;
		return appraise;
	}


	public void setAppraise(Float appraise) {
		this.appraise = appraise;
	}


	public String getImage() {
		return image;
	}


	public void setImage(String image) {
		this.image = image;
	}


	public String getComment() {
		return comment;
	}


	public void setComment(String comment) {
		this.comment = comment;
	}




	public String getTimeLunchMin() {
		return timeLunchMin;
	}


	public void setTimeLunchMin(String timeLunchMin) {
		this.timeLunchMin = timeLunchMin;
	}


	public String getTimeDinnerMin() {
		return timeDinnerMin;
	}


	public void setTimeDinnerMin(String timeDinnerMin) {
		this.timeDinnerMin = timeDinnerMin;
	}


	public String getTimeLunchMax() {
		return timeLunchMax;
	}


	public void setTimeLunchMax(String timeLunchMax) {
		this.timeLunchMax = timeLunchMax;
	}


	public String getTimeDinnerMax() {
		return timeDinnerMax;
	}


	public void setTimeDinnerMax(String timeDinnerMax) {
		this.timeDinnerMax = timeDinnerMax;
	}


	public String getClosedDay() {
		return closedDay;
	}


	public void setClosedDay(String closedDay) {
		this.closedDay = closedDay;
	}


	public String getEmail() {
		return email;
	}


	public void setEmail(String email) {
		this.email = email;
	}


	public String getUrl() {
		return url;
	}


	public void setUrl(String url) {
		this.url = url;
	}

	public String getFurikana() {
		return furikana;
	}

	public void setFurikana(String furikana) {
		this.furikana = furikana;
	}

	public double getDistance() {
		return distance;
	}

	public void setDistance(double distance) {
		this.distance = distance;
	}


	public Boolean getInvalid() {
		return invalid;
	}

	public void setInvalid(Boolean invalid) {
		this.invalid = invalid;
	}

	public Long getMasterSpotId() {
		return masterSpotId;
	}

	public void setMasterSpotId(Long masterSpotId) {
		this.masterSpotId = masterSpotId;
	}

	public Long getOwner() {
		return owner;
	}

	public void setOwner(Long owner) {
		this.owner = owner;
	}

	public Long getUpdater() {
		return updater;
	}

	public void setUpdater(Long updater) {
		this.updater = updater;
	}

	public String getPlaceId() {
		return placeId;
	}

	public void setPlaceId(String placeId) {
		this.placeId = placeId;
	}

	public Float getPlaceRating() {
		return placeRating;
	}

	public void setPlaceRating(Float placeRating) {
		this.placeRating = placeRating;
	}

	public Boolean getTemporal() {
		return temporal;
	}

	public void setTemporal(Boolean temporal) {
		this.temporal = temporal;
	}

	public Boolean getChecked() {
		return checked;
	}

	public void setChecked(Boolean checked) {
		this.checked = checked;
	}

	public Float getMyAppraise() {
		return myAppraise;
	}

	public void setMyAppraise(Float myAppraise) {
		this.myAppraise = myAppraise;
	}

	public List<String> getMyTags() {
		return myTags;
	}

	public void setMyTags(List<String> myTags) {
		this.myTags = myTags;
	}

	public String getMyMemo() {
		return myMemo;
	}

	public void setMyMemo(String myMemo) {
		this.myMemo = myMemo;
	}

	public String getPlaceUrl() {
		return placeUrl;
	}

	public void setPlaceUrl(String placeUrl) {
		this.placeUrl = placeUrl;
	}

	public Boolean getClosed() {
		return closed;
	}

	public void setClosed(Boolean closed) {
		this.closed = closed;
	}

	public Long getDupSpotId() {
		return dupSpotId;
	}

	public void setDupSpotId(Long dupSpotId) {
		this.dupSpotId = dupSpotId;
	}

	public Boolean getMySpot() {
		return mySpot;
	}

	public void setMySpot(Boolean mySpot) {
		this.mySpot = mySpot;
	}




}
