var socket = io.connect(),
	manifest,
	queue,
	totalLoaded,
	images,
	animations,
	words,
	fireballs,
	stage,
	canvasBaseWidth = 1152, canvasBaseHeight = 812,
	counter, wordRate = 60, wordSpeed = 4, fireballSpeed = 16, ticksToImpact = 45, counter2
	;

function init() {

	totalLoaded = 0;

	images = {};
	animations = {};
	words = {};
	fireballs = [];

  	$("#stage").width(window.innerWidth);
  	$("#stage").height(window.innerHeight);

	stage = new createjs.Stage("stage");

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

function update(){
	moveBackground();
	updateWords();
	updateFireballs();
}

function handleProgress(event){
  $("#progress_bar1").css("width",Math.floor(event.loaded*100)+"%");
}

function handleComplete(event){

	setTimeout(function(){
  		counter = 0;
  		counter2 = 0;
  		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick",update);

        stage.removeAllChildren();
        for(var i=0; i<images["bg"].length; i++){
        	for(var j=0; j<images["bg"][i].length; j++){
        		stage.addChild(images["bg"][i][j]);
        	}
        }
        stage.addChild(animations["dragon"]);
        stage.update();

        $("#progress_bar_container").css("display","none");
        $("#stage").css("display","block");
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

	stage.update();
}

function updateWords(){
	counter++;
	if(counter >= wordRate){
		counter = 0;
		var wordNum = parseInt(Math.random()*3000);
		words[wordNum] = new createjs.Text("あかさきゅ"+wordNum, "24px Arial", "#ff7700");
		words[wordNum].x = parseInt(Math.random()*(canvasBaseWidth-200));
		words[wordNum].y = -20;
		words[wordNum].textBaseline = "alphabetic";
		stage.addChild(words[wordNum]);
	}

	for(var wordNum in words){
		words[wordNum].y+=wordSpeed;
	}
}

function shootFireball(){
	var difX, difY,
		key = pickRandomProperty(words);

	fireballs.push({});
	fireballs[fireballs.length-1]["img"] = images["fireball"].clone();
	fireballs[fireballs.length-1]["img"].x = animations["dragon"].x;
	fireballs[fireballs.length-1]["img"].y = animations["dragon"].y;
	fireballs[fireballs.length-1]["target"] = key;

	difX = (fireballs[fireballs.length-1]["img"].x+fireballs[fireballs.length-1]["img"].getBounds().width/2)
			-(words[key].x+words[key].getBounds().width/2);
	difY = fireballs[fireballs.length-1]["img"].y-words[key].y-wordSpeed*ticksToImpact;

	fireballs[fireballs.length-1]["stepX"] = -difX/ticksToImpact;
	fireballs[fireballs.length-1]["stepY"] = -difY/ticksToImpact;
	stage.addChild(fireballs[fireballs.length-1]["img"]);
}

function updateFireballs(){
	var difY;

	counter2++;
	if(counter2 >= wordRate){
		counter2 = 0;
		shootFireball();
	}

	for(var i=0; i<fireballs.length; i++){

		if(words[fireballs[i]["target"]]){

			difY = words[fireballs[i]["target"]].y - fireballs[i].img.y;

			fireballs[i].img.x += fireballs[i].stepX;
			fireballs[i].img.y += fireballs[i].stepY;

			if(Math.abs(difY) <= fireballSpeed){
				stage.removeChild(fireballs[i]["img"]);
				stage.removeChild(words[fireballs[i]["target"]]);
				delete words[fireballs[i]["target"]];
				fireballs.splice(i,1);
				i--;
			}
		}
		else{
			stage.removeChild(fireballs[i]["img"]);
			fireballs.splice(i,1);
			i--;
		}
	}
}