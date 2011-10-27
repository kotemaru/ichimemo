package org.kotemaru.kokorahen.bean;

public class IndexAvg implements IndexNum {
	double value = 0;
	double count = 0;
	
	public double add(double val) {
		value = (value*count + val)/(count+1);
		count++;
		return value;
	}
	public double getValue() {
		return value;
	}
}
