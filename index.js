"use strict";

let settings = {
    icons: {
        fontsize: 20
    }
};

function GetIconParams(x, y, text){
    return {
        x: x, y: y + 10,
        color: "white",
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

    menus.main = MenuStack.CreateObjectExplorer({ 
        "Start": () => menu.PushMenu(),
        "Settings": settings
    });
    

    menu = new MenuManager(screen, menus.main);

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