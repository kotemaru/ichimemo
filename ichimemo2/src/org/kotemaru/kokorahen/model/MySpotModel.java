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
public class MySpotModel extends ModelBase {
	private static final long serialVersionUID = 1L;

	private Long spotId;
	private Long userId;
	private String name;
	private String furikana;
	private Date createDate;
	private Date updateDate;
	private Double lat;
	private Double lng;
	private List<String> areas;
	private List<String> tags;
	private Float appraise = 0.0F;
	private String memo = null;

	private Boolean temporal;  // true=フォロイーの推薦
	private Boolean checked; // true=確認済み

	
	public long getId() {
		return getKey().getId();
	}
	//-------------------------------------------------
	// Setter/Getter


	public Long getSpotId() {
		return spotId;
	}


	public void setSpotId(Long spotId) {
		this.spotId = spotId;
	}


	public Long getUserId() {
		return userId;
	}


	public void setUserId(Long userId) {
		this.userId = userId;
	}


	public String getName() {
		return name;
	}


	public void setName(String name) {
		this.name = name;
	}


	public String getFurikana() {
		return furikana;
	}


	public void setFurikana(String furikana) {
		this.furikana = furikana;
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


	public List<String> getTags() {
		return tags;
	}


	public void setTags(List<String> tags) {
		this.tags = tags;
	}


	public Float getAppraise() {
		return appraise;
	}


	public void setAppraise(Float appraise) {
		this.appraise = appraise;
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


	public String getMemo() {
		return memo;
	}


	public void setMemo(String memo) {
		this.memo = memo;
	}


}
