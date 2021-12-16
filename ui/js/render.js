// https://codeboxsystems.com/tutorials/en/how-to-drag-and-drop-objects-javascript-canvas/

var Rectangle = function(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.isDragging = false;

  this.render = function(ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.rect(this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);
    //ctx.fillStyle = '#2793ef';
    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.restore();
  }
}

var Arc = function(x, y, radius, radians) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.radians = radians;
  this.isDragging = false;

  this.render = function(ctx) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);
    //ctx.fillStyle = '#2793ef';
    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.restore();
  }
}

var MouseTouchTracker = function(canvas, callback, scale){

  function processEvent(evt) {
    var rect = canvas.getBoundingClientRect();
    var offsetTop = rect.top;
    var offsetLeft = rect.left;

    if (evt.touches) {
      return {
        x: evt.touches[0].clientX - offsetLeft,
        y: evt.touches[0].clientY - offsetTop
      }
    } else {
      return {
        x: evt.clientX - offsetLeft,
        y: evt.clientY - offsetTop
      }
    }
  }

  function onDown(evt) {
    evt.preventDefault();
    var coords = processEvent(evt);

    console.log('CLICK x: %d y: %d', coords.x, coords.y);

    //var mx = coords.x;
    //var my = coords.y;

    //var mx = coords.x;
    //var my = coords.y;

    //var mx = coords.x * 1.5;
    //var my = coords.y * 1.5;

    var mx = coords.x * 1.0/scale;
    var my = coords.y * 1.0/scale;


    //var mx = coords.x * 800.0 / (512.0 * 1.5);
    //var my = coords.y * 600.0 / (512.0 * 1.5);

    //var mx = coords.x * 800.0 / 512.0 * 1.5;
    //var my = coords.y * 600.0 / 512.0 * 1.5;

    //var mx = coords.x * 512.0 / 800.0 * 1.5;
    //var my = coords.y * 512.0 / 600.0 * 1.5;

    //var mx = coords.x / 512.0 * (800.0 * 1.5);
    //var my = coords.y / 512.0 * (600.0 * 1.5);

    //var mx = coords.x / 800.0 * (512.0 * 1.5);
    //var my = coords.y / 600.0 * (512.0 * 1.5);

    console.log('CLICK Mx: %d My: %d', mx, my);

    callback('down', mx, my);
  }

  function onUp(evt) {
    evt.preventDefault();
    callback('up');
  }

  function onMove(evt) {
    evt.preventDefault();
    var coords = processEvent(evt);

    //console.log('MOVE x: %d y: %d', coords.x, coords.y);

    //var mx = coords.x;
    //var my = coords.y;

    //var mx = coords.x * 1.5;
    //var my = coords.y * 1.5;

    var mx = coords.x * 1.0/scale;
    var my = coords.y * 1.0/scale;

    //var mx = coords.x * 800.0 / (512.0 * 1.5);
    //var my = coords.y * 600.0 / (512.0 * 1.5);

    //var mx = coords.x * 800.0 / 512.0 * 1.5;
    //var my = coords.y * 600.0 / 512.0 * 1.5;

    //var mx = coords.x * 512.0 / 800.0 * 1.5;
    //var my = coords.y * 512.0 / 600.0 * 1.5;

    //var mx = coords.x / 512.0 * (800.0 * 1.5);
    //var my = coords.y / 512.0 * (600.0 * 1.5);

    //var mx = coords.x / 800.0 * (512.0 * 1.5);
    //var my = coords.y / 600.0 * (512.0 * 1.5);

    //console.log('MOVE Mx: %d My: %d', mx, my);

    callback('move', mx, my);
  }

  canvas.ontouchmove = onMove;
  canvas.onmousemove = onMove;

  canvas.ontouchstart = onDown;
  canvas.onmousedown = onDown;
  canvas.ontouchend = onUp;
  canvas.onmouseup = onUp;
}

function isHit(shape, x, y) {
  if (shape.constructor.name === 'Arc') {
    var dx = shape.x - x;
    var dy = shape.y - y;
    if (dx * dx + dy * dy < shape.radius * shape.radius) {
      return true
    }
  } else {
    if (x > shape.x - shape.width * 0.5 && y > shape.y - shape.height * 0.5 && x < shape.x + shape.width - shape.width * 0.5 && y < shape.y + shape.height - shape.height * 0.5) {
      return true;
    }
  }

  return false;
}

function renderMain() {

  console.log('renderMain()');

  var canvas = document.querySelector('canvas');

// window.onresize = function() {
//   var dimension = [document.documentElement.clientWidth, document.documentElement.clientHeight];
//   canvas.width = dimension[0];
//   canvas.height = dimension[1];
// }

  console.log('renderMain() canvas=', canvas);

  // var dimension = [document.documentElement.clientWidth, document.documentElement.clientHeight];
  // canvas.width = dimension[0];
  // canvas.height = dimension[1];

  var ctx = canvas.getContext('2d');
  //ctx.scale(1.0, 1.0);
  //ctx.scale(1.5, 1.5);
  //ctx.scale(2.0, 2.0);
  ctx.scale(.2, .2);

  var startX = 0;
  var startY = 0;

  var rectangle = new Rectangle(50, 50, 100, 100);
  rectangle.render(ctx);

  var circle = new Arc(200, 140, 50, Math.PI * 2);
  circle.render(ctx);

  var mtt = new MouseTouchTracker(canvas,
    function(evtType, x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch(evtType) {

      case 'down':
        startX = x;
        startY = y;
        if (isHit(rectangle, x, y)) {
          rectangle.isDragging = true;
        }
        if (isHit(circle, x, y)) {
          circle.isDragging = true;
        }
        break;

      case 'up':
        rectangle.isDragging = false;
        circle.isDragging = false;
        break;

      case 'move':
        var dx = x - startX;
        var dy = y - startY;
        startX = x;
        startY = y;

        if (rectangle.isDragging) {
          rectangle.x += dx;
          rectangle.y += dy;
        }

        if (circle.isDragging) {
          circle.x += dx;
          circle.y += dy;
        }
        break;
    }

    circle.render(ctx);
    rectangle.render(ctx);
  },
  .2
);
}

//renderMain();