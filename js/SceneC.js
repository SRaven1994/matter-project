class SceneC extends BaseScene {
        /** @type {string} */
        static sceneID = "sceneC"
        constructor(){
            super(SceneC.sceneID)
            this.tileDataKey = "slopes3"
            this.tileDataSource = "assets/tilemaps/slopes3.json"
        }
}
