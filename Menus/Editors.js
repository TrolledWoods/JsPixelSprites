class Editor {
    constructor(editing){
        this.editing = editing;
        this.actions = {};
    }
}

class SpriteEditor extends Editor {
    constructor(editing){
        super(editing);

        this.brushes = [
            {
                color: 0,
                width: 1,
                height: 1
            },
            {
                color: -1,
                width: 1,
                height: 1
            }
        ];

        // Add all the actions to the actions container
        this.actions.PaintBrushless = {
            params: {
                x: 0, 
                y: 0,
                color: -1
            },
            action: args => {
                this.editing.tilemap.SetTile({ x: args.x, y: args.y, tile: args.color })
            }
        };
        this.actions.Paint = {
            params: {
                x: 0, 
                y: 0,
                brush: 0
            },
            action: args => {
                this.editing.tilemap.SetTile({ x: args.x, y: args.y, tile: this.brushes[args.brush].color })
            }
        };
    }

    
}