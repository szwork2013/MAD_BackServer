var express = require('express');
var router = express.Router();
var test = require('./user/ExportFunctionDemo');
var wilddog = require('wilddog');
var ref = new wilddog('https://wild-boar-00060.wilddogio.com/');
var user=require('./user/user');
var access=require('./user/access');
var advert = require('./user/advert');

/* GET users listing. */
router.get('/', function(req, res, next) {
   
  	test.b(function(){
    	console.log('this is callback function');
  	});
});
/* GET/POST lister*/
// router.get('/login',function (req,res,next) {
//   //code here
// })

/* user login interface */
router.post('/login',access.login);

/* user register interface */
router.post('/register',access.register);

/* user find password interface */
router.post('/findpwd',access.findpwd);

/* user alter password interface */
router.post('/alterpwd',access.alterpwd);

/* user get message list interface */
router.get('/msglist/:userid',access.msglist);

/* user get ad-used list interface */
router.get('/advert/all/:userid',advert.getAllAdUsed);

/* user get ad-used detail */
router.get('/advert/detail/:adid',advert.getDetail);

/* user set ad filter */
router.post('/advert/filter',advert.setFilter);

router.get('/advert/filter',advert.getFilter);

/* pad get advertisement id array according coordinate */
router.post('/advert/ids',advert.userGetAdsByCoordinate);

/* pad get the advertisement content with id */
router.post('/advert/content', advert.getAdvertContent);

/* user modify detail info */
router.post('/account/modify',user.modifyInfo);

/* user account detail info */
router.get('/account/:userId',user.accountInfo);

/* user draw money */
router.post('/account/withdraw',user.drawMoney);

/* user send validation */
router.post('/sendValidate',access.sendValidate);

/* user get withdraw record */
router.get('/withdraw/:userId',user.drawRecord);

/* user send submit informaition */
router.post('/check/submit',user.submitInfo);

/* user send modify information */
router.post('/account/modify',user.changeInfo);


module.exports = router;
