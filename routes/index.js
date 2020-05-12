var express = require('express');
var router = express.Router();
const db = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/posts', function(req, res, next){
  let token;

  /** exports.getOneUser = (res, req) => {
    db.User.findAll({
      where: {

      }
    }).then(user => res.send(user)); **/


  };


})



module.exports = router;
