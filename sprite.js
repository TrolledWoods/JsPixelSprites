class Sprite {
    constructor(tilemap, palette){
        this.tilemap = tilemap;
        this.palette = palette;
    }

    static CreateTransparent(){
        return new Sprite(Tilemap.Create({
            width: settings.sprite_creation.width,
            height: settings.sprite_creation.height,
            MappingFunc: args => -1
        }), ["#ff00ff"]);
    }
}