var socket = io.connect(),
	sessionAck = false,
	manifest,
	queue,
	totalLoaded,
	images,
	animations,
	words,
	currentTarget = null, currentPos = 0,
	fireballs,
	difficulty = "easy",
	stage, wordsContainer, fireballsContainer,
	hpContainer, hpBar, hpRemaining = 1.0, hpPerFail, hpPerWord,
	energyContainer, energyBar, energyRemaining = 0.0, energyPerWord,
	canvasBaseWidth = 1152, canvasBaseHeight = 812,
	counter, wordRate = 60, wordSpeed = 2, fireballSpeed = 16,
	streakCount, streakCountText, bestStreakCount, bestStreakCountText, wordCount, wordCountText, bestWordCount, bestWordCountText,
	pause = false, kanjiOn = false,
	wordSet, wordSet2, refreshCounter = 0, refreshRequest = false;

socket.on('acknowledge', function(ack){
  sessionAck = ack;
});

function game2() {

	socket.emit('getwords', 0, function (data) {
		wordSet = data;
	});

	window.onresize = resize;

	totalLoaded = 0;

	images = {};
	animations = {};
	words = {};
	fireballs = [];

	resize();

	stage = new createjs.Stage("stage");
	wordsContainer = new createjs.Container();
	fireballsContainer = new createjs.Container();

	// Difficulty settings
	switch(difficulty){
		case "easy":
			wordRate = 120;
			wordSpeed = 2;
			hpPerFail = -0.1;
			hpPerWord = 0.05;
			energyPerWord = 0.2;
			break;
	}

	// HP bar
	hpContainer = new createjs.Container();
	hpContainer.x = 928;
	hpContainer.y = 20;
	hpContainer.addChild(new createjs.Shape(new createjs.Graphics().beginFill("yellow").drawRect(0, 0, 204, 34)));
	hpContainer.addChild(new createjs.Shape(new createjs.Graphics().beginFill("black").drawRect(2, 2, 200, 30)));
	hpBar = new createjs.Shape(new createjs.Graphics().beginFill("orange").drawRect(2, 2, 200*hpRemaining, 30));
	hpContainer.addChild(hpBar);

	// Energy bar
	energyContainer = new createjs.Container();
	energyContainer.x = 20;
	energyContainer.y = 20;
	energyContainer.addChild(new createjs.Shape(new createjs.Graphics().beginFill("yellow").drawRect(0, 0, 204, 34)));
	energyContainer.addChild(new createjs.Shape(new createjs.Graphics().beginFill("black").drawRect(2, 2, 200, 30)));
	energyBar = new createjs.Shape(new createjs.Graphics().beginFill("pink").drawRect(2, 2, 200*energyRemaining, 30));
	energyContainer.addChild(energyBar);

	// Text
	streakCountText = new createjs.Text("Streak:", "22px Play", "#ff7700"); streakCountText.x = 10; streakCountText.y = canvasBaseHeight-44; streakCountText.textBaseline = "alphabetic";
	bestStreakCountText = new createjs.Text("Best:", "22px Play", "#ff7700"); bestStreakCountText.x = 10; bestStreakCountText.y = canvasBaseHeight-22; bestStreakCountText.textBaseline = "alphabetic";
	wordCountText = new createjs.Text("Total:", "22px Play", "#ff7700"); wordCountText.x = 140; wordCountText.y = canvasBaseHeight-44; wordCountText.textBaseline = "alphabetic";
	bestWordCountText = new createjs.Text("Best:", "22px Play", "#ff7700"); bestWordCountText.x = 140; bestWordCountText.y = canvasBaseHeight-22; bestWordCountText.textBaseline = "alphabetic";

	// Internationalization
  	i18n.init({ useCookie: false },setLngVariables);

	manifest = [];
    manifest.push({src:"images/app2/dragon.png", id:"dragon", imageType:"spriteSheet",
     	frames:{width: 176, height: 144, regX: 88, regY: 72},
     	animations: {
			attack: [0, 2, "attack"]
		},
		initAnim: "attack",
		animName: "monster1"
	});
	manifest.push({src:"images/app2/bg.png", id:"bg", imageType:"background"});
	manifest.push({src:"images/app2/fireball.png", id:"fireball"});

    queue = new createjs.LoadQueue();
    queue.addEventListener("progress", handleProgress);
    queue.addEventListener("complete", handleComplete);
    queue.addEventListener("fileload", handleFileLoad);
    queue.loadManifest(manifest);
}

