'use strict';
const BaseDPI = 96;
module.exports = {
  calculateWH(dpi, singleCM, ratio) {
    const width = Math.floor(dpi * singleCM / 2.54 * ratio);
    let height = 10;
    height = Math.floor(height * dpi / BaseDPI * ratio);
    return {
      width,
      height,
    };
  },
  calculateVal(dpi, val) {
    return val * dpi / BaseDPI;
  },
};
