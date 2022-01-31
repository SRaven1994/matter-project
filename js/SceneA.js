class SceneA extends BaseScene{
    /** @type {string} */
    static sceneID = "sceneA"
    constructor(){
        super(SceneA.sceneID)
        this.tileDataKey = "slopes"
        this.tileDataSource = "assets/tilemaps/slopes.json"
    }
}
