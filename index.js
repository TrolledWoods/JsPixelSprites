"use strict";

let screen;
let menu;

window.onload = () => {
    screen = Screen.FromID('editor');
    menu = new MenuManager(screen, MenuStack.CreateObjectExplorer({ 
        "Start": 5, 
        "Settings": {
            "Volume": 5,
            "SoundDampening": 3,
        },
        "Exit": 2, 
    }));

    frame();
}

function frame() {
    window.requestAnimationFrame(frame);
    screen.Clear({ color: "black" });
    menu.Update();
    menu.Render();
}

function keydown(event){
    menu.KeyDown(event.key);
}