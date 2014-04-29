var socket = io.connect(),
    sessionAck = false,
    manifest,
    queue,
    totalLoaded,
    images, kanaImages, background,
    currentImg,
    stage,
    tweening,
    progress, progressbg,
    kanaRoute = "images/kana/",
    kana = [{"name":"a","ruta":"a"},{"name":"o","ruta":"o-1"},{"name":"o","ruta":"o-2"},{"name":"ka","ruta":"ka"},{"name":"ma","ruta":"ma"},{"name":"ta","ruta":"ta"}],
    visualize = 2,
    kanaScaling = 0.4,
    canvasBaseWidth = 1152, canvasBaseHeight = 812,
    streak, best, streakText, bestText,
    stats = new Game1Stats(), counter = 0, timeIni;

socket.on('acknowledge', function(ack){
  sessionAck = ack;
});

function game1(){

  window.onresize = resize;
  resize();

  socket.emit('getsyllables', 0, function (data) {
    kana = data[0];

    updateBest(data[1]);

    manifest = [];
    manifest.push({src:"images/app1/bg.gif", id:"bg", imageType:"background"});
    manifest.push({src:"images/app1/canvas.png", id:"canvas"});
    for(var i=0; i<kana.length; i++){
      manifest.push({src:kanaRoute+"hiragana/"+kana[i].route+".gif", id:kana[i].route, imageType:"kana"});
    }
    for(var i=0; i<kana.length; i++){
      manifest.push({src:kanaRoute+"katakana/"+kana[i].route+".gif", id:kana[i].route, imageType:"kana"});
    }

    queue = new createjs.LoadQueue();
    queue.addEventListener("progress", handleProgress);
    queue.addEventListener("complete", handleComplete);
    queue.addEventListener("fileload", handleFileLoad);
    queue.loadManifest(manifest);

  });

  // Text
  streakText = new createjs.Text("", "22px Play", "#ff7700"); streakText.x = 20; streakText.y = 20; streakText.textBaseline = "alphabetic";
  bestText = new createjs.Text("", "22px Play", "#ff7700"); bestText.x = 20; bestText.y = 44; bestText.textBaseline = "alphabetic";

  // Internationalization
  i18n.init({ useCookie: false },setLngVariables);

  tweening = false;
  currentImg = 0;
	totalLoaded = 0;
  images = {};
	kanaImages = [];

  stage = new createjs.Stage(document.getElementById("stage"));

  createjs.Ticker.setFPS(30);
  createjs.Ticker.addEventListener("tick",stage);
}

function resize(){
  $("#stage").width(window.innerWidth);
  $("#stage").height(window.innerHeight);
}

function handleProgress(event){
  $("#progress_bar1").css("width",Math.floor(event.loaded*100)+"%");
}

function handleComplete(event){

  setTimeout(function(){
        stage.removeAllChildren();
        stage.addChild(background);
        stage.addChild(streakText);
        stage.addChild(bestText);

        images["canvas"].scaleY = 1.5;
        images["canvas"].x = (canvasBaseWidth-images["canvas"].getBounds().width*images["canvas"].scaleX)/2;
        images["canvas"].y = (canvasBaseHeight-images["canvas"].getBounds().height*images["canvas"].scaleY)/2;
        stage.addChild(images["canvas"]);

        stage.addChild(kanaImages[0]);
        stage.update();

        $("#input1").on("input",inputChange);
        $("#select1").change(selectChange);

        $("#input_div").css("display","block");

        $("#loading_screen_container").css("display","none");
        $("#stage").css("display","block");
        timeIni = new Date().getTime();
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
          case "background":
            background = new createjs.Bitmap(img);
            background.x = 0;
            background.y = 0;
            break;

          case "kana":
            kanaImages[totalLoaded] = new createjs.Bitmap(img);
            kanaImages[totalLoaded].scaleX = kanaScaling;
            kanaImages[totalLoaded].scaleY = kanaScaling;
            kanaImages[totalLoaded].x = (canvasBaseWidth-img.width*kanaScaling)/2;
            kanaImages[totalLoaded].y = (canvasBaseHeight-img.height*kanaScaling)/2;
            totalLoaded++;
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

      break;
  }
}

function handleLoadComplete(event){
}

function skip(){

  if(currentImg < kana.length){
    stats.updateHiragana(kana[currentImg].id);
  }
  else{
    stats.updateKatakana(kana[currentImg%kana.length].id);
  }

  updateStreak(0);
  nextImg();
}

function nextImg(){

  counter++;
  if(counter > 4){
    counter = 0;
    if(sessionAck){
      socket.emit('game1:stats', [stats, streak], function (){
        stats = new Game1Stats();
        stats.best = best;
      });
    }
  }

  if(!tweening){
    tweening = true;
    $("#input1").attr("disabled",true);

    createjs.Tween.get(kanaImages[currentImg]).to({x:-kanaImages[currentImg].getBounds().width*0.1, scaleX:0.1, scaleY:0.1}, 1000);

    var nextImg = Math.floor(visualize === 2 ? Math.random()*2*kana.length : visualize*kana.length+Math.random()*kana.length);
    currentImg = currentImg === nextImg ? visualize === 2 ? (nextImg+1)%(kana.length*2) : visualize*kana.length+((nextImg+1)%kana.length) : nextImg;

    kanaImages[currentImg].x = canvasBaseWidth;
    kanaImages[currentImg].scaleX = 0.1;
    kanaImages[currentImg].scaleY = 0.1;
    stage.addChild(kanaImages[currentImg]);

    createjs.Tween.get(kanaImages[currentImg]).to({x:(canvasBaseWidth-kanaImages[currentImg].getBounds().width*kanaScaling)/2, scaleX:kanaScaling, scaleY:kanaScaling}, 1000, createjs.Ease.linear).call(finishShift);

    stage.update();
  }
}

function finishShift(){
  stage.removeChildAt(stage.children.length-2);
  stage.update();
  tweening = false;
  $("#input1").val("");
  $("#input1").attr("disabled",false);
  timeIni = new Date().getTime();
  $("#input1").focus();
}

function setLngVariables(){

  $("#boton1").html(i18n.t("skip"));

  updateStreak(0);
  updateBest(0);

  $("#both").text(i18n.t("both"));
}

function inputChange(){
  if($("#input1").val().toLowerCase() === kana[currentImg%kana.length].romaji){

    var time = new Date().getTime() - timeIni;
    if(currentImg < kana.length){
      stats.updateHiragana(kana[currentImg].id,time);
    }
    else{
      stats.updateKatakana(kana[currentImg%kana.length].id,time);
    }

    updateStreak(streak+1);
    if(streak > best){
      updateBest(streak);
    }

    nextImg();
  }
}

function selectChange(){
  visualize = $("#select1")[0].selectedIndex;
  if(visualize !== 2){
    skip();
  }
  else{
    updateStreak(0);
  }
}

function updateStreak(value){
  streak = value;
  streakText.text = i18n.t("streak")+": "+value;
}

function updateBest(value){
  stats.updateBest(value);
  best = value;
  bestText.text = i18n.t("best")+": "+value;
}
