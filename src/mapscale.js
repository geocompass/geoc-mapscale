'use strict';
const dpiCalculate = require('./util/dpi-calculate');
const unit = require('./util/unit');
const textUtil = require('./util/text');
const BaseUtil = require('./base-util');
class MapScale extends BaseUtil {
  /**
   * 比例尺类
   * @param {Number} scaleValue 比例尺数值，1cm对应的值，单位为厘米
   * @param {Object} options 配置项
   * @param {Number} options.segmentNum 比例尺条的段数
   */
  constructor(scaleValue, { dpi = 96, segmentNum = 4, fontSize = 12 } = {}) {
    super();
    if (scaleValue < 0) {
      // throw
      console.error(new Error('比例尺数值需要大于0！'));
      return;
    }
    this.initialScaleValue = scaleValue;
    const adjustScaleValue = unit.adjustScaleValue(this.initialScaleValue);
    const convertScale = unit.cmUnit(adjustScaleValue);
    this.scaleValue = convertScale.value;
    this.unit = convertScale.unit;
    this.dpi = dpi;
    this.segmentNum = segmentNum;
    this.fontSize = Math.round(dpiCalculate.calculateVal(dpi, fontSize));
    // 根据比例尺条的长度以及dpi计算像素宽高，单位为厘米
    this.singleSegmentPixelWH = dpiCalculate.calculateWH(dpi, 1, adjustScaleValue / this.initialScaleValue); // 值被向上取整
    this.canvasWidth = this.singleSegmentPixelWH.width * this.segmentNum;
    this.canvasHeight = this.singleSegmentPixelWH.height * this.segmentNum;
    this.barPadding = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
    this.initCtx(this.canvasWidth, this.canvasHeight);
    const textPixelWH = this._getTextPixelWH();
    const textBarInterval = Math.ceil(dpiCalculate.calculateVal(dpi, 2));
    this.canvasWidth = this.canvasWidth + textPixelWH.width;
    this.canvasHeight = this.canvasHeight + textPixelWH.height + textBarInterval;
    this.setCanvasWH(this.canvasWidth, this.canvasHeight);
    this.initLayer();
    this._drawText();
    this._addTextToCanvas();
    this.barPadding.top = this.barPadding.top + textBarInterval;
    this._drawBar();
    this._addBarToCanvas();

  }
  _getTextPixelWH() {
    const result = {
      width: 0,
      height: this.fontSize,
    };
    result.width = Math.ceil(this.ctx.measureText(unit.cmUnit(this.scaleValue).value + unit.cmUnit(this.scaleValue).unit).width);
    return result;
  }
  /**
   * 获取画布宽高
   * @return {{canvasWidth: Number, canvasHeight: Number}}
   */
  getCanvasWH() {
    return {
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    };
  }
  setCanvasWH(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
  initCtx(width, height) {
    this.canvas = this.document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
  }
  initLayer() {
    const barCanvas = this.document.createElement('canvas');
    barCanvas.width = this.canvasWidth;
    barCanvas.height = this.canvasHeight;
    this.barLayer = {
      canvas: barCanvas,
      width: barCanvas.width,
      height: barCanvas.height,
      ctx: barCanvas.getContext('2d'),
    };
    const textCanvas = this.document.createElement('canvas');
    textCanvas.width = this.canvasWidth;
    textCanvas.height = this.canvasHeight;
    this.textLayer = {
      canvas: textCanvas,
      width: textCanvas.width,
      height: textCanvas.height,
      ctx: textCanvas.getContext('2d'),
    };
  }
  _drawText() {
    // 绘制1
    let left = Math.floor(this.getTextWidth(this.textLayer.ctx, '0') / 2);
    let textResult = textUtil.createText(this.textLayer.ctx, left, this.fontSize, '0', { fontSize: this.fontSize });
    this.barPadding.top = textResult.height > this.barPadding.top ? textResult.height : this.barPadding.top;
    // const unitText = unit.cmUnit(this.scaleValue);
    const wh = this.singleSegmentPixelWH;
    // 绘制中间部分
    for (let i = 1; i < this.segmentNum; ++i) {
      left = wh.width * i - Math.floor(this.getTextWidth(this.textLayer.ctx, this.scaleValue * i) / 2);
      textResult = textUtil.createText(this.textLayer.ctx, left, this.fontSize, this.scaleValue * i, { fontSize: this.fontSize });
      this.barPadding.top = textResult.height > this.barPadding.top ? textResult.height : this.barPadding.top;
    }
    // 绘制最后
    left = wh.width * this.segmentNum - Math.floor(this.getTextWidth(this.textLayer.ctx, this.scaleValue * this.segmentNum + this.unit) / 2);
    textResult = textUtil.createText(this.textLayer.ctx, left, this.fontSize, this.scaleValue * this.segmentNum + this.unit, { fontSize: this.fontSize });
    this.barPadding.top = textResult.height > this.barPadding.top ? textResult.height : this.barPadding.top;
  }
  getTextWidth(ctx, text) {
    return ctx.measureText(text).width;
  }
  _addTextToCanvas() {
    this.ctx.drawImage(this.textLayer.canvas, 0, 0, this.textLayer.width, this.textLayer.height, 0, 0, this.canvasWidth, this.canvasHeight);
  }

  /**
   * 绘制比例尺条
   */
  _drawBar() {
    for (let i = 0; i < this.segmentNum; ++i) {
      const pixelWH = this.singleSegmentPixelWH;
      if (i % 2 === 0) {
        this._drawSingleFillBar(this.barLayer.ctx, pixelWH.width * i, 0 + this.barPadding.top, pixelWH.width, pixelWH.height, 'black');
      } else {
        this._drawSingleStrokeBar(this.barLayer.ctx, pixelWH.width * i, 0 + this.barPadding.top, pixelWH.width, pixelWH.height, 'black');
      }
    }
  }
  _addBarToCanvas() {
    this.ctx.drawImage(this.barLayer.canvas, 0, 0, this.barLayer.width, this.barLayer.height, 0, 0, this.canvasWidth, this.canvasHeight);
  }
  /**
   * 绘制单个比例尺颜色填充条
   * @param {Context2d} ctx 画笔
   * @param {Number} x x
   * @param {Number} y x
   * @param {Number} width 宽
   * @param {Number} height 高
   * @param {String} color 颜色
   */
  _drawSingleFillBar(ctx, x, y, width, height, color = 'red') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }
  /**
   * 绘制单个比例尺无填充条
   * @param {Context2d} ctx 画笔
   * @param {Number} x x
   * @param {Number} y x
   * @param {Number} width 宽
   * @param {Number} height 高
   * @param {String} color 颜色
   */
  _drawSingleStrokeBar(ctx, x, y, width, height, color = 'red') {
    ctx.save();
    ctx.strokeStyle = color;
    // 绘制线边框时，绘制时线宽中间为画笔，需要考虑线宽
    const lineWdith = Math.ceil(2 * 96 / this.dpi);
    ctx.lineWidth = lineWdith;
    // ctx.strokeRect(x, y, width, height);
    ctx.moveTo(x, y + lineWdith / 2);
    ctx.lineTo(x + width, y + lineWdith / 2);
    ctx.lineTo(x + width, y + height - lineWdith / 2);
    ctx.lineTo(x, y + height - lineWdith / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  getCanvas() {
    return this.canvas;
  }

}
module.exports = MapScale;
