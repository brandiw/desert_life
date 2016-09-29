var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game');

var PhaserGame = function () {
    this.player = null;
    this.platforms = null;
    this.background = null;
    this.foreground = null;
    this.basePlatformHeight = 460;
    this.gameOver = false;

    this.facing = 'left';
    this.jumping = false;
    this.cursors = null;
    this.bmpText;
};

    PhaserGame.prototype = {
        init: function () {
            this.game.renderer.renderSession.roundPixels = true;

            this.world.resize(WORLD_WIDTH, WORLD_HEIGHT);

            this.physics.startSystem(Phaser.Physics.ARCADE);

            this.physics.arcade.gravity.y = 1000;
            this.physics.arcade.skipQuadTree = false;
        },

        preload: function () {
            //Load background
            this.load.image('background', 'assets/DesertPack/PNG/bg_desert.png');
            this.load.image('water', 'assets/DesertPack/PNG/desert_pack_51.png');

            //Load platforms
            this.load.image('platform_small_straight', 'assets/DesertPack/PNG/desert_pack_13.png');
            this.load.image('platform_large_straight', 'assets/DesertPack/PNG/desert_pack_05.png');

            //Load scenery
            this.load.image('cactus_tall', 'assets/DesertPack/PNG/desert_pack_59.png');
            this.load.image('cactus_small', 'assets/DesertPack/PNG/desert_pack_66.png');
            this.load.image('cactus_purple', 'assets/DesertPack/PNG/desert_pack_67.png');
            this.load.image('cactus_yellow', 'assets/DesertPack/PNG/desert_pack_56.png');
            this.load.image('weed_green', 'assets/DesertPack/PNG/desert_pack_68.png');
            this.load.image('weed_brown', 'assets/DesertPack/PNG/desert_pack_69.png');
            this.load.image('rock_flower', 'assets/DesertPack/PNG/desert_pack_73.png');
            this.load.image('rock1', 'assets/DesertPack/PNG/desert_pack_70.png');
            this.load.image('rock2', 'assets/DesertPack/PNG/desert_pack_71.png');


            //Load characters
            this.load.spritesheet('squirrel', 'assets/Squirrel_Sheet.png', 32, 32);
            this.load.spritesheet('platform2', 'assets/Platformer2/spritesheet.png', 23.25, 23.25);

            //Load fonts
            game.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');
        },

        create: function () {
            this.background = this.add.sprite(0, 0, 'background');
            this.background.fixedToCamera = true;
            this.background.width = GAME_WIDTH;
            this.background.height = GAME_HEIGHT;

            this.platforms = this.add.physicsGroup();
            this.placeScenery();
            this.createPlatforms();

            this.platforms.setAll('body.allowGravity', false);
            this.platforms.setAll('body.immovable', true);

            this.player = this.add.sprite(150, 100, 'squirrel');
            this.physics.arcade.enable(this.player);
            //this.player.body.collideWorldBounds = false;
            //this.player.checkWorldBounds = true;
            //this.player.events.onOutOfBounds.add(this.fellDown, this);
            this.player.body.setSize(26, 26, 0, -3);
            this.player.scale.setTo(1.5);
            this.facing = "right";

            this.player.animations.add('left', [41, 42, 44], 8, true);
            this.player.animations.add('right', [32, 33, 34, 36], 8, true);
            this.player.animations.add('jumpLeft', [42], 8, true);
            this.player.animations.add('jumpRight', [34], 8, true);

            this.camera.follow(this.player);

            this.cursors = this.input.keyboard.createCursorKeys();
        },
        update: function () {
            this.physics.arcade.collide(this.player, this.platforms, this.collidePlatform, null, this);

            //Detect if you fell down a hole
            if(this.player.body.bottom >= this.world.bounds.bottom){
                this.fellDown();
                return;
            }
            else if(this.player.body.x < 0){
                this.player.body.x = 0;
                this.player.body.velocity.x = 0;
            }
            else if(this.player.body.x + this.player.body.width >= this.world.bounds.right){
                this.player.body.x -= 25;
                this.player.body.velocity.x = 0;
            }
            else if(this.player.body.y + (this.player.body.height * 1.5) < 0){
                this.player.body.y += 25;
                this.player.body.velocity.y = 0;
            }

            //Jumping
            if (this.jumping){
                if(this.facing == 'left'){
                    this.player.play('jumpLeft');
                }
                else {
                    this.player.play('jumpRight');
                }
            }
            else {
                this.player.body.velocity.x = 0;
            }

            if(this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
                if(!this.jumping){
                    this.jumping = true;
                    this.player.body.velocity.y = -400;
                }
            }

            if (this.cursors.left.isDown)
            {
                this.player.body.velocity.x = -200;
                this.facing = 'left';
                if(!this.jumping){
                    this.player.play('left');
                }
            }
            else if (this.cursors.right.isDown)
            {
                this.player.body.velocity.x = 200;
                this.facing = 'right';
                if(!this.jumping){
                    this.player.play('right');
                }
            }
            else
            {
                if(!this.jumping){
                    this.player.animations.stop();

                    if (this.facing === 'left')
                    {
                        this.player.frame = 8;
                    }
                    else
                    {
                        this.player.frame = 0;
                    }
                }
            }
        },
        collidePlatform: function(a, b){
            //Cancel jump event only if player is on top of platform
            if(a.body.y + a.body.height <= b.body.y){
                this.jumping = false;
            }
        },
        fellDown: function(){
            this.bmpText = game.add.bitmapText(this.player.x - (GAME_WIDTH / 4), 240, 'carrier_command','GAME OVER', 38);
            this.bmpText.inputEnabled = true;
            this.player.kill();
            console.log("fell down a hole");
        },
        createPlatforms: function(){
            var x = 0;
            var y = 0;
            var nextHole = GAME_WIDTH;
            while(x < nextHole){
                this.platforms.create(x, this.basePlatformHeight, 'platform_large_straight');
                x += TILE_WIDTH;
            }

            x += TILE_WIDTH;
            nextHole += 512;
            while(x < nextHole){
                this.platforms.create(x, this.basePlatformHeight, 'platform_large_straight');
                x += TILE_WIDTH;
            }

            x += TILE_WIDTH;
            nextHole += 256;
            while(x < nextHole){
                this.platforms.create(x, this.basePlatformHeight, 'platform_large_straight');
                x += TILE_WIDTH;
            }

            x += TILE_WIDTH;
            while(x < WORLD_WIDTH){
                this.platforms.create(x, this.basePlatformHeight, 'platform_large_straight');
                x += TILE_WIDTH;
            }

            //Create left and right walls
            // while(y < GAME_HEIGHT){
            //     this.platforms.create(-TILE_WIDTH, y, 'platform_large_straight');
            //     this.platforms.create(WORLD_WIDTH - (TILE_WIDTH / 4), y, 'platform_large_straight');

            //     y += TILE_WIDTH;
            // }

            //Place steps
            this.createPlatform(WORLD_WIDTH - TILE_WIDTH, this.basePlatformHeight - TILE_WIDTH, 'platform_large_straight');
            this.createPlatform(WORLD_WIDTH - (TILE_WIDTH * 2), this.basePlatformHeight - (TILE_WIDTH / 2), 'platform_large_straight');

            //Place floating platforms
            this.createPlatform(2045, 250, 'platform_small_straight');
            this.createPlatform(2215, 300, 'platform_small_straight');
            this.createPlatform(2445, 300, 'platform_small_straight');
            this.createPlatform(3045, 300, 'platform_small_straight');
            this.createPlatform(2900, 250, 'platform_small_straight');
            this.createPlatform(2745, 200, 'platform_small_straight');
            this.createPlatform(2600, 150, 'platform_small_straight');
            this.createPlatform(2445, 100, 'platform_small_straight');
            this.createPlatform(2295, 75, 'platform_small_straight');
            this.createPlatform(2095, 50, 'platform_small_straight');
        },
        createPlatform: function(x, y, type){
            var platform = this.platforms.create(x, y, type);
            //platform.body.setSize(100, 50, 14, 0);
        },
        placeScenery: function(){
            this.add.sprite(0, 270, 'cactus_tall');
            this.add.sprite(1780, 270, 'cactus_tall');

            this.add.sprite(580, 335, 'cactus_small');
            this.add.sprite(2403, 335, 'cactus_small');

            this.add.sprite(1295, 335, 'cactus_yellow');
            this.add.sprite(2825, 335, 'cactus_purple');

            this.add.sprite(345, 335, 'weed_green');
            this.add.sprite(1030, 335, 'weed_brown');

            this.add.sprite(1515, 335, 'rock_flower');
            this.add.sprite(2245, 335, 'rock1');
            this.add.sprite(345, 335, 'rock2');

            this.add.sprite(270, 270, 'platform2');
        }
    };

    game.state.add('Game', PhaserGame, true);
