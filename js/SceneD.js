class SceneD extends BaseScene {
    /** @type {string} */
    static sceneID = "sceneD"
    constructor(){
        super(SceneD.sceneID)
        this.tileDataKey = "slopes4"
        this.tileDataSource = "assets/tilemaps/slopes4.json"
    }
}
