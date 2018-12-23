"use strict";

let mouse_x = 0;
let mouse_y = 0;
let stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop, htmlTop, htmlLeft;

let screen;
let menu;

window.onload = () => {
    screen = Screen.FromID('editor');

    // Mouse stuff
    (function(){
        stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(screen.canvas, null)['paddingLeft'], 10)      || 0;
        stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(screen.canvas, null)['paddingTop'], 10)       || 0;
        styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(screen.canvas, null)['borderLeftWidth'], 10)  || 0;
        styleBorderTop   = parseInt(document.defaultView.getComputedStyle(screen.canvas, null)['borderTopWidth'], 10)   || 0;
        // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
        // They will mess up mouse coordinates and this fixes that
        var html = document.body.parentNode;
        htmlTop = html.offsetTop;
        htmlLeft = html.offsetLeft;
    })();

    frame();
}

function frame() {
    window.requestAnimationFrame(frame);
    screen.Clear({ color: "black" });
}

// Eventhandling
window.addEventListener('keydown', e => {
    e.preventDefault();
    
});
window.addEventListener('mousemove', e => {
    if(screen === undefined) return;

    let element = screen.canvas, offsetX = 0, offsetY = 0;
  
    // Compute the total offset. It's possible to cache this if you want
    if (element.offsetParent !== undefined) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }
  
    // Add padding and border style widths to offset
    // Also add the <html> offsets in case there's a position:fixed bar (like the stumbleupon bar)
    // This part is not strictly necessary, it depends on your styling
    offsetX += stylePaddingLeft + styleBorderLeft + htmlLeft;
    offsetY += stylePaddingTop + styleBorderTop + htmlTop;
  
    mouse_x = e.pageX - offsetX;
    mouse_y = e.pageY - offsetY;

    
});
window.addEventListener('mousedown', e => {
    e.preventDefault();
    
});
window.addEventListener('mouseup', e => {
    e.preventDefault();
    
});