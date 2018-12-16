var express = require('express');
var route = express.Router();
var nodemailer = require('nodemailer');
var hogan = require('hogan.js');
var sgTransport = require('nodemailer-sendgrid-transport');
var fs = require('fs');

var template = fs.readFileSync('./views/share.hjs', 'utf-8');
var _template = hogan.compile(template);

var apiUser = 'coloured_pencil';
var apiKey =  'ColouredPencil2015!';


var options = {
  auth: {
    api_user: apiUser,
    api_key:  apiKey
  }
}


var mailer = nodemailer.createTransport(sgTransport(options));

/* GET users listing. */
route.post('/', async (req, res)  => {
  var mailData = {
    to: req.body.receipient,
    from: 'no-reply.colouredpencil.com.au',
    subject: req.body.subject,
    html: _template.render({
      message: req.body.message, 
      link: req.body.data
    })
  }
  await mailer.sendMail(mailData, async (err, data) => {
    if(err) {
      
      res.json({error: 'error'});
    }
    res.json({sucess: 'success'});
  });
});

module.exports = route;