function resize(){
	$("#stage").width(window.innerWidth);
  	$("#stage").height(window.innerHeight);
}

function update(){
	if(!pause){
		moveBackground();
		updateWords();
		updateFireballs();
		updateWordSets();
		stage.update();
	}
}

function handleProgress(event){
  $("#progress_bar1").css("width",Math.floor(event.loaded*100)+"%");
}

function handleComplete(event){

	setTimeout(function(){
  		counter = 0;
  		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick",update);

        stage.removeAllChildren();
        for(var i=0; i<images["bg"].length; i++){
        	for(var j=0; j<images["bg"][i].length; j++){
        		stage.addChild(images["bg"][i][j]);
        	}
        }
        stage.addChild(fireballsContainer);
        stage.addChild(wordsContainer);
        stage.addChild(animations["dragon"]);
        stage.addChild(streakCountText);
        stage.addChild(bestStreakCountText);
        stage.addChild(wordCountText);
        stage.addChild(bestWordCountText);
        stage.addChild(hpContainer);
        stage.addChild(energyContainer);
        stage.update();

        $("#input1").on("input",inputChange);
        $("#input_div").css("display","block");

        $("#progress_bar_container").css("display","none");
        $("#stage").css("display","block");
        $("#input1").focus();
	}, 1000);

}

function handleFileLoad(event){

  switch(event.item.type){

    case createjs.LoadQueue.IMAGE:
		//image loaded
      	var img = new Image();
      	img.src = event.item.src;
      	$(img).load( function() {

	      	switch(event.item.imageType){

		      	case "spriteSheet":
		      		var spriteSheet =
		      			new createjs.SpriteSheet({
							images: [img],
							frames: event.item.frames,
							animations: event.item.animations
						}),
						animation = new createjs.Sprite(spriteSheet);

					animation.gotoAndPlay(event.item.initAnim);
					animation.shadow = new createjs.Shadow("#454", 0, 5, 4);

					animation.name = event.item.animName;
					animation.x = event.item.frames.regX+(canvasBaseWidth-event.item.frames.width)/2;
					animation.y = event.item.frames.regY+(canvasBaseHeight-event.item.frames.height);

					animations[event.item.id] = animation;
		      		break;

		      	case "background":
		      		images[event.item.id] = [];
		      		for(var i=0; i<=canvasBaseWidth/img.width;i++){
		      			images[event.item.id].push([]);
		      			for(var j=0; j<=canvasBaseHeight/img.height; j++){
		      				images[event.item.id][i].push(new createjs.Bitmap(img));
		      				images[event.item.id][i][j].x = i*img.width;
		      				images[event.item.id][i][j].y = j*img.height;
		      			}
		      		}
		      		break;

		      	default:
		      		var bitmap =  new createjs.Bitmap(img);
		      		bitmap.x = 0;
		      		bitmap.y = 0;

		      		images[event.item.id] = bitmap;
		      		break;
	      	}

		}).error( function() {
    		console.log("Unable to load resource: "+event.item.src);
		});

      	totalLoaded++;
      	break;
  }
}

function handleLoadComplete(event){
}


function pickRandomProperty(obj) {
	var keys = Object.keys(obj);
	return keys[parseInt(Math.random()*keys.length)];
}

function moveBackground(){
	for(var i=0; i<images["bg"].length; i++){
		for(var j=0; j<images["bg"][i].length; j++){
			images["bg"][i][j].y++;
			if(images["bg"][i][j].y > canvasBaseHeight){
				images["bg"][i][j].y = -(canvasBaseHeight/(images["bg"][0].length-1))+1;
			}
		}
	}
}

function changeHP(amount){

	hpRemaining += amount;
	hpRemaining = hpRemaining < 0 ? 0 : hpRemaining > 1 ? 1 : hpRemaining;
	hpBar.graphics.clear()
	hpBar.graphics.beginFill("orange").drawRect(2, 2, 200*hpRemaining, 30);
}

