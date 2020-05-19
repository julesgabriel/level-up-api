const express = require('express')
    , passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy
    , session = require('express-session')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , config = require('./configuration/config')
    , mysql = require('mysql')
    , app = express()
    , db = require('./models')
    , fetch = require("node-fetch");

//Define MySQL parameter in Config.js file.
var cookieSession = require('cookie-session');

// Passport session setup.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


passport.use(new FacebookStrategy({
        clientID: config.facebook_api_key,
        clientSecret: config.facebook_api_secret,
        callbackURL: config.callback_url
    },
    function (accessToken, refreshToken, profile, done) {
        // ici il fait le garder en session (cookie parser)
        db.User.create({
            user: profile.displayName,
            token: accessToken,
            profile: profile.id
        }).then(submittedUser => res.send(submittedUser));
        process.nextTick(function () {
            console.log(profile);
            return done(null, profile);
        });
    }
));

/* 
console.log("le nom affiché est:" + displayName)
*/

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.render('index', {user: req.user});
});

app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', {user: req.user});
});

app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'user_posts'}));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/');
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.get('/posts', function (req, res) {
    function postFindOrCreate(data, json) {
        for (let i = 0; i <= json.data.length; i++) {
            let messageContent;
            let commentContent;
            let sharesContent;
            let pictureContent;
            messageContent = data[i].message === undefined ? null : data[i].message
            commentContent = data[i].comment === undefined ? null : data[i].comment
            sharesContent = data[i].shares === undefined ? null : data[i].shares
            pictureContent = data[i].full_picture === undefined ? null : data[i].full_picture

            db.Post.findOrCreate({
                where: {
                    fbid: data[i].id,
                    message: messageContent,
                    created_time: data[i].created_time,
                    full_picture: pictureContent,
                    comments: commentContent,
                    shares: sharesContent,
                },
            })
        }
    }

    let array;
    let utilisateur;
    let token;
    let profile;
    let response;

    db.User.findAll({
        where: {
            user: "Jules DAYAUX"
        }
    }).then(users => {
        array = users;
        db.User.findAll({
            where: {
                id: array.length
            }
        }).then(user => {
            utilisateur = user;
            /*res.send(user); */
            let base = user[0].dataValues;
            token = base.token;
            profile = base.profile;

            fetch(
                'https://graph.facebook.com/' + profile + '/feed?fields=id,message,created_time,full_picture,comments,shares&access_token=' + token
            ).then(res => res.json())
                .then(json => {
                    let data = json.data;
                    res.send(json);
                    postFindOrCreate(data, json)
                    let page = json.paging;

                    while (page)
                        fetch(page.next)
                            .then(response => res.json())
                            .then(jsonNext => {
                                let dataNext = jsonNext.data;

                            })

                });
        });
    });
});


app.listen(3000);
