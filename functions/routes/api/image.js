const express = require('express');

const route = express.Router();

const sharp = require('sharp');

const gcs = require('@google-cloud/storage')();

route.get('/image/:size/:filename', async (req, res) => {
  const bucket = gcs.bucket('firebase-colouredpencil.appspot.com');
  
  let file = await bucket.file(`images/${req.params.filename}`);
  
  let readStream = await file.createReadStream();

  res.setHeader("content-type", "image/jpeg");

  const settings = {
    tile: {
      width: 480,
      height: 385
    },
    thumb: {
      width: 135,
      height: 135
    },
    preview: {
      width: 100,
      height: 100
    },
  };

  const defaultDimension = { width: 1480, height: 1350 };
  
  const validParam = Object.keys(settings).includes(req.params.size);

  const dimension = validParam ? settings[req.params.size] : defaultDimension;

  const transformer = await sharp().resize(dimension.width, dimension.height, {
    kernel: sharp.kernel.nearest,
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  });
  
  await readStream.pipe(transformer).pipe(res);

});

module.exports = route;