function changeEnergy(amount){

	energyRemaining += amount;
	energyRemaining = energyRemaining < 0 ? 0 : energyRemaining > 1 ? 1 : energyRemaining;
	energyBar.graphics.clear()
	energyBar.graphics.beginFill("pink").drawRect(2, 2, 200*energyRemaining, 30);
}

function parseTargetString(word){

	var target = {};
	target.str = [];
	target.displayStr = [];

	if(kanjiOn){
	}
	else{

		for(var i=0; i<word.romaji.length; i++){
			if(word.romaji[i] instanceof Array){
				for(var j=0; j<word.romaji[i].length; j++){
					target.str.push(word.romaji[i][j]);
				}
			}
			else{
				target.str.push(word.romaji[i]);
			}
		}

		for(var i=0; i<word.writing.length; i++){
			if(word.writing[i] instanceof Array){
				for(var j=0; j<word.writing[i].length; j++){
					target.displayStr.push(word.writing[i][j]);
				}
			}
			else{
				target.displayStr.push(word.writing[i]);
			}
		}
	}

	return target;
}

function createWord(){

	var wordNum = parseInt(Math.random()*wordSet.length);
	var target = parseTargetString(wordSet[wordNum]);

	while(words[wordNum]){
		wordNum = wordNum+"-";
	}

	words[wordNum] = {};
	words[wordNum].str = target.str;
	words[wordNum].displayStr = target.displayStr;
	words[wordNum].displayStrHit = [];
	words[wordNum].strObj = new createjs.Text(words[wordNum].displayStr.toString().replace(/,/g,""), "24px Arial", "#7700ff");
	words[wordNum].strObj.x = parseInt(Math.random()*(canvasBaseWidth-200));
	words[wordNum].strObj.y = -20;
	words[wordNum].strObj.textBaseline = "alphabetic";
	stage.getChildAt(stage.getChildIndex(wordsContainer)).addChild(words[wordNum].strObj);
	words[wordNum].strObjHit = new createjs.Text(words[wordNum].displayStrHit.toString().replace(/,/g,""), "24px Arial", "#ff0000");
	words[wordNum].strObjHit.x = words[wordNum].strObj.x;
	words[wordNum].strObjHit.y = -20;
	words[wordNum].strObjHit.textBaseline = "alphabetic";
	stage.getChildAt(stage.getChildIndex(wordsContainer)).addChild(words[wordNum].strObjHit);

	if(Math.random() < 0.5){
		// The word aims to hit the player
		var ticksNeeded = (canvasBaseHeight-104)/wordSpeed;
		words[wordNum].stepX = (canvasBaseWidth/2-words[wordNum].strObj.getBounds().width/2-words[wordNum].strObj.x)/ticksNeeded;
	}
	else{
		words[wordNum].stepX = 0;
	}
}

function destroyWord(key){

	stage.getChildAt(stage.getChildIndex(wordsContainer)).removeChild(words[key].strObj);
	stage.getChildAt(stage.getChildIndex(wordsContainer)).removeChild(words[key].strObjHit);
	delete words[key];

	if(currentTarget == key){
		currentTarget = null;
		currentPos = 0;
	}

	refreshCounter++;
}

function updateWords(){
	counter++;
	if(counter == wordRate){
		counter = 0;

		if(wordSet){
			createWord();
		}
	}

	for(var wordNum in words){
		words[wordNum].strObj.x+=words[wordNum].stepX;
		words[wordNum].strObjHit.x+=words[wordNum].stepX;
		words[wordNum].strObj.y+=wordSpeed;
		words[wordNum].strObjHit.y+=wordSpeed;
		if(words[wordNum].strObj.y > canvasBaseHeight){
			destroyWord(wordNum);
			updateStreakCount(0);
			changeHP(hpPerFail);
		}
	}
}

