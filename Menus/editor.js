class EditorMenu {
    constructor(screen, editing){
        this.screen = screen;
        screen.Clear({ color: "black" });

        this.editing = editing;

        this.panel = new Painter(screen, 0, 0, screen.width, screen.height, this);
        this.action_manager = new ActionManager({ 
            editing: this.editing, 
            settings: settings, 
            actions: {
                "actioncenter.Open": { action: args => menu.PushMenu(new ActionCenter(this.action_manager)) },
                "actioncenter.Close": { action: args => menu.PopMenu() }
            } 
        });
        this.panel.AddActions(this.action_manager);

        this.action_manager.keybinds.push({ key: "c", action: "actioncenter.Open" });
    }

    Start() {
        this.panel.ForceRender();
    }

    Update() {
        this.panel.Update();
    }

    Render(){
        this.panel.Render();
    }
    
    KeyDown(key){
        this.action_manager.ApplyKeybinds(key.key, key.ctrl, key.shift, key.alt);
    }

    MouseMove(x, y){
        this.panel.MouseMove(x, y);
    }

    MouseDown(e){
        this.panel.MouseDown(e);
    }
}

class Panel {
    constructor(screen, x, y, width, height, editormenu){
        this.screen = screen;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.parent = editormenu;

        this.changed = true;
    }

    AddActions(action_manager){}
    ForceRender(){}
    UpdateSize(){}
    Update(){}
    Render(){}
    KeyDown(key){}
    MouseMove(x, y){}
    MouseDown(e){}
}

class SubPanel extends Panel {
    constructor(screen, x, y, width, height, editormenu){
        super(screen.GetSection({ x: x, y: y, width: width, height: height }), x, y, width, height, editormenu);
    }

    UpdateSize(){
        this.screen.drawing_offset = { x: this.x, y: this.y };
        this.screen.width = this.width;
        this.screen.height = this.height;

        this.changed = true;
    }
}

class Painter extends SubPanel {
    constructor(screen, x, y, width, height, editormenu){
        super(screen, x, y, width, height, editormenu);

        this.cam = new Camera(this.screen, 0, 0, 40);
        this.mouse_x = 0;
        this.mouse_y = 0;
    }

    ForceRender(){
        this.changed = false;

        this.screen.Clear({ color: "black" });

        let palette = this.parent.editing.editing.palette;
        this.cam.DrawTilemap({
            tilemap: this.parent.editing.editing.tilemap,
            DrawTile: args => {
                if(args.tile !== null){
                    args.screen.DrawRect({ 
                        x: args.x + args.width * 0.05, y: args.y + args.height * 0.05, 
                        width: args.width * 0.9, height: args.height * 0.9, color: 
                        args.tile < 0 ? "grey" : palette[args.tile] });
                }
            }
        });
    }

    Render() {
        if(!this.changed) return;
        this.ForceRender(); 
    }

    MouseMove(x, y){
        this.mouse_x = x;
        this.mouse_y = y;
    }

    MouseDown(e){
        if(e.button === 0){
            let pos = this.parent.editing.editing.tilemap.WorldToTilemap(this.cam.ScreenToWorld({ x: this.mouse_x, y: this.mouse_y }));
            this.parent.action_manager.PerformAction("editing.PaintBrushless", { x: Math.round(pos.x), y: Math.round(pos.y), color: 0 });
            this.changed = true;
        }
        if(e.button === 2){
            let pos = this.parent.editing.editing.tilemap.WorldToTilemap(this.cam.ScreenToWorld({ x: this.mouse_x, y: this.mouse_y }));
            this.parent.action_manager.PerformAction("editing.PaintBrushless", { x: Math.round(pos.x), y: Math.round(pos.y), color: -1 });
            this.changed = true;
        }
    }

    AddActions(action_manager){
        let painter = this;
        action_manager.AddActionList("camera", {
            Move: { 
                params: { x: 0, y: 0 },
                action: args => {
                    painter.cam.pos.x += args.x;
                    painter.cam.pos.y += args.y;
                    painter.changed = true;
                }
            },
            ZoomIn:  { action: _ => {
                    painter.cam.zoom *= 1.1;
                    painter.changed = true; }},
            ZoomOut: { action: _ => {
                    painter.cam.zoom *= 0.9;
                    painter.changed = true; }},
        });

        action_manager.keybinds.push({ key: 'w',          action: "camera.Move", get_params: _ => { return { x: 0 , y:  1 }; }});
        action_manager.keybinds.push({ key: 'a',          action: "camera.Move", get_params: _ => { return { x: -1, y:  0 }; }});
        action_manager.keybinds.push({ key: 's',          action: "camera.Move", get_params: _ => { return { x: 0 , y: -1 }; }});
        action_manager.keybinds.push({ key: 'd',          action: "camera.Move", get_params: _ => { return { x: 1 , y:  0 }; }});
        action_manager.keybinds.push({ key: 'ArrowUp',    action: "camera.Move", get_params: _ => { return { x: 0 , y:  1 }; }});
        action_manager.keybinds.push({ key: 'ArrowLeft',  action: "camera.Move", get_params: _ => { return { x: -1, y:  0 }; }});
        action_manager.keybinds.push({ key: 'ArrowDown',  action: "camera.Move", get_params: _ => { return { x: 0 , y: -1 }; }});
        action_manager.keybinds.push({ key: 'ArrowRight', action: "camera.Move", get_params: _ => { return { x: 1 , y:  0 }; }});
        
        action_manager.keybinds.push({ key: 'z', action: "camera.ZoomIn" });
        action_manager.keybinds.push({ key: 'x', action: "camera.ZoomOut" });
    }
}