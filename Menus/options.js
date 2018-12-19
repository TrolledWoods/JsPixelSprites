class MenuStack {
    constructor(current){
        this.menu_stack = [];
        this.current_menu = current;

        if(current !== null)
            current.active = true;

        this.menu_width = 300;
        this.menu_offset = 5;
    }

    static CreateObjectExplorer(obj){
        let menu_stack = new MenuStack(null);
        menu_stack.current_menu = ExplorerStackMenu.FromObj(obj, 50, menu_stack);
        menu_stack.current_menu.active = true;
        return menu_stack;
    }

    PushMenu(menu){
        this.menu_stack.push(this.current_menu);
        this.current_menu = menu;
        this.menu_stack[this.menu_stack.length - 1].active = false;
        menu.active = true;
    }

    PopMenu(){
        if(this.menu_stack.length > 0){
            this.current_menu.active = false;
            this.current_menu = this.menu_stack.pop();
            this.current_menu.active = true;
        }
    }

    Update() {
        for(let menu of this.menu_stack)
            menu.Update();

        this.current_menu.Update();
    }

    Render(screen){
        let x = screen.width / 2;
        let y = screen.height / 2;
        let width = this.menu_width;
    
        this.current_menu.Render(screen, x, screen.height / 2, width);

        if(this.menu_stack.length > 0)
            screen.DrawText(GetIconParams(x - width * 0.6, y, "A"));
        
        for(let i = this.menu_stack.length - 1; i >= 0; i--){
            x -= width * 0.75 + this.menu_offset;
            width *= 0.5;

            let menu = this.menu_stack[i];

            menu.Render(screen, x, y, width);
        }
    }

    KeyDown(key){
        switch(key){
            case 'a':
                this.PopMenu();
                break;
            default:
                this.current_menu.KeyDown(key);
                break;
        }
    }
}

class ExplorerStackMenu {
    constructor(menus, element_height, parent){
        this.menus = menus;
        this.current = 0;
        this.rendering_current = 0;
        this.parent = parent;
        this.explorer_parent = null;

        this.element_height = element_height;
        this.element_offset = 5;
    }
    static FromObj(obj, element_height, parent) {
        let explorer = new ExplorerStackMenu([], element_height, parent)

        console.log(obj);

        for(let element in obj){
            let menu;

            switch(typeof obj[element]){
                case "object":
                    menu = ExplorerStackMenu.FromObj(obj[element], element_height, parent);
                    menu.explorer_parent = explorer;
                    menu.name = element;
                    break;
                case "number":
                    menu = new NumberStackMenu(obj[element], val => { obj[element] = val; });
                    menu.name = element;
                    break;
                case "function":
                    menu = new Button(obj[element]);
                    menu.parent = parent;
                    menu.name = element;
                    break;
            }

            explorer.menus.push(menu);
        }

        return explorer;
    }

    GetRenderCurrent(){
        let current = this.rendering_current - this.current;
        if(this.explorer_parent != null)
            current += this.explorer_parent.GetRenderCurrent();
        
        return current;
    }

    Update(render_current_offset = 0) {
        this.rendering_current = (this.current - this.rendering_current) * 0.1 + this.rendering_current;

        if(this.active){
            for(let menu of this.menus)
                menu.Update(this.rendering_current);
        }
    }

    Render(screen, x, y, width){
        let rx = x - width / 2;
        let rendering_current = this.rendering_current + 
                (this.explorer_parent === null ? 0 : this.explorer_parent.GetRenderCurrent());
        let starty = y - (this.element_height + this.element_offset) * rendering_current - 
                this.element_height / 2;
        let ry = starty;
        for(let i = 0; i < this.menus.length; i++){
            screen.DrawRect({
                x: rx, y: ry,
                width: width, height: this.element_height,
                color: this.active ? (i === this.current ? "white" : "grey") : "#a0a0a040" 
            })

            if(this.active)
                screen.DrawText({
                    x: rx, y: ry + this.element_height / 1.5,
                    text: this.menus[i].name,
                    color: "black",
                    align: "left",
                    font: (this.element_height / 2) + "px Arial"
                })

            ry += this.element_height + this.element_offset;
        }

        if(this.active){
            this.menus[this.current].Render(screen, x + width + this.parent.menu_offset, y, width);
        
            if(this.current > 0)
                screen.DrawText(GetIconParams(x, starty - this.element_height, "W"));
            if(this.current < this.menus.length - 1)
                screen.DrawText(GetIconParams(x, starty + this.element_height * (this.menus.length + 1), "S"));
            screen.DrawText(GetIconParams(x + width * 0.6, y, "D"));
        }
    }

    KeyDown(key){
        switch(key){
            case "w":
                if(this.current > 0)
                    this.current--;
                break;
            case "s":
                if(this.current < this.menus.length - 1)
                    this.current++;
                break;
            case "d":
                this.parent.PushMenu(this.menus[this.current]);
                break;
        }
    }
}

class Button {
    constructor(on_click) {
        this.on_click = on_click;
    }

    Update() {
        if(this.active){
            this.on_click();
            this.parent.PopMenu();
        }
    }

    Render(screen, x, y, width){
        screen.DrawRect({ x: x, y: y, width: 50, height: 50, color: "grey" });
        screen.DrawRect({ x: x + 5, y: y + 20, width: 40, height: 10, color: "white" });
        screen.DrawRect({ x: x + 35, y: y + 15, width: 5, height: 20, color: "white" });
        screen.DrawRect({ x: x + 30, y: y + 10, width: 5, height: 30, color: "white" });
    }

    KeyDown(key){

    }
}

class NumberStackMenu {
    constructor(number, on_change){
        this.number = number;
        this.on_change = on_change;
    }

    Update() {
        this.rendering_current = (this.current - this.rendering_current) * 0.1 + this.rendering_current;
    }

    Render(screen, x, y, width){
        screen.DrawText({
            x: x, y: y + width / 4,
            text: this.number.toString(),
            font: (width * ( this.active ? 0.8 : 0.5)) + "px Arial",
            color: this.active ? "white" : "#a0a0a050",
            align: "center"
        });

        if(this.active){
            screen.DrawText({
                x: x, y: screen.height * 0.8,
                text: this.name,
                font: "30px Arial",
                color: "white",
                align: "center"
            });

            screen.DrawText(GetIconParams(x, y - width / 2, "W"));
            screen.DrawText(GetIconParams(x, y + width / 2.5, "S"));
        }
    }

    KeyDown(key){
        switch(key){
            case "w": this.number += 2; // Because it falls through and gets subtracted again
            case "s": this.number--;
                this.on_change(this.number);
                break;
        }
    }
}