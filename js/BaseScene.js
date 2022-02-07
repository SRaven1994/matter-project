class BaseScene extends Phaser.Scene {
  /** @type {string} */
  tileDataKey
  /** @type {string} */
  tileDataSource
  /** @type {Player} */
  player
  /** @type {object} */
  box
  /** @type {number} */
  levelCount = 1
  /** @type {number} */
  emojiMax = 10
  /** @type {number} */
  emojiCount
  /** @type {number} */
  emojiInterval = 3000
  /** @type {number} */
  minutes = 0
  /** @type {number} */
  seconds = 0
  /** @type {number} */
  milSeconds = 0
  /** @type {Phaser.GameObjects.BitmapText} */
  minutesText
  /** @type {Phaser.GameObjects.BitmapText} */
  secondsText
  /** @type {Phaser.GameObjects.BitmapText} */
  milSecondsText
  // @ts-ignore
  matterCollision
  constructor(id) {
    super(id)
    /** @type {string} */
    this.id = id
    /** @type {object} */
    this.emojiSpawnPoint = {}
    /** @type {object} */
    this.boxSpawnPoint
    /** @type {object} */
    this.rect64SpawnPoint
    /** @type {object} */
    this.rect128SpawnPoint
    /** @type {object} */
    this.rect128FlippedSpawnPoint
  }
  preload() {
    this.load.tilemapTiledJSON(this.tileDataKey, this.tileDataSource)
    this.load.image('kenney-tileset', 'assets/tiles/kenney-tileset-64px-extruded.png')
    this.load.bitmapFont("UIFont", "assets/UI/carrier_command.png", "assets/UI/carrier_command.xml")
    this.load.image("resetbutton", "assets/UI/reset-Button.png")
    this.load.image("box", "assets/sprites/box.png")
    this.load.image("rect64", "assets/sprites/rect-64.png")
    this.load.image("rect128", "assets/sprites/rect-128.png")
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
    this.emojiCount = 0
    // Create Map
    const map = this.make.tilemap({key: this.tileDataKey})
    const tileset = map.addTilesetImage("kenney-tileset")
    map.createLayer("background", tileset, 0, 0)
    const platformLayer = map.createLayer("platforms", tileset, 0, 0)
    map.createLayer("foreground", tileset, 0, 0)
    platformLayer.setCollisionByProperty({collides: true})
    this.matter.world.convertTilemapLayer(platformLayer)
    const objectLayer = map.getObjectLayer("objectLayer")
    // UI
    this.minutesText = this.add.bitmapText(2, 24, "UIFont", "00:" ,40).setScrollFactor(0).setFontSize(24).setDepth(1)
    this.secondsText = this.add.bitmapText(90, 24, "UIFont", "00" ,40).setScrollFactor(0).setFontSize(24).setDepth(1)
    this.milSecondsText = this.add.bitmapText(180, 24, "UIFont", "00" ,40).setScrollFactor(0).setFontSize(24).setDepth(1)
    let resetButton = this.add.image(450, 34,"resetbutton", 0).setScrollFactor(0).setDepth(1).setInteractive()
    //Controls
    resetButton.on("pointerdown", this.reset, this)
    let emojiDeathPlane
    let exitPlane
    objectLayer.objects.forEach(function(object){
      // Get correctly formatted objects
      let obj = Utils.RetrieveCustomProperties(object)
      // Player Spawn
      if(obj.type === "playerSpawn"){
        // Prevent bugs of double players
        if(this.player != null){
          // @ts-ignore
          this.player.sprite.destroy()
        }
        this.player = new Player(this, obj.x, obj.y)
      // Emoji Spawns
      }else if(obj.type === "emojiSpawn"){
        // @ts-ignore
        this.emojiSpawnPoint = {x: obj.x, y: obj.y}
      }else if(obj.type === "emojiDeathRect"){
        // @ts-ignore
        emojiDeathPlane = this.matter.add.rectangle(obj.x + obj.width/2, obj.y + obj.height/2, obj.width, obj.height, {isStatic: true, isSensor: true})
      // Exit Box
      }else if(obj.type === "exitRect"){
        // @ts-ignore
        exitPlane = this.matter.add.rectangle(obj.x + obj.width/2, obj.y + obj.height/2, obj.width, obj.height, {isStatic: true, isSensor: true})
      // Object Spawns
      }else if(obj.type === "boxSpawn"){
        this.boxSpawnPoint = {x: obj.x, y: obj.y}
        // @ts-ignore
        this.boxSpawnPoint = this.makeBox()
      }else if(obj.type === "rect128Spawn"){
        this.rect128SpawnPoint = {x: obj.x, y: obj.y}
        // @ts-ignore
        this.rect128SpawnPoint = this.makeRect128()
      }else if(obj.type === "rect128FlippedSpawn"){
        this.rect128FlippedSpawnPoint = {x: obj.x, y: obj.y}
        // @ts-ignore
        this.rect128FlippedSpawnPoint = this.makeRect128Flipped()
      }else if(obj.type === "rect64Spawn"){
        this.rect64SpawnPoint = {x: obj.x, y: obj.y}
        // @ts-ignore
        this.rect64SpawnPoint = this.makeRect64()
      }
    }, this)
    // Spawn Emoji
    this.time.addEvent({
      delay: this.emojiInterval,
      callback: this.makeEmoji,
      callbackScope: this,
      loop: true
    })
    // Despawn Emoji
    this.matterCollision.addOnCollideStart({
      objectA: emojiDeathPlane,
      callback: function(eventData){
        let gameObjectB = eventData.gameObjectB
        if(gameObjectB instanceof Phaser.Physics.Matter.Image && gameObjectB.texture.key === "emoji"){
          gameObjectB.destroy()
          this.emojiCount--
        }
      },
      context: this
    })
    // Change to Next Level
    this.matterCollision.addOnCollideStart({
      objectA: this.player.sprite,
      objectB: exitPlane,
      callback: function(eventData){
        this.changeScene()
      },
      context: this
    })

    // Restart Current Level
    this.matterCollision.addOnCollideStart({
      objectA: this.player.sprite,
      callback: function(eventData){
        let gameObjectB = eventData.gameObjectB
        if(gameObjectB instanceof Phaser.Tilemaps.Tile && gameObjectB.properties.isDeadly){
          {
            this.player.freeze()
            this.cameras.main.fade(250, 0, 0, 0)
            this.cameras.main.once("camerafadeoutcomplete", function(){
              this.scene.restart()
            }, this)
          }
        }
      },
      context:this
    })
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.cameras.main.startFollow(this.player.sprite, false, 0,5, 0,5)
    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
  }
  update(time, delta) {
    this.player.update()
    // Timer 
    this.minutesText.setText(this.minutes + ":")
    this.secondsText.setText(this.seconds + ":")
    this.milSecondsText.setText(this.milSeconds + "")
    if(this.milSeconds == 60){
      this.seconds ++
      this.milSeconds = 0
    }else if(this.seconds == 60){
      this.minutes ++
      this.seconds = 0
      this.milSeconds = 0
    }
    this.milSeconds ++
  }
  reset(pointer){
    this.player.freeze()
    this.cameras.main.fade(250, 0, 0, 0)
    this.cameras.main.once("camerafadeoutcomplete", function(){
      this.scene.restart()
    }, this)
  }
  makeEmoji() {
    if(this.emojiCount >= this.emojiMax){
      return
    }
    const texture = this.textures.get("emoji")
    const frame = Phaser.Math.Between(0, texture.frameTotal - 1)
    let emoji = this.matter.add.image(this.emojiSpawnPoint.x, this.emojiSpawnPoint.y, "emoji", frame, {
      restitution: 1,
      friction: 0.1,
      density: 0.001,
      // @ts-ignore
      shape: "circle"
    }).setScale(0.5)
    this.emojiCount++
  }
  makeBox(){
    const texture = this.textures.get("box")
    let box = this.matter.add.image(this.boxSpawnPoint.x, this.boxSpawnPoint.y, "box", 0, {
      restitution: 1,
      friction: 0,
      density: 0.001,
    }).setScale(2)
  }
  makeRect64(){
    const texture = this.textures.get("rect64")
    let rect64 = this.matter.add.image(this.rect64SpawnPoint.x, this.rect64SpawnPoint.y, "rect64", 0, {
      restitution: 1,
      friction: 0,
      density: 0.001,
    })
    this.matter.add.worldConstraint(rect64, 0, 1, {
      pointA: new Phaser.Math.Vector2(this.rect64SpawnPoint.x, this.rect64SpawnPoint.y),
    })
  }
  makeRect128(){
    const texture = this.textures.get("rect128")
    let rect128 = this.matter.add.image(this.rect128SpawnPoint.x, this.rect128SpawnPoint.y, "rect128", 0, {
      restitution: 0.5,
      friction: 0,
      density: 0.001,
    })
    this.matter.add.worldConstraint(rect128, 0, 1, {
      pointA: new Phaser.Math.Vector2(this.rect128SpawnPoint.x, this.rect128SpawnPoint.y),
    })
  }
  makeRect128Flipped(){
    const texture = this.textures.get("rect128")
    let rect128 = this.matter.add.image(this.rect128FlippedSpawnPoint.x, this.rect128FlippedSpawnPoint.y, "rect128", 0, {
      restitution: 0.5,
      friction: 0,
      density: 0.001,
    }).setRotation(1.56)
    this.matter.add.worldConstraint(rect128, 0, 1, {
      pointA: new Phaser.Math.Vector2(this.rect128FlippedSpawnPoint.x, this.rect128FlippedSpawnPoint.y),
    })
  }
  changeScene() {
    if(this.id == "sceneA"){
      this.scene.start("sceneB")
    }else if(this.id == "sceneB"){
      this.scene.start("sceneC")
    }else if(this.id == "sceneC"){
      this.scene.start("sceneD")
    }else if(this.id == "sceneD"){
      this.scene.start("sceneE")
    }  
  }
}
