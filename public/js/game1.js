var socket = io.connect(),
    sessionAck = false,
    manifest,
    queue,
    totalLoaded,
    images,
    currentImg,
    stage,
    tweening,
    progress, progressbg,
    kanaRoute = "images/kana/",
    kana = [{"name":"a","ruta":"a"},{"name":"o","ruta":"o-1"},{"name":"o","ruta":"o-2"},{"name":"ka","ruta":"ka"},{"name":"ma","ruta":"ma"},{"name":"ta","ruta":"ta"}],
    visualize = 2,
    streak, best, streakText, bestText,
    stats = new Game1Stats(), counter = 0, timeIni;

socket.on('acknowledge', function(ack){
  sessionAck = ack;
});

function game1(){
  socket.emit('getsyllables', 0, function (data) {
    kana = data[0];

    updateBest(data[1]);

    manifest = [];
    for(var i=0; i<kana.length; i++){
      manifest.push({src:kanaRoute+"hiragana/"+kana[i].route+".gif", id:kana[i].route});
    }
    for(var i=0; i<kana.length; i++){
      manifest.push({src:kanaRoute+"katakana/"+kana[i].route+".gif", id:kana[i].route});
    }


    queue = new createjs.LoadQueue();
    queue.addEventListener("progress", handleProgress);
    queue.addEventListener("complete", handleComplete);
    queue.addEventListener("fileload", handleFileLoad);
    queue.loadManifest(manifest);

  });

  // Text
  streakText = new createjs.Text("", "20px Play", "#ff7700"); streakText.x = 280; streakText.y = 20; streakText.textBaseline = "alphabetic";
  bestText = new createjs.Text("", "20px Play", "#ff7700"); bestText.x = 280; bestText.y = 40; bestText.textBaseline = "alphabetic";

  // Internationalization
  i18n.init({ useCookie: false },setLngVariables);

  tweening = false;
  currentImg = 0;
	totalLoaded = 0;
	images = [];

  stage = new createjs.Stage(document.getElementById("stage"));

  // Progress bar
  progressbg = new createjs.Shape();
  progressbg.graphics.beginFill("#000000").drawRect(37, 172, 300, 30);
  stage.addChild(progressbg);
  progress = new createjs.Shape();
  progress.graphics.beginFill("#ff0000").drawRect(37, 172, 0, 30);
  stage.addChild(progress);

  createjs.Ticker.setFPS(30);
  createjs.Ticker.addEventListener("tick",stage);
}

function handleProgress(event){
  $("#progress_bar1").css("width",Math.floor(event.loaded*100)+"%");
}

function handleComplete(event){

  setTimeout(function(){
        stage.removeAllChildren();
        stage.addChild(streakText);
        stage.addChild(bestText);
        stage.addChild(images[0]);
        stage.update();

        $("#input1").on("input",inputChange);
        $("#select1").change(selectChange);

        $("#boton1").css("display","block");
        $("#input1").css("display","block");
        $("#select1").css("display","block");

        $("#progress_bar_container").css("display","none");
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

      images[totalLoaded] = new createjs.Bitmap(img);
      images[totalLoaded].scaleX=0.75;
      images[totalLoaded].scaleY=0.75;

      totalLoaded++;
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

    createjs.Tween.get(images[currentImg]).to({x:-images[currentImg].getBounds().width, scaleX:0.25, scaleY:0.25}, 1000);

    var nextImg = Math.floor(visualize === 2 ? Math.random()*2*kana.length : visualize*kana.length+Math.random()*kana.length);
    currentImg = currentImg === nextImg ? visualize === 2 ? (nextImg+1)%(kana.length*2) : visualize*kana.length+((nextImg+1)%kana.length) : nextImg;

    images[currentImg].x = 375;
    images[currentImg].scaleX = 0.25;
    images[currentImg].scaleY = 0.25;
    stage.addChild(images[currentImg]);

    createjs.Tween.get(images[currentImg]).to({x:0, scaleX:0.75, scaleY:0.75}, 1000, createjs.Ease.linear).call(finishShift);

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
