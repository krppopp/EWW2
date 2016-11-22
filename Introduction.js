EWW.Introduction = function (game) {

};

EWW.Introduction.prototype = {

	create: function () {
        var game = this;
        game.levelData = JSON.parse(game.cache.getText('levels'));
        game.buttonClick = game.add.audio(game.levelData.audio[0].buttonClickAudio);
        game.transitionSound = game.add.audio(game.levelData.audio[0].transitionAudio);
        
        game.add.sprite(0,0,game.levelData.sprites[0].introBG);
        
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

	},

	update: function () {


	},


};