const ALLOWED_SEARCH_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .[]{}*1234567890";

class ActionManager {
    constructor(parentObj){
        let actionmanager = this;

        this.actions = ActionManager.GetActionsFromParentObj(parentObj);

        this.actions.Keybindings = {
            action: _ => {
                let keybinds = {};
                for(let keybind in actionmanager.keybinds){
                    keybinds[ actionmanager.keybinds[keybind].key + " - " + actionmanager.keybinds[keybind].action ] = {
                        Unbind: () => {
                            actionmanager.keybinds.splice(keybind, 1);
                            menu.PopMenu();
                        }
                    }
                }
                keybinds.Cancel = _ => { menu.PopMenu(); }
                menu.PushMenu(MenuStack.CreateObjectExplorer(keybinds, { background: "white", text: "black" }, 0.7), GetPopupSection(screen));
            }
        };

        this.history = [];

        this.keybinds = [];
    }

    static NCharsInString(string, checking){
        let amount = 0;
        for(let char of string){
            if(char === checking){
                amount++;
            }
        }
        return amount;
    }

    static GetActionsFromParentObj(obj, path = "", times = 0){
        if(times > 5) return {};

        let actions = {};
        for(let element in obj){
            if(element === "actions"){
                actions = Object.assign(actions, ActionManager.GetActionsFromObj(obj[element], path, times + 1));
            }else if(typeof obj[element] === "object"){
                actions = Object.assign(actions, ActionManager.GetActionsFromParentObj(obj[element], path + element + ".", times + 1));
            }
        }
        return actions;
    }

    static GetActionsFromObj(obj, path = "", times = 0){
        if(times > 5) return {};

        let actions = {};
        for(let element in obj){
            actions[path + element] = obj[element];
        }
        return actions;
    }
    
    AddActionList(src, obj){
        this.actions = Object.assign(this.actions, ActionManager.GetActionsFromObj(obj, src + "."));
    }

    RemoveActionList(src){
        for(let action in this.actions){
            if(action.substr(0, src.length) === src){
                delete this.actions[action];
            }
        }
    }

    ApplyKeybinds(key, ctrl = false, shift = false, alt = false, filter = _ => true){
        for(let keybind in this.keybinds){
            if(!this.keybinds[keybind] || !filter(this.keybinds[keybind])) continue;
            if(this.keybinds[keybind].key === key && (!this.keybinds[keybind].ctrl === !ctrl) && 
                (!this.keybinds[keybind].shift === !shift) && (!this.keybinds[keybind].alt === !alt)){
                this.PerformAction(this.keybinds[keybind].action, 
                    "get_params" in this.keybinds[keybind] ? this.keybinds[keybind].get_params() : {});
            }
        }
    }

    PerformAction(action_name, params = {}){
        if(action_name in this.actions){
            this.actions[action_name].action(params);

            let index = IndexOf(this.history, action_name);
            if(index >= 0)
                this.history.splice(index, 1);
            this.history.push(action_name);
        }
    }

    GetResults(search_string){
        let candidates = [];
        let regex;
        try{
            regex = new RegExp(search_string, "gi");
        }catch{
            return [];
        }

        for(let action in this.actions){
            if(action.match(regex) !== null){
                candidates.push(action);
            }
        }

        return candidates;
    }
}

class ActionCenter {
    constructor(manager) {
        this.action_manager = manager;

        let action_center = this;
        this.action_manager.AddActionList("actioncenter", {
            MoveCursor: {
                params: { dir: 0 },
                action: args => {
                    if(action_center.selected.length === 0){
                        if(args.dir < 0){
                            action_center.selected = action_center.results[action_center.results.length - 1];
                        }else{
                            action_center.selected = action_center.results[0];
                        }
                    }else{
                        let index = IndexOf(action_center.results, action_center.selected);

                        this.selected = (index + args.dir) < 0 ? "" : 
                                        (index + args.dir) >= action_center.results.length ? "" :
                                        action_center.results[(index + args.dir)];
                    }
                }
            }
        });

        this.action_manager.keybinds.push({ key: 'ArrowDown', action: "actioncenter.MoveCursor", get_params: _=>{return{ dir: 1 }} });
        this.action_manager.keybinds.push({ key: 'ArrowUp', action: "actioncenter.MoveCursor", get_params: _=>{return{ dir: -1 }} });

        this.input = "";
        this.results = this.action_manager.history;
        this.selected = "";

        this.font_size = 25;
    }

