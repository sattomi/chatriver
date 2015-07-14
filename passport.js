// http://passportjs.org/guide/twitter/

//var conf = require('config');
var mongoose = require('mongoose');

var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

// ./config/default.jsonから変数の読み出し
//var TWITTER_CONSUMER_KEY    = conf.twitter.CONSUMER_KEY;
//var TWITTER_CONSUMER_SECRET = conf.twitter.CONSUMER_SECRET;

var TWITTER_CONSUMER_KEY    = process.env.CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.CONSUMER_SECRET;

mongoose.connect(process.env.MONGOLAB_URI);


passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://localhost:8080/auth/twitter/callback"
  },
  // TODO: db関連のコードを別ファイルに移動する
  function(token, tokenSecret, profile, done) {
    return User.findOne({ twitter_id: profile.id}, 
      function(err, user) {
        if (user) {
          return done(null, user);
        }
        user = new User;
        user.twitter_id  = profile.id;
        user.name        = profile.username;
        user.screen_name = profile.displayName;
        user.description = profile._json.description;
        user.url         = profile._json.url;
        user.image       = profile._json.profile_image_url;
        return user.save(function(err) {
          return done(err, user);
      });
    });

  passport.session.id = profile.id;

  }
));

// Sessionの設定
// http://passportjs.org/guide/configure/
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    console.log(user)
    done(err, user);
  });
});


var userSchema = new mongoose.Schema({
     twitter_id : Number
  ,        name : String
  , screen_name : String
  , description : String
  ,         url : String
  ,       image : String
});


var User = mongoose.model('User', userSchema);



module.exports = {passport: passport};
