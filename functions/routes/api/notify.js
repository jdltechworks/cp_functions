var express = require('express');
var route = express.Router();
var nodemailer = require('nodemailer');
var hogan = require('hogan.js');
var sgTransport = require('nodemailer-sendgrid-transport');
var fs = require('fs');

var template = fs.readFileSync('./views/notify.hjs', 'utf-8');
var _template = hogan.compile(template);

var apiUser = process.env.API_USER || '';
var apiKey = process.env.API_PASS || ''


var options = {
  auth: {
    api_user: apiUser,
    api_key: apiKey
  }
};


var mailer = nodemailer.createTransport(sgTransport(options));

/* GET users listing. */
route.post('/', async (req, res) => {
  var mailData = {
    to: req.body.user,
    from: req.body.email,
    subject: `notification from: ${req.body.email} ${req.body._id} ${req.body.name}`,
    html: _template.render({
      id: req.body._id, 
      note: req.body.note, 
      image: req.body.images[0], 
      name: req.body.name,
      firstName: req.body.firstName,
      description: req.body.description
    })
  }
  await mailer.sendMail(mailData, async (err, data) => {
    if(err) {
      res.json({error: 'error'});
    }
    res.json(data);
  });
});

module.exports = route;
