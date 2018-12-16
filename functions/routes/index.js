const api = require('./api');
const tasks = require('../tasks'); 
module.exports = (app) => {
  api(app);
};