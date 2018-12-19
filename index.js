"use strict";

let settings = {
    icons: {
        fontsize: 20
    }
};

function GetIconParams(x, y, text){
    return {
        x: x, y: y + settings.icons.fontsize / 2,
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

    if(typeof Storage !== undefined){
        if("settings" in localStorage){
            settings = Object.assign(settings, JSON.parse(localStorage.settings));
        }
    }

    let main_menu_tree = { 
        "Start": () => menu.PushMenu(),
        "Settings": settings
    };
    if(typeof Storage !== undefined){
        main_menu_tree["Save settings"] = () => {
            localStorage.settings = JSON.stringify(settings);
        }
    }
    menus.main = MenuStack.CreateObjectExplorer(main_menu_tree);


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