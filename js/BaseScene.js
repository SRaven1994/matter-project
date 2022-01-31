class BaseScene extends Phaser.Scene {
  /** @type {string} */
  tileDataKey
  /** @type {string} */
  tileDataSource
  player
  constructor(id) {
    super(id)
    /** @type {string} */
    this.id = id
    /** @type {object} */
    this.emojiSpawnPoint = {}
  }
  preload() {
    this.load.tilemapTiledJSON(this.tileDataKey, this.tileDataSource)
    this.load.image('kenney-tileset', 'assets/tiles/kenney-tileset-64px-extruded.png')
    this.load.spritesheet(
      'player',
      'assets/sprites/0x72-industrial-player-32px-extruded.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2
    }
    )
    this.load.spritesheet("emoji", "assets/sprites/emoji.png", {
      frameWidth: 74,
      frameHeight: 74
    })
  }
  create() {
    const map = this.make.tilemap({key: this.tileDataKey})
    const tileset = map.addTilesetImage("kenney-tileset")
    map.createLayer("background", tileset, 0, 0)
    const platformLayer = map.createLayer("platforms", tileset, 0, 0)
    map.createLayer("foreground", tileset, 0, 0)
    platformLayer.setCollisionByProperty({collides: true})
    this.matter.world.convertTilemapLayer(platformLayer)
    const objectLayer = map.getObjectLayer("objectLayer")
    objectLayer.objects.forEach(function(object){
      // Get correctly formatted objects
      let obj = Utils.RetrieveCustomProperties(object)
      if(obj.type === "playerSpawn"){
        // Prevent bugs of double players
        if(this.player != null){
          // @ts-ignore
          this.player.sprite.destroy()
        }
        this.player = new Player(this, obj.x, obj.y)
      }
    }, this)
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.cameras.main.startFollow(this.player.sprite, false, 0,5, 0,5)
    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
  }
  update(time, delta) {
    this.player.update()
  }
  makeEmoji() {
  }
  changeScene() {
  }
}
