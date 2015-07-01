'use strict';

var configRoutes;
var fs = require('fs');
var passport = require('passport');

configRoutes = function(app, server, passport) {

    app.get('/authenticated', function(req, res, next) {
        // 認証チェックの確認
        console.log(req.user)
        console.log(passport)
        if(req.session && req.session.id){
            // fs.readFile('./authenticated/secret.html', 'utf8', function (error, html) {
            //     response.send(html);
            // });
            res.render('chat.ejs', {      name: req.user.name,
              image_url: req.user.image,
              description: req.user.screen_name,
            });
        } else {
            response.redirect('/login');
        }
    });

    app.get('/login', function(request, response) {
        response.redirect('/login.html');
    });

    //TODO: route以下の場合も認証ありなしで場合分けする
    app.get('/', function(request, response) {
        response.redirect('/login.html');
    });


    // passport-twitter
    // http://passportjs.org/guide/twitter/
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', { successRedirect: '/authenticated',
                                           failureRedirect: '/login' }));

}

module.exports = {configRoutes: configRoutes};
