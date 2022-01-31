class SceneB extends BaseScene {
        /** @type {string} */
        static sceneID = "sceneB"
        constructor(){
            super(SceneB.sceneID)
            this.tileDataKey = "slopes2"
            this.tileDataSource = "assets/tilemaps/slopes2.json"
        }
}
