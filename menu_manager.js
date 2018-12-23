class MenuManager {
    constructor(screen, menu) {
        this.screen = screen;
        this.SetMenu(menu);
    }

    SetMenu(menu, screen = this.screen){
        this.menus = [ menu ];
        this.current = menu;
        this.current.screen = screen;
        this.Start();
    }

    PushMenu(menu, screen = this.screen){
        this.menus.push(this.current);
        this.current = menu;
        this.current.screen = screen;
        this.Start();
    }

    PopMenu(menu){
        if(this.menus.length > 1){
            this.current = this.menus.pop();
            this.Start();
        }
    }

    Start(){
        if("Start" in this.current)
            this.current.Start(this.current.screen);
    }

    Render(){
        if("Render" in this.current)
            this.current.Render(this.current.screen);
    }

    Update(){
        if("Update" in this.current)
            this.current.Update();
    }

    KeyDown(key){
        if("KeyDown" in this.current)
            this.current.KeyDown(key);
    }

    MouseMove(x, y){
        if("MouseMove" in this.current)
            this.current.MouseMove(x, y);
    }

    MouseDown(e){
        if("MouseDown" in this.current)
            this.current.MouseDown(e);
    }
    MouseUp(e){
        if("MouseUp" in this.current)
            this.current.MouseUp(e);
    }
}