// 1.モジュールオブジェクトの初期化
var fs = require("fs");
var server = require("http").createServer(function(req, res) {
     res.writeHead(200, {"Content-Type":"text/html"});
     var output = fs.readFileSync("./index.html", "utf-8");
     res.end(output);
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
    io.sockets.emit("send", {value:data.value});
  });

  socket.on("update", function (data) {
    var msg = userHash[socket.id] + " is typing " + data.value;
    socket.broadcast.emit("istyping", {value:msg});
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