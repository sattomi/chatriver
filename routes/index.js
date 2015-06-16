/*

//モデル読み込み
var model = require('../model.js'),
    User  = model.User;

//ログイン後ページ
exports.index = function(req, res){
    res.render('index', { user: req.session.user});
    console.log(req.session.user);
};

//ユーザー登録機能
exports.add = function(req, res){
    var newUser = new User(req.body);
    newUser.save(function(err){
        if(err){
            console.log(err);
            res.redirect('back');
        }else{
            res.redirect('/');
        }
    });
};

//ログイン機能
exports.login = function(req, res){
    var userid   = req.query.userid;
    var password = req.query.password;
    var query = { "userid": userid, "password": password };
    User.find(query, function(err, data){
        if(err){
            console.log(err);
        }
        if(data == ""){
            res.render('login');
        }else{
            req.session.user = userid;
            res.redirect('/');
        }
    });
};

*/