let canvas = document.getElementById("canvas")
let ctx = canvas.getContext('2d')

//let cameraOffset = { x: window.innerWidth/2.0, y: window.innerHeight/2.0 }

let cameraOffset = { x: 0.0, y:0.0 };
let cameraZoom = .5;
//let cameraZoom = 1.0;
//let cameraZoom = 2.0;
let MAX_ZOOM = 5.0;
let MIN_ZOOM = 0.1;
let SCROLL_SENSITIVITY = 0.0005;
let global_zoom = 1.0;

function draw()
{
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
    ctx.scale(cameraZoom, cameraZoom)
    ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    ctx.fillStyle = "#991111"

    // HTML 5 canvas has inverted y koordinates (positive y values go to the bottom, origin is top-left of the screen initially befor translate)
    drawRect(-50, -50, 100, 100)

    drawRect(-50-150, -50, 100, 100)
    drawRect(-50+150, -50, 100, 100)
    drawRect(-50, -50-150, 100, 100)
    drawRect(-50, -50+150, 100, 100)

    // ctx.fillStyle = "#eecc77"
    // drawRect(-35,-35,20,20)
    // drawRect(15,-35,20,20)
    // drawRect(-35,15,70,20)

    ctx.fillStyle = "#fff"
    drawText("Simple Pan and Zoom Canvas", -255, -100, 32, "courier")

    ctx.rotate(-31*Math.PI / 180)
    ctx.fillStyle = `#${(Math.round(Date.now()/40)%4096).toString(16)}`
    drawText("Now with touch!", -110, 100, 32, "courier")

    ctx.fillStyle = "#fff"
    ctx.rotate(31*Math.PI / 180)

    drawText("Wow, you found me!", -260, -2000, 48, "courier")

    requestAnimationFrame( draw )
}

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e)
{
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }
    }
}

function drawRect(x, y, width, height)
{
    ctx.fillRect( x, y, width, height )
}

function drawText(text, x, y, size, font)
{
    ctx.font = `${size}px ${font}`
    ctx.fillText(text, x, y)
}

let isDragging = false
let dragStart = { x: 0, y: 0 }

// converts mouse click coordinates into the coordinate systems that shapes are defined in.
//
// Reverts camera pan and zoom and translates between window and model coordinate systems.
function viewToAbstract(x, y) {

  // move mouse click from window coordinates to a coordinate that has it's origin
  // in the center of the window
  let dx = (x - window.innerWidth / 2);
  let dy = (y - window.innerHeight / 2);

  // from the center window coordinate system, compensate the zoom by dividing by the zoom factor
  let temp_x = (dx / cameraZoom);
  let temp_y = (dy / cameraZoom);

  // no move the mouse click from the center window coordinate system back into the coordinate
  // system that has it's origin in the top left and has no camera offset
  temp_x += window.innerWidth / 2 - cameraOffset.x;
  temp_y += window.innerHeight / 2 - cameraOffset.y;

  return {x: temp_x, y: temp_y};
}

