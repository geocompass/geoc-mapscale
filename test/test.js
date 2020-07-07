'use strict';
const MapScale = require('./mapscale');
const mapscale = new MapScale(Math.floor(580000), { dpi: 300 });
mapscale.getCanvas();
