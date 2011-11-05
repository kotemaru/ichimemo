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
public class ReviewModel extends ModelBase {
	private static final long serialVersionUID = 1L;

	private Long userId;
	private Long spotId;
	private String spotName;
	private String spotKana;
	private Date createDate;
	private Date updateDate;
	private String comment;
	private Float appraise;
	private List<String> tags;
	private String photoUrl;
	private Double lat;
	private Double lng;
	private List<String> areas;
	private Boolean checked;
	private Boolean twit = false;

	@Attribute(persistent = false)
	private String nickname;
	@Attribute(persistent = false)
	private String userPhotoUrl;

	public long getId() {
		return getKey().getId();
	}


	public Long getUserId() {
		return userId;
	}


	public void setUserId(Long userId) {
		this.userId = userId;
	}


	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	public Long getSpotId() {
		return spotId;
	}

	public void setSpotId(Long spotId) {
		this.spotId = spotId;
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

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public Float getAppraise() {
		return appraise;
	}

	public void setAppraise(Float appraise) {
		this.appraise = appraise;
	}

	public List<String> getTags() {
		return tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags;
	}

	public String getSpotName() {
		return spotName;
	}

	public void setSpotName(String spotName) {
		this.spotName = spotName;
	}

	public String getSpotKana() {
		return spotKana;
	}

	public void setSpotKana(String spotKana) {
		this.spotKana = spotKana;
	}

	public String getUserPhotoUrl() {
		return userPhotoUrl;
	}

	public void setUserPhotoUrl(String photoUrl) {
		this.userPhotoUrl = photoUrl;
	}


	public String getPhotoUrl() {
		return photoUrl;
	}


	public void setPhotoUrl(String photoUrl) {
		this.photoUrl = photoUrl;
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


	public Boolean getChecked() {
		return checked;
	}


	public void setChecked(Boolean checked) {
		this.checked = checked;
	}


	public Boolean getTwit() {
		return twit;
	}


	public void setTwit(Boolean twit) {
		this.twit = twit;
	}




}