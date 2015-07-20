'use strict';
var http = require('http');
var express = require('express');
var mongoose = require('mongoose');

var cookieParser = require('cookie-parser')

// passport-twitter用
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);
var auth = require('./passport');
var passport = auth.passport;

// ルーティングファイルを指定
var routes = require('./routes');
var app = express();
var server = http.createServer(app);

// KEYなどの変数管理
var conf = require('config');


// passport-twitter と mongoDBの接続
app.use(cookieParser());
app.use(session({
  secret: 'secret',
   store: new MongoStore({
       db: 'session',
       host: process.env.MONGOLAB_URI || '127.0.0.1',
       clear_interval: 60 * 60,
   }),
   cookie: {
       httpOnly: false,
       maxAge: new Date(Date.now() + 60 * 60 * 1000)
   }
}));
app.use(passport.initialize());
app.use(passport.session());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// 静的ファイルのルートディレクトリを指定
app.use(express.static(__dirname + '/public'));

// ルーティングを設定
routes.configRoutes(app, server, passport);


// リッスン
server.listen(8080);
console.log('Listening on port %d in %s mode', server.address().port, app.settings.env);



var io = require("socket.io").listen(server);

// ユーザ管理ハッシュ
var userHash = {};

// 2.イベントの定義
io.sockets.on("connection", function (socket) {

  // 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
  socket.on("connected", function (data) {
    var msg = data.name + "が入室しました";
    var img = "/images/octocat.jpeg";
    //socket.to(socket.id).json.emit("send", {msg: msg, img: img});
    userHash[socket.id] = data.id;
    socket.broadcast.emit("send", {msg: msg, img: img, name: name});
  });
/*
  // 名前変更カスタムイベント
  socket.on("changename", function (data) {
    var msg = "Name changed from " + userHash[socket.id] + " to " + data;
    userHash[socket.id] = data;
    io.sockets.emit("send", {value: msg});
  });
*/
  // メッセージ送信カスタムイベント
  socket.on("send", function (data) {
    io.sockets.emit("send", {msg: data.msg, img: data.img});
  });

  socket.on("update", function (data) {
    var name = userHash[socket.id];
    io.sockets.emit("istyping", {msg: data.msg, img: data.img, id: data.id});
  });


  // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
  socket.on("disconnect", function () {
    if (userHash[socket.id]) {
      var msg = userHash[socket.id] + "が退出しました";
      var img = "/images/octocat.jpeg";
      delete userHash[socket.id];
      io.sockets.emit("send", {msg: msg, img: img});
    }
  });

});
