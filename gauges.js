// round gauge with a single line of text (value+units)
function drawRoundGauge(canvasID, value, minAngle = 270, maxAngle = 630, minValue = 0, maxValue = 360, units = '') {
  let canvas = document.getElementById(canvasID);
  //get context
  let gauge = canvas.getContext('2d');
  // get properties of canvas
  width = Number(getComputedStyle(canvas).getPropertyValue("width").slice(0, -2));
  height = Number(getComputedStyle(canvas).getPropertyValue("height").slice(0, -2));

  // to find radius for gauge
  if (width >= height) {
    size = height;
  } else {
    size = width;
  }
  // clear canvas
  gauge.clearRect(0, 0, width, height); // clear canvas

  // adjust dimensions based on canvas dimensions
  gauge.lineWidth = height * 0.04;
  gaugeRadius = (-gauge.lineWidth - height * 0.1) + height / 2;
  gaugeFontSize = height / 10;
  gauge.font = gaugeFontSize + "px Arial";
  needleBase = height * 0.04;
  needleHeight = needleBase * 3.2;

  // set colours from CSS
  gauge.fillStyle = "#bbbbbb";
  gauge.strokeStyle = "#bbbbbb";

  // print wind direction, speed and Beaufort description in centre of dial
  gauge.textAlign = "center";

  gauge.fillText(value + " " + units, width / 2, height / 2);

  gauge.fillStyle = cssvar('--wind-needle-colour');
  gauge.strokeStyle = cssvar('--wind-gauge-colour');

  // draw dial
  gauge.beginPath();

  gauge.translate(width / 2, height / 2);

  gauge.arc(0, 0, gaugeRadius, minAngle * Math.PI / 180, maxAngle * Math.PI / 180);
  // x=0,y=0,radius,start angle 0= 3 o'clock, end angle, <direction>
  gauge.stroke();

  // draw needle
  gauge.beginPath();



  needleAngle = (maxAngle - minAngle) * (value - minValue) / (maxValue - minValue);


  gauge.rotate(-(270 - minAngle) * Math.PI / 180);

  gauge.rotate(needleAngle * Math.PI / 180); //rotate to draw at current deg value
  gauge.translate(0, -gaugeRadius - gauge.lineWidth / 2); // move to radius
  gauge.lineTo(needleBase, 0); // draw half of base line
  gauge.lineTo(0, needleHeight); // draw to point
  gauge.lineTo(-needleBase, 0); // draw back to other end of base line
  gauge.fill(); // close fill triangle

  gauge.translate(0, gaugeRadius + gauge.lineWidth / 2); // move back to centre of canvas

  gauge.rotate(-needleAngle * Math.PI / 180); //rotate back
  gauge.rotate((270 - minAngle) * Math.PI / 180);
  gauge.translate(-width / 2, -height / 2); // move back to (0,0) ready for next animation

}

// initialise canvas to size of parent
async function initCanvas(canvasID) {

  //get canvas
  let canvas = document.getElementById(canvasID);

  //get context
  let ctx = canvas.getContext('2d');

  function parentWidth(elem) {
    return elem.parentElement.clientWidth;
  }

  function parentHeight(elem) {
    return elem.parentElement.clientHeight;
  }

  // gets width and height of parent and sets canvas to match
  parentWidth = parentWidth(document.getElementById(canvasID));
  parentHeight = parentHeight(document.getElementById(canvasID));
  canvasWidth = parentWidth;
  canvasHeight = parentHeight;

  // scale canvas to match screen for sharpness
  scale = window.devicePixelRatio;
  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  ctx.scale(scale, scale);
  // now that canvas is initialised it can be drawn on
}
