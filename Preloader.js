EWW.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

EWW.Preloader.prototype = {

	preload: function () {
        this.levelData = JSON.parse(this.cache.getText('levels'));
        this.sprites = [this.levelData.sprites];
        this.audio = [this.levelData.audio];
        this.roundDesign = [this.levelData.levels];
        
        //this.load.atlasJSONArray('intro', 'Assets/Images/intro.png', 'Assets/Images/intro,json');
        this.load.spritesheet(this.sprites[0][0].playButton, 'Assets/Images/' + this.sprites[0][0].playButton + '.png', 197, 210);
        this.load.spritesheet(this.sprites[0][0].exitButton, 'Assets/Images/' + this.sprites[0][0].exitButton + '.png', 82, 81);
        this.load.image(this.sprites[0][0].titleImg, 'Assets/Images/' + this.sprites[0][0].titleImg + '.png');
        this.load.image(this.sprites[0][0].extra, 'Assets/Images/' + this.sprites[0][0].extra + '.png');
        this.load.image(this.sprites[0][0].titleChara, 'Assets/Images/' + this.sprites[0][0].titleChara + '.png');
        this.load.image(this.sprites[0][0].logo, 'Assets/Images/' + this.sprites[0][0].logo + '.png');
        this.load.image(this.sprites[0][0].title, 'Assets/Images/' + this.sprites[0][0].title + '.png');
        this.load.image(this.sprites[0][0].skipButton, 'Assets/Images/' + this.sprites[0][0].skipButton + '.png');
        this.load.image(this.sprites[0][0].introBG, 'Assets/Images/' + this.sprites[0][0].introBG + '.png');
                
        //add more audio implementation as more assets come in
        this.load.audio(this.audio[0][0].transitionAudio, 'Assets/Audio/Transition/' + this.audio[0][0].transitionAudio + '.wav');
        this.load.audio(this.audio[0][0].wrongAnswerAudio, 'Assets/Audio/Answers/' + this.audio[0][0].wrongAnswerAudio + '.wav');
        this.load.audio(this.audio[0][0].correctAnswerAudio, 'Assets/Audio/Answers/' + this.audio[0][0].correctAnswerAudio + '.wav');
        this.load.audio(this.audio[0][0].buttonClickAudio, 'Assets/Audio/UI/' + this.audio[0][0].buttonClickAudio + '.mp3');
        this.load.audio(this.audio[0][0].mainMenuAudio, 'Assets/Audio/Music/' + this.audio[0][0].mainMenuAudio + '.wav');
        this.load.audio(this.audio[0][0].genericLevelAudio, 'Assets/Audio/Music/' + this.audio[0][0].genericLevelAudio + '.wav');
        
        //this needs to be changed for the final engine, depending on how BGs are going to work
        this.load.image('bg3', 'Assets/Images/bg3.png');
        this.load.image('bg1', 'Assets/Images/bg1.png');
        this.load.image('bg4', 'Assets/Images/bg4.png');
        
        for(var i = 0; i < this.roundDesign[0].length; i++){
            for(var j = 0; j < this.roundDesign[0][i].length; j++){
                for(var k = 0; k < this.roundDesign[0][i][j].Sets.length; k++){
                        this.load.atlasJSONArray(this.roundDesign[0][i][j].Sets[k][0], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][0] + ".png", 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][0] + ".json");
                        this.load.atlasJSONArray(this.roundDesign[0][i][j].Sets[k][1], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][1] + ".png", 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][1] + ".json");
                        this.load.atlasJSONArray(this.roundDesign[0][i][j].Sets[k][2], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][2] + ".png", 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][2] + ".json");
                    this.load.json(this.roundDesign[0][i][j].Sets[k][1], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][1] + ".json");
                    this.load.json(this.roundDesign[0][i][j].Sets[k][0], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][0] + ".json");
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][3], 'Assets/Audio/Sprites/' + this.roundDesign[0][i][j].Sets[k][3] + ".wav");
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][4], 'Assets/Audio/Sprites/' + this.roundDesign[0][i][j].Sets[k][4] + ".wav");
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][5], 'Assets/Audio/Sprites/' + this.roundDesign[0][i][j].Sets[k][5] + ".wav"); 
                }                
            }
        }
        
    },

	create: function () {

	},

	update: function () {
        this.state.start('Main');
	}

};