/**
 * Created by Teng on 2016/4/25.
 */

var memcached = require('memcached');
var Q = require('q');
var wilddog = require('wilddog');
var advertisementRef = new wilddog('https://wild-boar-00060.wilddogio.com/advertisment');
var cityRef = new wilddog('https://wild-boar-00060.wilddogio.com/AdsInCitys');

module.exports = Advertisement;

function Advertisement(obj) {
  	for (var key in obj) {
    	this[key] = obj[key];
  	}
}

// 获取所有已发布广告
Advertisement.getAllAdvertisement = function(id) {
	var defer = Q.defer();
	console.log(id);
	advertisementRef.orderByChild("advertiser").equalTo(id).on("value", function (snapshot) {
		defer.resolve(snapshot.val());
	});
	return defer.promise;
};

// 获取投放商圈列表
Advertisement.district = function (city) {
	var defer = Q.defer();
	var districts = new Array;
	cityRef.child(city).on("value", function (snapshot) {
		console.log(snapshot.val());
		snapshot.forEach(function (district) {
			districts.push(district.val().name);
		});
		console.log(districts);
		defer.resolve(districts);
	});
	return defer.promise;
};

// 发布广告
Advertisement.releaseNewAdvert = function (id, callback) {
	// 判断广告是否存在
	thereIsAdvertisement(id)
		.then(function (data) {
			if (data === null) {
				// 广告不存在，错误
				var noAdvert = new Error('201');
				callback(noAdvert);
			} else {
				// 根据广告ID修改广告状态
				advertisementRef.child(id).update({
					"status": "100"
				}, function (err) {
					if (err === null) {
						callback(null, id);
					} else {
						console.log('广告发布出现错误：');
						console.log(err);
						var err = new Error('209');
						callback(err);
					}
				});
			}
		});
};

/**
 * 检查广告是否属于广告商
 */
function checkAdvertiser(advertiserId) {
	
}

/**
 * 检查广告是否存在
 */
function thereIsAdvertisement(advertiserId) {
	var deferred = Q.defer();
	advertisementRef.child(advertiserId).once('value', function (snapshot) {
		deferred.resolve(snapshot.val());
	});
	
	return deferred.promise;
}

Advertisement.saveAdvert = function (id, data, callback) {
	var newPush = advertisementRef.push({
		"advertiser": id,
		"title": data.title,//广告标题
		"content": data.content,//广告内容
		"catalog": data.catalog,//广告类别
		"broadcastLocation": data.broadcastLocation,//投放地点商圈名
		"startDate": data.startDate, //广告开始投放日期
		"endDate": data.endDate, //广告停止投放日期
		"status": "010" //保存为草稿
	},function(err){
		callback(err,newPush.key());
	});
};

Advertisement.removeAdvertById = function (id, adId, callback) {
	var defer = Q.defer();
	var advert = advertisementRef.child(adId);
	advert.on("value", function (snapshot) {
		//验证
		if (snapshot.val().advertiser == id) {
			advert.update({
				"status":"101"
			},function(err){
				defer.resolve();
				callback(err);
				console.log(err);
			});
		} else {
			defer.resolve();
			callback("这不是您的广告");
		}
	});
	return defer.promise;
};

Advertisement.getAdvertById = function (id) {
	var defer = Q.defer();
	advertisementRef.child(id).on("value", function (snapshot) {
		defer.resolve(snapshot.val());
	});
	return defer.promise;
};

Advertisement.broadcastOnce = function (id) {
	var defer = Q.defer();
	advertisementRef.child(id).once("value", function (snapshot) {
		//验证
		if (snapshot.val().status == "001") {
			var broadcastTimes = snapshot.val().broadcastTimes;
			advertisementRef.child(id).update({
				broadcastTimes: broadcastTimes+1
			}, function(err){
				defer.resolve();
				callback(err);
			});
		} else {
			defer.reject("206"); //广告状态错误
		}
	});
	return defer.promise;
};