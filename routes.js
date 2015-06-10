'use strict';

var configRoutes;
var fs = require('fs');

configRoutes = function(app, server, passport) {
    app.get('/authenticated', function(request, response) {
        // 認証保護
        if(passport.session && passport.session.id){
            fs.readFile('./authenticated/secret.html', 'utf8', function (error, html) {
                response.send(html);
            });
        } else {
            response.redirect('/login');
        }   
    });

    app.get('/login', function(request, response) {
        response.redirect('/login.html');
    });

    app.get('/', function(request, response) {
        response.redirect('/login.html');
    });

    // passport-twitter ----->
    // http://passportjs.org/guide/twitter/
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', 
        passport.authenticate('twitter', { successRedirect: '/authenticated',
                                           failureRedirect: '/login' }));
    // <-----
}

module.exports = {configRoutes: configRoutes};