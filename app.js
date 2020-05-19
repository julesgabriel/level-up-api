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
    let array;
    let utilisateur;
    let token;
    let profile;
    let response;
    let allDataJson = [];
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
            )
                .then(res => res.json())
                .then(json => {
                    let data = json.data
                    //res.send(json.paging.next)
                    postFindOrCreate(json).then(r => console.log('ntm ' + r))
                })

        });
    });

    async function postFindOrCreate(json) {
        let x = json.data;
        for (let i = 0; i <= x.length; i++) {
            let messageContent;
            let commentContent;
            let sharesContent;
            let pictureContent;
            messageContent = x[i].message === undefined ? null : x[i].message
            commentContent = x[i].comment === undefined ? null : x[i].comment
            sharesContent = x[i].shares === undefined ? null : x[i].shares.count
            pictureContent = x[i].full_picture === undefined ? null : x[i].full_picture
            db.Post.findOrCreate({
                where: {
                    fbid: x[i].id,
                    message: messageContent,
                    created_time: x[i].created_time,
                    full_picture: pictureContent,
                    comments: commentContent,
                    shares: sharesContent,
                },
            })
            allDataJson.push(x)
            if (i + 1 === json.data.length) {
                console.log("json paging : " + json.paging)
                if (json.paging) {
                    console.log('je rentre')
                    fetch(json.paging.next)
                        .then(res => res.json())
                        .then(jsonNext => {
                            console.log("HEY NTM " + jsonNext.data.length)
                            if (!jsonNext.paging) {
                                res.send(allDataJson);
                            } else {
                                console.log('jules')
                                postFindOrCreate(jsonNext)
                            }
                        })
                }
            }
        }
    }
});


app.listen(3000);