function onPointerDown(e)
{
  console.log("cameraZoom: %f, cameraOffset.x: %f, cameraOffset.y: %f", cameraZoom, cameraOffset.x, cameraOffset.y);

  var x = getEventLocation(e).x;
  var y = getEventLocation(e).y;
  console.log(">> x: %d, y: %d", x, y);

  //console.log("<< x: %d, y: %d", transformed_x, transformed_y);

  //console.log("<< x: %d, y: %d", (x / cameraZoom + cameraOffset.x),  (y / cameraZoom + cameraOffset.y) );

  //var temp_x = (x - cameraOffset.x);
  //var temp_y = (y - cameraOffset.y);

  //var temp_x = (x - cameraOffset.x * cameraZoom);
  //var temp_y = (y - cameraOffset.y * cameraZoom);


  //var temp_x = (x - cameraOffset.x) * cameraZoom;
  //var temp_y = (y - cameraOffset.y) * cameraZoom;

  //var temp_x = (x - cameraOffset.x) * 1 / cameraZoom;
  //var temp_y = (y - cameraOffset.y) * 1 / cameraZoom;

  //var temp_x = (x - cameraOffset.x) * (1.0 - cameraZoom);
  //var temp_y = (y - cameraOffset.y) * (1.0 - cameraZoom);

  //var temp_x = (x * cameraZoom - cameraOffset.x);
  //var temp_y = (y * cameraZoom - cameraOffset.y);

  //var temp_x = (x * 1.0 / cameraZoom - cameraOffset.x);
  //var temp_y = (y * 1.0 / cameraZoom - cameraOffset.y);

  //var temp_x = (x - cameraOffset.x / cameraZoom);
  //var temp_y = (y - cameraOffset.y / cameraZoom);

  //var dx = (x - cameraOffset.x);
  //var dy = (y - cameraOffset.y);

  //var temp_x = dx;
  //var temp_y = dy;

  // move mouse click from window coordinates to a coordinate that has it's origin
  // in the center of the window
  let dx = (x - window.innerWidth / 2);
  let dy = (y - window.innerHeight / 2);

  // from the center window coordinate system, compensate the zoom by dividing by the zoom factor
  let temp_x = (dx / cameraZoom);
  let temp_y = (dy / cameraZoom);

  // no move the mouse click from the center window coordinate system back into the coordinate
  // system that has it's origin in the top left and has no camera offset
  temp_x += window.innerWidth / 2 - cameraOffset.x;
  temp_y += window.innerHeight / 2 - cameraOffset.y;

  let coords = viewToAbstract(x, y);
  console.dir(coords);

  if (coords.x >= -50.0 && coords.x <= 50.0 && coords.y >= -50.0 && coords.y <= 50.0) {
    console.log('hit');
  }

  // var temp_x = (dx * cameraZoom* cameraZoom);
  // var temp_y = (dy * cameraZoom* cameraZoom);

  //var temp_x = (dx * (cameraZoom* cameraZoom));
  //var temp_y = (dy * (cameraZoom* cameraZoom));

  //var temp_x = (dx * (cameraZoom * cameraZoom));
  //var temp_y = (dy * (cameraZoom * cameraZoom));


  //var temp_x = ((cameraOffset.x - x) / cameraZoom);
  //var temp_y = ((cameraOffset.y - y) / cameraZoom);

  // var temp_x = (x - cameraOffset.x * (1.0 - cameraZoom));
  // var temp_y = (y - cameraOffset.y * (1.0 - cameraZoom));

  console.log("<< dx: %f, dy: %f, x: %f, y: %f", dx, dy, temp_x, temp_y);

  if (temp_x >= -50.0 && temp_x <= 50.0 && temp_y >= -50.0 && temp_y <= 50.0) {
    //console.log('hit');
  }


  isDragging = true;

  var transformed_x = x / cameraZoom - cameraOffset.x;
  var transformed_y = y / cameraZoom - cameraOffset.y;

  dragStart.x = transformed_x;
  dragStart.y = transformed_y;
}

function onPointerUp(e)
{
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
}

function onPointerMove(e)
{
    if (isDragging)
    {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
    }
}

function handleTouch(e, singleTouchHandler)
{
    if ( e.touches.length == 1 )
    {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2)
    {
        isDragging = false
        handlePinch(e)
    }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e)
{
    e.preventDefault()

    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2

    if (initialPinchDistance == null)
    {
        initialPinchDistance = currentDistance
    }
    else
    {
        adjustZoom( null, currentDistance/initialPinchDistance )
    }
}

function decimals(n, d) {
  if ((typeof n !== 'number') || (typeof d !== 'number'))
    return false;
       n = parseFloat(n) || 0;
   return n.toFixed(d);
   }

function adjustZoom(zoomAmount, zoomFactor)
{


    if (!isDragging)
    {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
            global_zoom += zoomAmount
        }
        else if (zoomFactor)
        {
            //console.log(zoomFactor)
            cameraZoom = zoomFactor*lastZoom
        }

        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )

        //console.log(zoomAmount)
    }

    console.log(cameraZoom);
    console.log("d %d", cameraZoom);
    console.log("f %f", cameraZoom);
    //console.log("zoomAmount: %d zoomFactor: %d, cameraZoom: %d, global_zoom: %d", zoomAmount, zoomFactor, decimals(cameraZoom, 6), global_zoom);
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY * SCROLL_SENSITIVITY))

// Ready, set, go
draw()