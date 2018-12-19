class MenuManager {
    constructor(screen, menu) {
        this.screen = screen;
        this.SetMenu(menu);
    }

    SetMenu(menu){
        this.menus = [ menu ];
        this.current = menu;
    }

    PushMenu(menu){
        this.menus.push(menu);
        this.current = menu;
    }

    PopMenu(menu){
        if(this.menus.length > 1)
            this.current = this.menus.pop();
    }

    Render(){
        this.current.Render(this.screen);
    }

    Update(){
        this.current.Update();
    }

    KeyDown(key){
        this.current.KeyDown(key);
    }
}