    Render(screen){
        screen.DrawRect({ 
            x: screen.width / 4,
            y: screen.height / 4,
            width: screen.width / 2,
            height: screen.height / 2,
            color: "white"
        });

        let x = screen.width / 2;
        let y = screen.height / 3;

        screen.DrawLine({ x1: x - 50, x2: x + 50, y1: y, y2: y, color: "grey" });
        screen.DrawText({
            x: x,
            y: y,
            color: "black",
            align: "center",
            font: this.font_size + "px Arial",
            text: this.input
        });

        y += this.font_size * 2;

        this.DrawResults(x, y);
    }

    DrawResults(x, y){
        for(let i = 0; i < this.results.length; i++){
            let results = this.results[i].split(".");
            screen.DrawText({
                x: x,
                y: y,
                color: this.results[i] === this.selected ? "cyan" : "black",
                align: "center",
                text: results[results.length - 1],
                font: this.font_size + "px Arial"
            });

            screen.DrawText({
                x: this.screen.width / 4,
                y: y - this.font_size * 0.5,
                color: this.results[i] === this.selected ? "cyan" : "black",
                align: "left",
                text: " " + results.slice(0, results.length - 1).join("."),
                font: (this.font_size / 2) + "px Andalé Mono"
            });

            y += this.font_size * 1.5;
        }
    }

    KeyDown(key){
        let old_input = this.input;

        if(!key.alt && ALLOWED_SEARCH_CHARS.includes(key.key)){
            this.input += key.key;
        }else{
            this.action_manager.ApplyKeybinds(key.key, key.ctrl, key.shift, key.alt, bind => {
                return bind.action.split(".")[0] === "actioncenter"; 
            });

            switch(key.key){
                case "Backspace":
                    this.input = this.input.substring(0, this.input.length - 1);
                    break;
                case "Escape":
                    menu.PopMenu();
                    break;
                case "Enter":
                    if(this.results.length > 0){
                        let selected = this.selected.length === 0 ? this.results[0] : this.selected;
                        let action_manager = this.action_manager;
                        let args = "params" in  this.action_manager.actions[selected] ? 
                                    Object.assign({},  this.action_manager.actions[selected].params) : {};

                        let obj = {};
                        if("params" in this.action_manager.actions[selected])
                            obj.Paramaters = args;
                            obj.Run = _ => {
                                menu.PopMenu();
                                action_manager.PerformAction(selected, args);
                            };
                        obj.Cancel = () => { 
                            menu.PopMenu(); 
                        }

                        menu.PushMenu(MenuStack.CreateObjectExplorer(obj, 
                            { background: "white", text: "black" }), GetPopupSection(this.screen) );
                    }
                    break;
            }
        }

        if(old_input !== this.input){
            this.results = this.action_manager.GetResults(this.input);
            if(this.input.length === 0 || this.results.length === 0){
                this.results = [];
                for(let i = this.action_manager.history.length - 1; i >= 0; i--){
                    this.results.push(this.action_manager.history[i]);
                }
            }
        }
    }
}

function IndexOf(array, element){
    for(let i = 0; i < array.length; i++){
        if(array[i] === element){
            return i;
        }
    }

    return -1;
}

function GetPopupSection(screen){
    return screen.GetSection({ x: screen.width / 4, y: screen.height / 4, width: screen.width / 2, height: screen.height / 2 });
}