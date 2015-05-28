// 1.モジュールオブジェクトの初期化
var fs = require("fs");
var server = require("http").createServer(function(req, res) {

    if(req.url.indexOf('.html') != -1){ //req.url has the pathname, check if it conatins '.html'
      fs.readFile(__dirname + 'index.html', function (err, data) {
        res.writeHead(200, {"Content-Type":"text/html"});
        var output = fs.readFileSync("./index.html", "utf-8");
        res.end(output);      
      });
    }else if(req.url.indexOf('.js') != -1){ 
      fs.readFile(__dirname + '/public/javascripts/jquery-1.7.1.min.js', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.write(data);
        res.end();
      });
    }else if(req.url.indexOf('.css') != -1){ 
      fs.readFile(__dirname + '/public/stylesheets/userpage.css', function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(data);
        res.end();
      });
    }else if(req.url == '/'){ 
      fs.readFile(__dirname + 'index.html', function (err, data) {
        res.writeHead(200, {"Content-Type":"text/html"});
        var output = fs.readFileSync("./index.html", "utf-8");
        res.end(output);      
      });
    }    

}).listen(8080);

var io = require("socket.io").listen(server);

// ユーザ管理ハッシュ
var userHash = {};

// 2.イベントの定義
io.sockets.on("connection", function (socket) {

  // 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
  socket.on("connected", function (name) {
    var msg = name + "が入室しました";
    userHash[socket.id] = name;
    io.sockets.emit("send", {value: msg});
  });

  // 名前変更カスタムイベント
  socket.on("changename", function (data) {
    var msg = "Name changed from " + userHash[socket.id] + " to " + data;
    userHash[socket.id] = data;
    io.sockets.emit("send", {value: msg});
  });

  // メッセージ送信カスタムイベント
  socket.on("send", function (data) {
    io.sockets.emit("send", {value: data.value});
  });

  socket.on("update", function (data) {
    var name = userHash[socket.id];
    var msg = data.value;
    socket.broadcast.emit("istyping", {name: name, msg: msg});
  });


  // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
  socket.on("disconnect", function () {
    if (userHash[socket.id]) {
      var msg = userHash[socket.id] + "が退出しました";
      delete userHash[socket.id];
      io.sockets.emit("send", {value: msg});
    }
  });

});
