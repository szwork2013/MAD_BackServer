var Token = require('../../lib/publicUtils');
var moment = require('moment');
var User=require('./user');
var wilddog = require('wilddog');
var rootRef = new wilddog("https://wild-boar-00060.wilddogio.com/");
var userRef = rootRef.child('user');
var adRef = rootRef.child('advertisment');
var tokenRef=rootRef.child('token2id');
var validate=require('../user/sms-service');

/**
 * @interface
 * @description {interface} 用户登录，参数为用户名，密码
 */
exports.login=function(req,res) {
    var username=req.body.username;
    var password=req.body.password;
    var device=req.body.device || null;
    console.log(username,req.params,req.body);
    var result={};
    if(username==null|| password==null || username=='' || password==''){
        result.errCode=102;
        res.json(result);
    }
    else if(device == 'pad'){
        var ref=userRef.child(username);
        ref.once('value',function(snapshot) {
            if(snapshot.val()==null)
            {
                result.errCode = 102;
                res.json(result);
            }
            else{
                if(snapshot.val().password==password){
                    result.errCode=0;
                    result.userId=username;
                    // result.token=Token.getToken(result.userId);
                    result.uploadToken=Token.uptoken('madtest');
                    result.status=snapshot.val().status;
                    console.log(result.uploadToken);
                    rootRef.child('token2id').orderByChild('id').equalTo(result.userId).once('value',(snap)=>{
                        if(snap.val()==null){
                            result={};
                            result.errCode=102;
                            res.json(result);
                        }
                        else{
                            result.token=snap.key();
                            res.json(result);
                        }
                    });
                    // res.json(result);
                }else{
                    result.errCode=102;
                    res.json(result);
                }
            }
        })
    }
    else{
        var ref=userRef.child(username);
        ref.once('value',function(snapshot) {
            if(snapshot.val()==null)
            {
                result.errCode = 102;
                res.json(result);
            }
            else{
                if(snapshot.val().password==password){
                    result.errCode=0;
                    result.userId=username;
                    result.token=Token.getToken(result.userId);
                    result.uploadToken=Token.uptoken('madtest');
                    result.status=snapshot.val().status;
                    console.log(result.uploadToken);
                    res.json(result);
                }else{
                    result.errCode=102;
                    res.json(result);
                }
            }
        })
        // userRef.orderByChild('name').equalTo(username).on('value',function(snapshot) {
        //     console.log(snapshot.key());
        //     result.errCode=0;
        //     result.token=
        // });
    }
}


/**
 * @interface
 * @description {interface} 用户注册，参数为用户名，密码
 */
exports.register=function(req,res) {
    var name=req.body.name;
    var username=req.body.username;
    var password=req.body.password;
    console.log(username,req.params,req.body);
    var result={};
    if(username==null||username==''|| password==null||password==''){
        result.errCode=108;
        res.json(result);
    }
    else{
        userRef.child(username).once('value',(snap)=>{
            if(snap.val()!=null){
                result.errCode=105
                res.json(result);
            }else{
                var tk=Token.getToken(username);
                var newUser={};
                newUser[username]={
                    adUsedList:"",
                    alipay:'',
                    balance:0,
                    detail:{
                        VIN:'',
                        email:'',
                        gender:true,
                        vehicleLicense:'',
                        vehicleFrontImage:'',
                        vehicleLicenseImage :'',
                        registerDate:moment().format('YYYY-MM-DD HH-mm-ss') 
                    },
                    filter:{
                        accommodation:'',
                        commodity:'',
                        education:'',
                        entertainment:'',
                        other:'',
                        recruit:'',
                        service:'',
                        social:'',
                        tenancy:''  
                    },
                    message:"",
                    mobilePhone:username,
                    name:name,
                    password:password,
                    playTimes:0,
                    statistics:{
                        day:[],
                        hour:[],
                        mouth:[],
                        totalCash:0,
                        totalIncome:0
                    },
                    status:'010',
                    withdrawHistory:""
                };
                userRef.update(newUser,(err)=>{
                    if(err==null){
                        result.errCode=0;
                        result.token=tk;
                        result.userId=username;
                        res.json(result);
                    }else{
                        result.errCode=999;
                        result.message='update failed';
                        res.json(result);
                    }
                });
            }
        });
    }
}



/**
 * @interface
 * @description {interface} 用户找回密码，参数为手机号，新密码，验证码
 */
exports.findpwd=function(req,res) {
    var phoneNumber=req.body.phoneNumber;
    var newpwd=req.body.newpwd;
    var validationCode=req.body.validationCode;
    console.log(phoneNumber,newpwd,validationCode);
    //var theValidation=111111;
    validate.validateVCode(phoneNumber,validationCode,(status)=>{
        if(status){
            console.log('validate success');
            var pwdRef=userRef.child(phoneNumber);
            pwdRef.update({
                'password':newpwd
            });
            res.json({
                errCode:0
            });
        }
        else{
            console.log('validate error');
            res.json({
                errCode:103
            })
        }
    });
}


/**
 * @interface
 * @description {interface} 用户修改密码，参数为旧密码，新密码，会话令牌
 */
exports.alterpwd=function(req,res) {
    var oldPassword=req.body.oldPassword||null;
    var newPassword=req.body.newPassword||null;
    var token=req.body.token;
    var currentToken=tokenRef.child(token);
    var id;
    currentToken.once('value',function(snapshot) {
        id=snapshot.val();
        console.log(id);
        if(id==null){
            res.json({errCode:101});
            return;
        }
        var ref=userRef.child(id)||null;
    
        ref.once('value',function(snapshot) {
            var dogPassword=snapshot.val().password;
            if (dogPassword==oldPassword) {
                ref.update({
                    'password':newPassword
                });
                res.json({
                    errCode:0
                })
            }
            else{
                res.json({
                    errCode:103
                })
            }
        })
    });
    //var id=tokenRef.child(token).val();
    console.log(id);
   
}


/**
 * @interface
 * @description {interface} 获取消息列表
 */
exports.msglist=function(req,res) {
    console.log(req.query,req.params);
    var userId=req.params.userid;
    var token=req.query.token;
    var result={};
    console.log(token+'3');
    
    if(userId==null || userId==''||token==null||token==''){
        result.errCode=100;
        res.json(result);
    }else{
        var ref=userRef.child(userId)||null;
        ref.once('value',function(snapshot) {
            if(snapshot.val()==null){
                result.errCode=101;
            }
            else{
                var msglist=snapshot.val().message;
                result.errCode=0;
                result.messageList=msglist;
            }
             res.json(result);
        })
    }
}

/**
 * @interface
 * @description {interface} 发送验证码
 */

exports.sendValidate=function(req,res) {
    var phoneNumber=req.body.phoneNumber;
    if(phoneNumber==null){
        res.json({errCode:108});
        return;
    }
    validate.sendValidationCode(phoneNumber);
    var result={
        errCode:0
    };
    res.json(result);
}