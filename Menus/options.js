class OptionMenu {
    constructor(menu_tree, path = []){
        this.tree = menu_tree;
        this.path = path;

        this.element_height = 50;
        this.aspect_ratio = 32.0 / 9.0;
        this.element_offset = 5;

        this.selected_y = 0;
        this.render_selected_y = 0;

        this.target_x = 0;
        this.x = 0;
    }

    static FromObject(obj){
        return new OptionMenu(OptionMenu.ParseObject(obj));
    }

    static ParseObject(obj){
        let parsed = [];
        
        for(let element in obj){
            let type = typeof obj[element];

            parsed.push({
                type: type,
                name: element,
                data: type === "object" ? OptionMenu.ParseObject(obj[element]) : obj[element]
            });
        }

        return parsed;
    }

    Update() {
        this.render_selected_y = (this.selected_y - this.render_selected_y) * 0.1 + this.render_selected_y;
    }

    RenderPath(screen, path, x, y, element_width, element_height, selected_y){
        let elements = this.GetLocalTree(path);
        
        let ex = x - element_width / 2;
        let ey = y - element_height * selected_y - element_height / 2;
        
        for(var element of elements){
            screen.DrawRect({ 
                x: ex, width: element_width,
                y: ey + this.element_offset, 
                height: element_height - this.element_offset * 2,
                color: "grey"
            });

            screen.DrawText({
                x: ex + this.element_height * this.aspect_ratio / 2, 
                y: ey + this.element_height / 1.2,
                text: element.name,
                color: "white",
                font: (this.element_height / 1.2) + "px MS Comic Sans",
                align: "center"
            });

            ey += element_height;
        }
    }

    Render(screen){
        this.target_x = screen.width / 2 - this.path.length * this.element_height * this.aspect_ratio;
        this.x = (this.target_x - this.x) * 0.1 + this.x;
        let x = this.x;

        for(let i = 0; i <= this.path.length; i++){
            this.RenderPath(screen, this.path.slice(0, i), 
                x, screen.height / 2,
                this.element_height * this.aspect_ratio,
                this.element_height,
                i === this.path.length ? this.render_selected_y : this.path[i]);

            x += this.element_height * this.aspect_ratio + this.element_offset;
        }
    }

    KeyDown(key){
        let local = this.GetLocalTree(this.path);
        switch(key){
            case "w":
                this.selected_y--;
                if(this.selected_y < 0) this.selected_y = 0;
                break;
            case "s":
                this.selected_y++;
                if(this.selected_y >= local.length) this.selected_y = local.length - 1;
                break;
            case "d":
                if(local[this.selected_y].type === "object"){
                    this.path.push(this.selected_y);
                    this.selected_y = 0;
                    this.render_selected_y = 0;
                }
                break;
            case "a":
                if(this.path.length > 0){
                    this.selected_y = this.path.pop();
                    this.render_selected_y = this.selected_y;
                }
                break;
        }
    }

    GetLocalTree(path){
        let tree = this.tree;

        for(let branch of path){
            tree = tree[branch].data;
        }

        return tree;
    }
}