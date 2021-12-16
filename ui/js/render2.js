let canvas = document.getElementById("canvas")
let ctx = canvas.getContext('2d')

let cameraOffset = { x: window.innerWidth/2.0, y: window.innerHeight/2.0 }
//let cameraOffset = { x: 0.0, y:0.0 };

//let cameraZoom = .5;
let cameraZoom = 1.0;
//let cameraZoom = 2.0;

let MAX_ZOOM = 5.0;
let MIN_ZOOM = 0.1;
let SCROLL_SENSITIVITY = 0.0005;

let rectangle1 = null;
let rectangle2 = null;

rectangle1 = new Rectangle("rect1", -50, -50, 100, 100);
rectangle2 = new Rectangle("rect2", -50-150, -50, 100, 100);

let circle1 = null;

circle1 = new Circle("circle1", '#00FF00', 0, 0, 10);

let initialPinchDistance = null
let lastZoom = cameraZoom

let isDraggingCanvas = false
let dragStart = { x: 0, y: 0 }

let listOfDraggedObjects = [];

let oldTemp = { x: 0, y: 0 };

function draw()
{
  //console.log('draw');
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
    ctx.scale(cameraZoom, cameraZoom)
    ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    ctx.fillStyle = "#991111"

    // HTML 5 canvas has inverted y koordinates (positive y values go to the bottom, origin is top-left of the screen initially befor translate)
    //drawRect(-50, -50, 100, 100)

    // drawRect(-50-150, -50, 100, 100)
    // drawRect(-50+150, -50, 100, 100)
    // drawRect(-50, -50-150, 100, 100)
    // drawRect(-50, -50+150, 100, 100)

    rectangle1.render(ctx);
    rectangle2.render(ctx);

    circle1.render(ctx);

    // ctx.fillStyle = "#eecc77"
    // drawRect(-35,-35,20,20)
    // drawRect(15,-35,20,20)
    // drawRect(-35,15,70,20)

    ctx.fillStyle = "#fff"
    drawText("Simple Pan and Zoom Canvas", -255, -100, 32, "courier")

    ctx.rotate(-31 * Math.PI / 180)
    ctx.fillStyle = `#${(Math.round(Date.now()/40)%4096).toString(16)}`
    drawText("Now with touch!", -110, 100, 32, "courier")

    ctx.fillStyle = "#fff"
    ctx.rotate(31 * Math.PI / 180)

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

// converts mouse click coordinates from the view coordinate system
// into the coordinate systems that shapes are defined in.
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
  console.log('onPointerDown');

  var x = getEventLocation(e).x;
  var y = getEventLocation(e).y;

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
  if (rectangle1.isHit(coords.x, coords.y)) {
    rectangle1.onHit(coords.x, coords.y);
    listOfDraggedObjects.push(rectangle1);
  } else if (rectangle2.isHit(coords.x, coords.y)) {
    rectangle2.onHit(coords.x, coords.y);
    listOfDraggedObjects.push(rectangle2);
  } else {
    isDraggingCanvas = true;
  }

  var transformed_x = x / cameraZoom - cameraOffset.x;
  var transformed_y = y / cameraZoom - cameraOffset.y;

  dragStart.x = transformed_x;
  dragStart.y = transformed_y;
}

function onPointerUp(e)
{
  // no object is dragged any more
  isDraggingCanvas = false
  listOfDraggedObjects = [];
  oldTemp = null;

  initialPinchDistance = null
  lastZoom = cameraZoom
}

function onPointerMove(e)
{
    let x = getEventLocation(e).x;
    let y = getEventLocation(e).y;

    let temp = viewToAbstract(x, y);

    circle1.x = temp.x;
    circle1.y = temp.y;

    if (isDraggingCanvas)
    {
        cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x
        cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y
    }
    else if (listOfDraggedObjects.length > 0)
    {
      let object = listOfDraggedObjects[0];

      if (oldTemp != null) {

        let dx = (oldTemp.x - temp.x);
        let dy = (oldTemp.y - temp.y);

        object.x -= dx;
        object.y -= dy;
      }

      oldTemp = { x: temp.x, y: temp.y };
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
        isDraggingCanvas = false
        handlePinch(e)
    }
}

function handlePinch(e)
{
    e.preventDefault()

    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }

    // this is distance squared, but no need for an expensive sqrt as it's only used in ratio
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

function adjustZoom(zoomAmount, zoomFactor)
{
    if (!isDraggingCanvas)
    {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor)
        {
            cameraZoom = zoomFactor*lastZoom
        }

        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
    }
}

canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown));

canvas.addEventListener('mouseup', onPointerUp);
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp));

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove));

canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY * SCROLL_SENSITIVITY));

// Ready, set, go
draw();