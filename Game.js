EWW.Game = function (game) {
    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
    this.game; //  a reference to the currently running game (Phaser.Game)
    this.add; //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera; //  a reference to the game camera (Phaser.Camera)
    this.cache; //  the game cache (Phaser.Cache)
    this.input; //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load; //  for preloading assets (Phaser.Loader)
    this.math; //  lots of useful common math operations (Phaser.Math)
    this.sound; //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage; //  the game stage (Phaser.Stage)
    this.time; //  the clock (Phaser.Time)
    this.tweens; //  the tween manager (Phaser.TweenManager)
    this.state; //  the state manager (Phaser.StateManager)
    this.world; //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;
    this.rnd; //  the repeatable random number generator (Phaser.RandomDataGenerator)
};
EWW.Game.prototype = {
    create: function () {
        var game = this;
        //round num is the round number
        game.roundNum = 0;
        game.transitionPosX = -300;
        game.newScale = 2;
        game.hasTransitioned = false;
        //for movement/matching
        game.activeObject = null;
        game.follow = false;
        game.clickNum = 0;
        //for placement
        game.transitionPosXLeft = -100;
        game.transitionPosXRight = 1300;
        //2D array for object positions
        game.levelData = JSON.parse(game.cache.getText('levels'));
        game.roundDesign = [game.levelData.levels];
        game.seenLevels = [];
        game.lastRound = 0;
        game.set = game.rnd.integerInRange(0, 2);
        game.music = game.add.audio(game.levelData.audio[0].genericLevelAudio);
        game.music.play();
        game.music.loopFull(.5);
        game.timeOutHandler = setTimeout((game.timeOut), 12000);
        game.answersTimeOutHandler = setTimeout((game.answersTimeOut), 12000);
        //start the game
        game.roundCreate(game.roundNum);
    }
    , update: function () {
        var game = this;
        //for stick and click
        if (game.follow) {
            game.world.bringToTop(game.activeObject);
            game.activeObject.alpha = .8;
            game.activeObject.x = game.input.mousePointer.x - 5;
            game.activeObject.y = game.input.mousePointer.y - 5;
        }
        else {
            game.matchObjects.setAll("immovable", "true");
        }
        if (game.input.activePointer.isDown) {
            clearTimeout(game.timeOutHandler);
            game.timeOutHandler = setTimeout((game.timeOut), 12000);
        }
        game.physics.arcade.overlap(game.matchObjects, game.staticObjects, game.matchChara, null, this);
        //coll checks
        if (!game.follow) {
            game.physics.arcade.overlap(game.matchObjects, game.completeObjects, game.noMatch, null, this);
            game.physics.arcade.overlap(game.matchObjects, game.matchObjects, game.matchObjCol, null, this);
        }
    }
    , timeOut: function () {
        var game = this;
        clearTimeout(game.timeOutHandler);
        game.timeOutHandler = setTimeout((game.timeOut), 12000);
    }
    , answersTimeOut: function () {
        var game = this;
        clearTimeout(game.timeOutHandler);
        game.timeOutHandler = setTimeout((game.timeOut), 12000);
    }
    , matchObjCol: function (matchObj1, matchObj2) {
        var game = this;
        var overlapTween1 = game.add.tween(matchObj1).to({
            y: matchObj1.y + 10
        }, 2, "Bounce", true);
        var overlapTween2 = game.add.tween(matchObj2).to({
            y: matchObj2.y - 10
        }, 2, "Linear", true);
    }, //create function for every round
    roundCreate(roundToPlay) {
        var game = this;
        game.removeThings();
        game.correctTween = [];
        game.wrongAnswers = 0;
        game.rightAnswers = 0;
        var tempRoundNum = roundToPlay;
        game.lastRound = tempRoundNum;
        if (tempRoundNum == 0) {
            game.matchNum = 2;
        }
        else {
            game.matchNum = 3;
        }
        if (tempRoundNum == 0) {
            game.posNum = 1;
        }
        else {
            game.posNum = 2;
        }
        var bg = game.add.sprite(0, 0, game.roundDesign[0][roundToPlay][game.set].Background);
        if (!window.doNotDisplayClose) {
            game.exitButton = game.add.sprite(game.world.width * .9, game.world.height * .02, game.levelData.sprites[0].exitButton, 0);
            game.exitButton.inputEnabled = true;
            game.exitButton.events.onInputOver.add(function (sprite) {
                sprite.frame = 1;
            })
            game.exitButton.events.onInputDown.add(function (sprite) {
                sprite.frame = 2;
                window.close();
            })
            game.exitButton.events.onInputOut.add(function (sprite) {
                sprite.frame = 0;
            })
        }
        //groups to track what items are what
        //items go into the complete objects group when they've been matched
        game.matchObjects = game.add.group();
        game.staticObjects = game.add.group();
        game.completeObjects = game.add.group();
        //physics garbage
        game.matchObjects.enableBody = true;
        game.matchObjects.physicsBodyType = Phaser.Physics.ARCADE;
        game.matchObjects.setAll("collideWorldBounds", true);
        game.staticObjects.enableBody = true;
        game.staticObjects.physicsBodyType = Phaser.Physics.ARCADE;
        game.completeObjects.enableBody = true;
        game.completeObjects.physicsBodyType = Phaser.Physics.ARCADE;
        game.matchSound = [];
        game.staticSound = [];
        game.togetherSound = [];
        game.staticAnim = [];
        game.staticAnimIsPlaying = [false, false, false];
        game.togetherAnim = [];
        game.wrongSound = game.add.audio(game.levelData.audio[0].wrongAnswerAudio)
        game.transitionSound = game.add.audio(game.levelData.audio[0].transitionAudio);
        //creates the items, based on the round number
        for (var i = 0; i < game.matchNum; i++) {
            var newMatchObj = game.matchObjects.create(EWW.matchObjPosX, game.world.height * EWW.roundYPos[game.posNum - 1][i], game.roundDesign[0][roundToPlay][game.set].Sets[i][0], 0);
            var you = game.cache.getJSON(game.roundDesign[0][roundToPlay][game.set].Sets[i][0]);
            newMatchObj.body.setSize(you.frames[0].spriteSourceSize.x, you.frames[0].spriteSourceSize.y, you.frames[0].spriteSourceSize.w, you.frames[0].spriteSourceSize.h);
            newMatchObj.anchor.setTo(.2, .7);
            newMatchObj.indexNum = i;
            newMatchObj.inputEnabled = true;
            newMatchObj.input.pixelPerfectClick = true;
            newMatchObj.input.pixelPerfectOver = true;
            if (roundToPlay != 0) {
                newMatchObj.scale.x = .8;
                newMatchObj.scale.y = .8;
            }
            game.matchSound[newMatchObj.indexNum] = game.add.audio(game.roundDesign[0][roundToPlay][game.set].Sets[i][3]);
            game.add.tween(newMatchObj.scale).from({
                x: 0
                , y: 0
            }, 1000, "Elastic", true);
            var newStaticObj = game.staticObjects.create(EWW.staticObjPosX, game.world.height * EWW.staticRoundYPos[game.posNum - 1][i], game.roundDesign[0][roundToPlay][game.set].Sets[i][1], 0);
            var me = game.cache.getJSON(game.roundDesign[0][roundToPlay][game.set].Sets[i][1]);
            newStaticObj.body.setSize(me.frames[0].spriteSourceSize.x, me.frames[0].spriteSourceSize.y, me.frames[0].spriteSourceSize.w, me.frames[0].spriteSourceSize.h);
            console.log(newStaticObj.body);
            newStaticObj.anchor.setTo(.5, .5);
            if (roundToPlay != 0) {
                newStaticObj.scale.x = .8;
                newStaticObj.scale.y = .8;
            }
            newStaticObj.indexNum = i;
            newStaticObj.inputEnabled = true;
            newStaticObj.input.pixelPerfectClick = true;
            newStaticObj.input.pixelPerfectOver = true;
            game.staticSound[newStaticObj.indexNum] = game.add.audio(game.roundDesign[0][roundToPlay][game.set].Sets[i][4]);
            newStaticObj.events.onInputDown.add(function (sprite) {
                if (!game.staticAnimIsPlaying[sprite.indexNum]) {
                    game.staticAnim[sprite.indexNum] = sprite.animations.add('animate', Phaser.Animation.generateFrameNames(sprite.key + "/", 1, 100, '', 4), 20, false);
                    game.staticAnim[sprite.indexNum].onComplete.add(function () {
                        game.staticAnimIsPlaying[sprite.indexNum] = false;
                    });
                    game.staticAnim[sprite.indexNum].play();
                    game.staticAnimIsPlaying[sprite.indexNum] = true;
                }
                game.staticSound[sprite.indexNum].play();
            });
            game.add.tween(newStaticObj.scale).from({
                x: 0
                , y: 0
            }, 1000, "Elastic", true);
            game.togetherSound[newStaticObj.indexNum] = game.add.audio(game.roundDesign[0][roundToPlay][game.set].Sets[i][5]);
            //x position multiplier needs to be changed
            game.togetherAnim[newStaticObj.indexNum] = game.add.sprite(newStaticObj.x, newStaticObj.y, game.roundDesign[0][roundToPlay][game.set].Sets[i][2], 0);
            if (roundToPlay != 0) {
                game.togetherAnim[newStaticObj.indexNum].scale.x = .8;
                game.togetherAnim[newStaticObj.indexNum].scale.y = .8;
            }
            game.togetherAnim[newStaticObj.indexNum].animations.add('animate', Phaser.Animation.generateFrameNames(game.togetherAnim[newStaticObj.indexNum].key + "/", 1, 100, '', 4), 20, false);
            game.togetherAnim[newStaticObj.indexNum].anchor.setTo(.5, .5);
            game.togetherAnim[newStaticObj.indexNum].visible = false;
        }
        //input stuff
        game.matchObjects.onChildInputDown.add(function (sprite) {
            //game.sfx.play(sprite.name);
            game.matchSound[sprite.indexNum].play();
            sprite.body.collideWorldBounds = true;
            var clickScaleTween = game.add.tween(sprite.scale).to({
                x: 1.2
                , y: 1.2
            }, 100, "Linear", true);
            sprite.alpha = .8;
            if (Phaser.Device.desktop) {
                game.activeObject = sprite;
                game.follow = true;
            }
        });
        if (roundToPlay == 0) {
            var scaleIntX = 1.0;
            var scaleIntY = 1.0;
        }
        else {
            var scaleIntX = 0.8;
            var scaleIntY = 0.8;
        }
        game.matchObjects.onChildInputUp.add(function (sprite) {
            game.clickNum++;
            var clickScaleTween = game.add.tween(sprite.scale).to({
                x: scaleIntX
                , y: scaleIntY
            }, 100, "Linear", true);
            if (!Phaser.Device.desktop) {
                sprite.alpha = 1;
            }
            if (game.clickNum == 2) {
                sprite.alpha = 1;
                if (Phaser.Device.desktop) {
                    game.follow = false;
                    game.activeObject = null;
                    game.clickNum = 0;
                }
            }
        });
        game.matchObjects.onChildInputOver.add(function (sprite) {
            game.hoverTimeout = setTimeout(function(){
                game.matchSound[sprite.indexNum].play();
                sprite.animations.add('animate', Phaser.Animation.generateFrameNames(sprite.key + "/", 1, 100, '', 4), 20, false);
                sprite.animations.play('animate');
            }, 4000);

            if (!game.follow) {
                game.hoverTween = game.add.tween(sprite).to({
                    angle: [5, -5, 5, -5, 5, -5, 0]
                }, 1000, "Linear", true);
            }
        })
        game.matchObjects.onChildInputOut.add(function (sprite) {
            clearTimeout(game.hoverTimeout);
            //game.hoverTween.stop();
        })
        if (!Phaser.Device.desktop) {
            for (var i = 0; i < game.matchObjects.length; i++) {
                game.matchObjects.children[i].input.enableDrag(true);
            }
        }
    }
    //remove all things at the start of a new round
    
    , removeThings: function () {
        var game = this;
        game.world.removeAll();
    }
    , runSpriteAnimation: function (mySprite) {
            var game = this;
            mySprite.animations.add(('animate', Phaser.Animation.generateFrameNames('animate_', 2, 12), 10, true));
            mySprite.animations.play('animate');
        }
        //function to run when two items are colliding
        
    , matchChara: function (matchObj, staticObj) {
            var game = this;
            //if the two items match
            clearTimeout(game.answersTimeOutHandler);
            game.timeOutHandler = setTimeout((game.timeOut), 12000);
            if (matchObj.indexNum == staticObj.indexNum) {
                matchObj.enabledBody = false;
                staticObj.enableBody = false;
                game.wrongAnswers = 0;
                game.rightAnswers++;
                var matchIndex = staticObj.indexNum;
                var myIndex = game.rightAnswers;
                var correctSound = game.add.audio(game.levelData.audio[0].correctAnswerAudio);
                //  matchObj.bringToTop();
                game.clickNum = 0;
                game.follow = false;
                matchObj.alpha = 1;
                game.activeObject = null;
                game.add.tween(staticObj).to({
                    alpha: 0
                }, 500, "Linear", true);
                game.add.tween(matchObj).to({
                    alpha: 0
                }, 500, "Linear", true);
                game.togetherSound[matchIndex].play();
                game.togetherAnim[matchIndex].visible = true;
                game.togetherAnim[matchIndex].animations.play('animate');
                game.completeObjects.add(matchObj);
                game.completeObjects.add(staticObj);
                game.togetherSound[matchIndex].onStop.add(function () {
                    correctSound.play();
                })
                correctSound.onStop.add(function (tween) {
                    staticObj.destroy();
                    matchObj.destroy();
                    if (game.matchNum == game.rightAnswers && myIndex == game.rightAnswers) {
                        game.wrongAnswers = 0;
                        if (game.roundNum < game.roundDesign[0].length - 1) {
                            game.roundNum++;
                            game.set = game.rnd.integerInRange(0, game.roundDesign[0][game.roundNum].length - 1);
                            var bg = game.add.sprite(0, 0, game.roundDesign[0][game.roundNum][game.set].Background);
                            var BGTween = game.add.tween(bg).from({
                                x: -game.world.width - 1000
                            }, 800, "Linear", true);
                            BGTween.onComplete.add(function () {
                                game.roundCreate(game.roundNum);
                            })
                        }
                        else {
                            var nextRound = 0;
                            do {
                                nextRound = game.rnd.integerInRange(1, game.roundDesign[0].length - 1);
                            } while (nextRound == game.lastRound);
                            game.set = game.rnd.integerInRange(0, game.roundDesign[0][nextRound].length - 1);
                            var bg = game.add.sprite(0, 0, game.roundDesign[0][nextRound][game.set].Background);
                            var BGTween = game.add.tween(bg).from({
                                x: -game.world.width - 1000
                            }, 800, "Linear", true);
                            BGTween.onComplete.add(function () {
                                game.roundCreate(nextRound);
                            })
                        }
                        //game.sfx.play(finalMatchSound);
                        //when have sounds, end based on sounds instead of tween
                        game.transitionSound.play();
                    }
                });
            } //otherwise
            else {
                game.wrongSound.play();
                if (game.clickNum == 0 || !Phaser.Device.desktop) {
                    matchObj.x = EWW.matchObjPosX;
                    matchObj.y = (game.world.height * EWW.roundYPos[game.posNum - 1][matchObj.indexNum]);
                    game.wrongAnswers++;
                    if (game.wrongAnswers == 1) {
                        //game.sfx.play(WA1);
                    }
                    if (game.wrongAnswers == 2) {
                        for (var i = 0; i < game.staticObjects.length; i++) {
                            if (matchObj.indexNum == game.staticObjects.children[i].indexNum) {
                                var correctObject = game.staticObjects.children[i];
                                break;
                            }
                        }
                        game.pulseCorrect(matchObj, correctObject);
                    }
                    if (game.wrongAnswers == 3) {
                        for (var i = 0; i < game.staticObjects.length; i++) {
                            if (matchObj.indexNum == game.staticObjects.children[i].indexNum) {
                                var correctObject = game.staticObjects.children[i];
                                break;
                            }
                        }
                        game.drawLines(matchObj, correctObject);
                    }
                }
            }
        }
        //function that runs when an already matched item matches with an unmatched item 
        
    , noMatch: function (matchObj, staticObj) {
            var game = this;
            if (game.clickNum == 0) {
                game.wrongAnswers++;
                matchObj.x = EWW.matchObjPosX;
                matchObj.y = (game.world.height * EWW.roundYPos[game.posNum - 1][matchObj.indexNum]);
                if (game.wrongAnswers == 1) {
                    //game.sfx.play(WA1);
                }
                if (game.wrongAnswers == 2) {
                    for (var i = 0; i < game.staticObjects.length; i++) {
                        if (matchObj.indexNum == game.staticObjects.children[i].indexNum) {
                            var correctObject = game.staticObjects.children[i];
                            break;
                        }
                    }
                    game.pulseCorrect(matchObj, correctObject);
                }
                if (game.wrongAnswers == 3) {
                    for (var i = 0; i < game.staticObjects.length; i++) {
                        if (matchObj.indexNum == game.staticObjects.children[i].indexNum) {
                            var correctObject = game.staticObjects.children[i];
                            break;
                        }
                    }
                    game.drawLines(matchObj, correctObject);
                }
            }
        }
        //function for winning
        
    , youWin: function () {
            var game = this;
        }
        //function to make the dotted line hint stuff
        
    , drawLines: function (point1, point2) {
            var game = this;
            //game.sfx.play(WA1);
            game.wrongAnswers = 0;
            var graphics = game.add.graphics(0, 0);
            graphics.lineStyle(20, 0xffd900);
            for (var i = 1; i < 10; i++) {
                var pointA = point1.x + (point2.x - point1.x) * (i / 6);
                var pointB = point1.y + (point2.y - point1.y) * (i / 6);
                graphics.drawCircle(pointA, pointB, 20);
                if (pointA >= point2.x) {
                    game.time.events.add(Phaser.Timer.SECOND * 2, function () {
                        graphics.destroy();
                    });
                    break;
                }
            }
        }
        //function to make the pulsing hint stuff
        
    , pulseCorrect: function (obj1, obj2) {
        var game = this;
        //game.sfx.play(WA2);
        game.time.events.repeat(Phaser.Timer.SECOND, 3, function () {
            var tween = game.add.tween(obj1).to({
                alpha: .2
            }, 200, "Linear", true);
            var scaleTween = game.add.tween(obj1.scale).to({
                x: 1.2
                , y: 1.2
            }, 200, "Linear", true);
            var roTween = game.add.tween(obj1).to({
                angle: [5, -5, 5, -5, 5, -5, 0]
            }, 2000, "Linear", true);
            tween.yoyo(true, 200);
            scaleTween.yoyo(true, 200);
            var tween2 = game.add.tween(obj2).to({
                alpha: .2
            }, 200, "Linear", true);
            var scaleTween2 = game.add.tween(obj2.scale).to({
                x: 1.2
                , y: 1.2
            }, 200, "Linear", true);
            var roTween2 = game.add.tween(obj2).to({
                angle: [5, -5, 5, -5, 5, -5, 0]
            }, 2000, "Linear", true);
            tween2.yoyo(true, 200);
            scaleTween2.yoyo(true, 200);
        });
    }
    , randomBag: function (myArray) {
        var game = this;
        var newArray = Phaser.ArrayUtils.shuffle(myArray);
    }
    , removeFromArray: function (result, myArray) {
        var game = this;
        result = myArray.shift();
    }
    , render: function () {
        //still dont understand why i cannot render this stuff
        //        var game = this;
        //        game.staticObjects.forEach(function(item){
        //            if(item.body.width == 200){
        //                console.log(item.body);
        //                console.log(game.time);
        //                game.debug.body(item);
        //            }
        //        })
        //        game.matchObjects.forEach(function(item){
        //            if(item.body.width > 0){
        //               game.debug.body(item);
        //            }        
        //        })
    }
};