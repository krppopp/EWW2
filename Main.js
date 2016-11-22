EWW.Main = function (game) {};
EWW.Main.prototype = {
    create: function () {
        var game = this;
        game.levelData = JSON.parse(game.cache.getText('levels'));
        game.buttonClick = game.add.audio(game.levelData.audio[0].buttonClickAudio);
        game.transitionSound = game.add.audio(game.levelData.audio[0].transitionAudio);
        game.music = game.add.audio(game.levelData.audio[0].mainMenuAudio);
        game.music.play();
        game.clickedScreen = false;
        game.add.sprite(0, 0, game.levelData.sprites[0].titleImg);
        game.extra = game.add.sprite(-50, 0, game.levelData.sprites[0].extra);
        
        if(!window.doNotDisplayClose){
            game.exitButton = game.add.sprite(game.world.width*.9, game.world.height*.02, game.levelData.sprites[0].exitButton,0);    
            game.exitButton.inputEnabled = true;
            game.exitButton.events.onInputOver.add(function(sprite){
                sprite.frame =1;
            })
            game.exitButton.events.onInputDown.add(function(sprite){
                sprite.frame = 2;
                window.close();
            })
            game.exitButton.events.onInputOut.add(function(sprite){
                sprite.frame = 0;
            })
        }
        
        game.chara = game.add.sprite(game.world.width*.3, game.world.height*.6, game.levelData.sprites[0].titleChara);
        game.chara.anchor.setTo(.5,.5);
        game.logo = game.add.sprite(game.world.width*.77, game.world.height * .3, game.levelData.sprites[0].logo);
        game.title = game.add.sprite(game.world.width*.75, game.world.height * .52, game.levelData.sprites[0].title);
        //        game.spriteNum = 12;
        //        game.transitionPosX = -300;
        //        game.newScale = 2;
        //        game.hasTransitioned = false;
        game.playButton = game.add.sprite(game.world.width * .77, game.world.height * .75, game.levelData.sprites[0].playButton, 0);
        game.playButton.anchor.setTo(.5, .5);
        game.logo.anchor.setTo(.5, .5);
        game.title.anchor.setTo(.5, .5);
        game.add.tween(game.playButton.scale).from({
            x: 0
            , y: 0
        }, 2000, "Elastic", true); 
        game.add.tween(game.title.scale).from({
            x: 0
            , y: 0
        }, 1500, "Elastic", true);        
        game.add.tween(game.logo.scale).from({
            x: 0
            , y: 0
        }, 1000, "Elastic", true);        
        game.add.tween(game.chara).from({
          y: 550
        }, 1000, "Back", true);
        game.add.tween(game.chara.scale).from({
            x:.8
        }, 1000, "Elastic", true);
        game.cropRect = new Phaser.Rectangle(0,0,0,game.extra.height);
        game.cropTween = game.add.tween(game.cropRect).to({width:game.extra.width},1000,"Linear",true);
        game.extra.crop(game.cropRect);
        game.cropTween.start();
        
        game.playButton.inputEnabled = true;
        game.playButton.events.onInputOver.add(function (sprite) {
            sprite.frame = 1;
            var playTween = game.add.tween(sprite.scale).to({
                x: 1.1
                , y: 1.1
            }, 300, Phaser.Easing.Back.Out, true);
        })
        game.playButton.events.onInputOut.add(function (sprite) {
            sprite.frame = 0;
            var stopTween = game.add.tween(sprite.scale).to({
                x: 1
                , y: 1
            }, 500, "Elastic", true);
        })
        game.playButton.events.onInputDown.add(function (sprite) {
            sprite.frame = 2;
        })
         game.playButton.events.onInputUp.add(function(sprite){
            console.log("am happen");
            sprite.frame = 1;
        })
    }
    , update: function () {
            var game = this;
            //these are to check when the mouse is down
            //and what should be happening
            game.extra.updateCrop();
            if (this.input.activePointer.isDown && !game.clickedScreen) {
                game.music.stop();
                game.buttonClick.play();
                game.buttonClick.onStop.add(function(){
                    game.transitionSound.play();
                })
                //game.playButton.inputEnabled = false;
//                var playTween = game.add.tween(game.playButton.scale).to({
//                    x: 0
//                    , y: 0
//                }, 500, "Linear", true);
//                game.add.tween(game.playButton).to({
//                    angle: +360
//                }, 500, "Linear", true);
//                playTween.onComplete.add(function () {
//                    game.playButton.destroy();
//                });
                var nextBG = game.add.sprite(-1500, 0, 'bg2');
                var BGTween = game.add.tween(nextBG).to({
                    x: 0
                }, 800, "Linear", true);
                BGTween.onComplete.add(function () {
                    game.state.start('Game');
                })
                game.clickedScreen = true;
            }
        }
        //    , transition: function () {
        //        var game = this;
        //        if (!game.hasTransitioned) {
        //            game.lastHeight = -10;
        //            game.lastHeight2 = -10;
        //            game.lastPos = -10;
        //            game.lastPos2 = -10;
        //            var nextBG = game.add.sprite(-1500, 0, 'bg2');
        //            var BGTween = game.add.tween(nextBG).to({
        //                x: 0
        //            }, 4000, "Linear", true);
        //            BGTween.onComplete.add(function () {
        //                game.state.start('Introduction');
        //            })
        //            game.playButton.inputEnabled = false;
        //            var playTween = game.add.tween(game.playButton.scale).to({
        //                x: 0
        //                , y: 0
        //            }, 500, "Linear", true);
        //            game.add.tween(game.playButton).to({
        //                angle: +360
        //            }, 500, "Linear", true);
        //            playTween.onComplete.add(function () {
        //                game.playButton.destroy();
        //            })
        //            for (var i = 0; i < game.spriteNum; i++) {
        //                var newSprite = game.add.sprite(game.transitionPosX+10, game.lastPos + game.lastHeight, 'sprites', game.rnd.integerInRange(0, game.spriteNum - 2));
        //                game.lastHeight = newSprite.height;
        //                game.lastPos = newSprite.y;
        //                newSprite.scale.x = 2;
        //                newSprite.scale.y = 2;
        //                var newTween = game.add.tween(newSprite).to({
        //                    x: 1300
        //                }, 4200, "Linear", true);
        ////                var otherSprite = game.add.sprite(game.transitionPosX-100, game.lastPos2 + game.lastHeight2, 'sprites', game.rnd.integerInRange(0, game.spriteNum - 2));
        ////                game.lastHeight2 = newSprite.height;
        ////                game.lastPos2 = newSprite.y;
        ////                otherSprite.scale.x = 2;
        ////                otherSprite.scale.y = 2;
        ////                var newTween = game.add.tween(otherSprite).to({
        ////                    x: 1300
        ////                }, 4500, "Linear", true);
        //            }
        //        }
        //    }
};