function shootFireball(key){
	var ticksToImpact = 30;

	if(!key){
		key = pickRandomProperty(words);
	}

	fireballs.push({});
	fireballs[fireballs.length-1]["img"] = images["fireball"].clone();
	fireballs[fireballs.length-1]["img"].x = animations["dragon"].x;
	fireballs[fireballs.length-1]["img"].y = animations["dragon"].y;
	fireballs[fireballs.length-1]["target"] = key;

	fireballs[fireballs.length-1]["stepY"] = fireballs[fireballs.length-1]["img"].y-words[key].strObj.y < 0 ? fireballSpeed : -fireballSpeed;

	ticksToImpact = (fireballs[fireballs.length-1]["img"].y-words[key].strObj.y)/(wordSpeed+fireballSpeed);

	fireballs[fireballs.length-1]["stepX"] = ticksToImpact == 0 ? 0 :
		words[key].stepX+(words[key].strObj.x+words[key].strObj.getBounds().width/2-fireballs[fireballs.length-1]["img"].x-fireballs[fireballs.length-1]["img"].getBounds().width/2)/ticksToImpact;

	stage.getChildAt(stage.getChildIndex(fireballsContainer)).addChild(fireballs[fireballs.length-1]["img"]);
}

function updateFireballs(){
	var difY;

	for(var i=0; i<fireballs.length; i++){

		if(words[fireballs[i]["target"]]){

			difY = words[fireballs[i]["target"]].strObj.y - fireballs[i].img.y;

			fireballs[i].img.x += fireballs[i].stepX;
			fireballs[i].img.y += fireballs[i].stepY;

			if(Math.abs(difY) <= fireballSpeed){
				stage.getChildAt(stage.getChildIndex(fireballsContainer)).removeChild(fireballs[i]["img"]);
				wordHit(fireballs[i]["target"]);
				fireballs.splice(i,1);
				i--;
			}
		}
		else{
			stage.getChildAt(stage.getChildIndex(fireballsContainer)).removeChild(fireballs[i]["img"]);
			fireballs.splice(i,1);
			i--;
		}
	}
}

function wordHit(key){

	if(words[key].strObj.text.length-1 == words[key].strObjHit.text.length){
		destroyWord(key);
		changeHP(hpPerWord);
		changeEnergy(energyPerWord);

		updateWordCount(wordCount+1);
		if(wordCount > bestWordCount){
			updateBestWordCount(wordCount);
		}
		updateStreakCount(streakCount+1);
		if(streakCount > bestStreakCount){
			updateBestStreakCount(streakCount);
		}
	}
	else{
		words[key].displayStrHit = words[key].displayStr.slice(0,words[key].displayStrHit.length+1);
		words[key].strObjHit.text = words[key].displayStrHit.toString().replace(/,/g,"");
	}
}

function inputChange(){
	var key;

	if(key = checkValidity($("#input1").val().toLowerCase())){
		if(words[currentTarget].str.length <= currentPos){
			currentPos = 0;
			currentTarget = null;
		}
		shootFireball(key);
		$("#input1").val("");
	}
}

function checkValidity(value){

	if(currentTarget){
		if(words[currentTarget].str[currentPos] == value){
			currentPos++;
			return currentTarget;
		}
	}
	else{
		var bestTarget = null,
			bestY = -100;

		for(var wordNum in words){
			if(words[wordNum].str[currentPos] == value && words[wordNum].strObj.y > bestY && !words[wordNum].targeted){
				bestY = words[wordNum].strObj.y;
				bestTarget = wordNum;
			}
		}

		if(bestTarget){
			currentPos++;
			currentTarget = bestTarget;
			words[currentTarget].targeted = true;
			return bestTarget;
		}
	}

	return null;
}

function updateWordSets(){
	if(refreshCounter > 20){

		if(!refreshRequest){
			refreshRequest = true;

			socket.emit('getwords', 0, function (data) {
				wordSet2 = data;
			});
		}

		if(refreshCounter > 30){
			wordSet = wordSet2;
			wordSet2 = null;
			refreshRequest = false;
			refreshCounter = 0;
		}
	}
}

function setLngVariables(){

	updateStreakCount(0);
  	updateBestStreakCount(0);
  	updateWordCount(0);
  	updateBestWordCount(0);
}

function updateStreakCount(value){
	streakCount = value;
 	streakCountText.text = i18n.t("streak")+": "+value;
}

function updateBestStreakCount(value){
	bestStreakCount = value;
 	bestStreakCountText.text = i18n.t("best")+": "+value;
}

function updateWordCount(value){
	wordCount = value;
 	wordCountText.text = i18n.t("wordCount")+": "+value;
}

function updateBestWordCount(value){
	bestWordCount = value;
 	bestWordCountText.text = i18n.t("best")+": "+value;
}