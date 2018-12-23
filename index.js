"use strict";

let settings = {
    icons: {
        fontsize: 20,
        transparency: -1
    },
    editor: {
        panel_width: 0.1,
        panel_bars: 2
    },
    sprite_creation: {
        width: 16,
        height: 16
    },
    keybindings: [
        { key: 'a', action: "something else" }
    ]
};

let mouse_x = 0;
let mouse_y = 0;
let stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop, htmlTop, htmlLeft;


function GetIconParams(x, y, text){
    return {
        x: x, y: y + settings.icons.fontsize / 2,
        color: settings.icons.transparency < 0 ? "#ffffff" : 
                settings.icons.transparency === 0 ? "#ffffff00" : "#ffffff" + (settings.icons.transparency * 10 + 9),
        text: text,
        font: settings.icons.fontsize + "px Arial",
        align: "center",
    };
}

let screen;
let menu;
let menus = {};

window.onload = () => {
    screen = Screen.FromID('editor');

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

    if(typeof Storage !== undefined){
        if("settings" in localStorage){
            settings = Object.assign(settings, JSON.parse(localStorage.settings));
        }
    }

    let main_menu_tree = { 
        "Start": {
            "New sprite": {
                "Properties": settings.sprite_creation,
                "Create!": () => menu.PushMenu(new EditorMenu(screen, new SpriteEditor(Sprite.CreateTransparent()))),
            },
            "Load sprite": () => { alert("COMING SOON!!"); },
        },
        "Settings": settings,
        "Three numbers": [6, 6, 6]
    };
    if(typeof Storage !== undefined){
        main_menu_tree["Save settings"] = () => {
            localStorage.settings = JSON.stringify(settings);
            alert("Saved settings!");
        }
    }
    menus.main = MenuStack.CreateObjectExplorer(main_menu_tree);


    menu = new MenuManager(screen, menus.main);

    frame();
}

function frame() {
    window.requestAnimationFrame(frame);
    menu.Update();
    menu.Render();
}

window.addEventListener('keydown', e => {
    e.preventDefault();
    menu.KeyDown(e);
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

    menu.MouseMove(mouse_x, mouse_y);
});

window.addEventListener('mousedown', e => {
    e.preventDefault();
    menu.MouseDown(e);
});

window.addEventListener('mouseup', e => {
    e.preventDefault();
    menu.MouseUp(e);
});