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

    PopMenu(menu){
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
        let x = screen.width / 2 - (this.menu_width + this.menu_offset) * (this.menu_stack.length);

        for(let menu of this.menu_stack){
            menu.Render(screen, x, screen.height / 2, this.menu_width);
            x += this.menu_width + this.menu_offset;
        }

        this.current_menu.Render(screen, x, screen.height / 2, this.menu_width);
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

        this.element_height = element_height;
        this.element_offset = 5;
    }
    static FromObj(obj, element_height, parent) {
        let menus = [];

        console.log(obj);

        for(let element in obj){
            switch(typeof obj[element]){
                case "object":
                    menus.push(ExplorerStackMenu.FromObj(obj[element], element_height, parent));
                    break;
                case "number":
                    menus.push(new NumberStackMenu(obj[element]));
                    break;
            }
        }

        return new ExplorerStackMenu(menus, element_height, parent);
    }

    Update() {
        this.rendering_current = (this.current - this.rendering_current) * 0.1 + this.rendering_current;

        if(this.active)
            this.menus[this.current].Update();
    }

    Render(screen, x, y, width){
        let rx = x - width / 2;
        let starty = y - (this.element_height + this.element_offset) * this.rendering_current - 
                this.element_height / 2;
        let ry = starty;
        for(let i = 0; i < this.menus.length; i++){
            screen.DrawRect({
                x: rx, y: ry,
                width: width, height: this.element_height,
                color: this.active ? (i === this.current ? "white" : "grey") : "#a0a0a040" 
            })

            ry += this.element_height + this.element_offset;
        }

        if(this.active){
            this.menus[this.current].Render(screen, x + width + this.parent.menu_offset, y, width);
        
            screen.DrawText({
                x: x, y: starty - this.element_height,
                text: "S",
                font: (width * 0.1) + "px Arial",
                color: this.active ? "white" : "#a0a0a050",
                align: "center"
            });
            screen.DrawText({
                x: x, y: starty + this.element_height * (this.menus.length + 1.5),
                text: "W",
                font: (width * 0.1) + "px Arial",
                color: this.active ? "white" : "#a0a0a050",
                align: "center"
            });
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

class NumberStackMenu {
    constructor(number){
        this.number = number;
    }

    Update() {
        this.rendering_current = (this.current - this.rendering_current) * 0.1 + this.rendering_current;
    }

    Render(screen, x, y, width){
        screen.DrawText({
            x: x, y: y + width / 4,
            text: this.number.toString(),
            font: (width * 0.8) + "px Arial",
            color: this.active ? "white" : "#a0a0a050",
            align: "center"
        });

        if(this.active){
            screen.DrawText({
                x: x, y: y - width / 2,
                text: "S",
                font: (width * 0.1) + "px Arial",
                color: this.active ? "white" : "#a0a0a050",
                align: "center"
            });
            screen.DrawText({
                x: x, y: y + width / 2,
                text: "W",
                font: (width * 0.1) + "px Arial",
                color: this.active ? "white" : "#a0a0a050",
                align: "center"
            });
        }
    }

    KeyDown(key){
        switch(key){
            case "w":
                this.number++;
                break;
            case "s":
                this.number--;
                break;
        }
    }
}