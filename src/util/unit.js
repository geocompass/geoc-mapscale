'use strict';
module.exports = {
  adjustScaleValue(v) {
    // 厘米转换为米，如果不到1米使用cm表示
    if (v / 100 < 1) return v;
    // 厘米转换为米，如果不到1000米使用m表示
    if (v / 100 < 1000) return Math.round(v / 100) * 100;
    // 使用km表示
    return Math.round(v / 100000) * 100000;

  },
  /**
     * 厘米转换米或者千米，数值为使用adjustScaleValue取整之后的值
     * @param {Number} value 厘米数值
     */
  cmUnit(value) {
    const result = {
      value,
      unit: 'cm',
    };
    if (value > 100 && value < 100000) {
      result.value = value / 100;
      result.unit = 'm';
    } else {
      result.value = value / 100000;
      result.unit = 'km';
    }
    return result;
  },
};
