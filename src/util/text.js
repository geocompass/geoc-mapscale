'use strict';
module.exports = {
  // 创建文字，x/y在左上角
  createText(ctx, x, y, text, { fontSize = 12, fontFamily = 'Arial', fontColor = 'black' } = {}) {
    // ctx.save();
    ctx.fillStyle = fontColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    const result = {
      height: fontSize,
      width: 0,
    };
    const text_width = Math.ceil(ctx.measureText(text).width);
    result.width = text_width;
    ctx.fillText(text, x, y);
    // ctx.restore();
    return result;
  },
//   // 创建文字，x/y 在右上角
//   createRightText(ctx, x, y, text, width, height, { fontSize = 12, fontFamily = 'Arial', fontColor = '#000' } = {}) {
//     ctx.save();
//     ctx.fillStyle = fontColor;
//     ctx.font = `${fontSize}px ${fontFamily}`;
//     const result = {
//       height: fontSize,
//       width: 0,
//     };
//     const text_width = Math.ceil(ctx.measureText(text).width);
//     result.width = text_width;
//     ctx.fillText(text, x, y);
//     ctx.restore();
//     return result;
//   },
};
