const image = require('./image');
const notify = require('./notify');
const share = require('./share')

module.exports = (app) => {
  app.use('/', [
    image,
    share,
    notify,
  ]);
};