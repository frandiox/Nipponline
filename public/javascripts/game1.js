var manifest;
var queue;
var totalLoaded;
var images;
var currentImg;
var stage;
var tweening;
var progress, progressbg;
var kanaRoute = "images/kana/";
var kana = [{"name":"a","ruta":"a"},{"name":"o","ruta":"o-1"},{"name":"o","ruta":"o-2"},{"name":"ka","ruta":"ka"},{"name":"ma","ruta":"ma"},{"name":"ta","ruta":"ta"}];
var visualize = 2;
var streak, best, streakText, bestText;;

function game1(){
	console.log("Hola!");

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


  manifest = [];
  for(var i=0; i<kana.length; i++){
    manifest.push({src:kanaRoute+"hiragana/"+kana[i].ruta+".gif", id:kana[i].ruta});
  }
  for(var i=0; i<kana.length; i++){
    manifest.push({src:kanaRoute+"katakana/"+kana[i].ruta+".gif", id:kana[i].ruta});
  }

	/*manifest = [
        {src:"img/ff1.jpg", id:"ff1"},
        {src:"img/ff2.jpg", id:"ff2"},
        {src:"img/ff3.jpg", id:"ff3"},
    ];*/
 
 
  queue = new createjs.LoadQueue();
  queue.addEventListener("progress", handleProgress);
  queue.addEventListener("complete", handleComplete);
  queue.addEventListener("fileload", handleFileLoad);
  queue.loadManifest(manifest);

  createjs.Ticker.setFPS(30);
  createjs.Ticker.addEventListener("tick",stage);
}

function handleProgress(event){
  //use event.loaded to get the percentage of the loading
  $("#progress_bar1").css("width",Math.floor(event.loaded*100)+"%");
  //progress.graphics.beginFill("#ff0000").drawRect(37, 172, event.loaded*300, 30);
  //stage.update();
}
 
function handleComplete(event){
  //triggered when all loading is complete
  setTimeout(function(){
        console.log("Carga completada");
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

        $("#input1").focus();
    }, 1000);
  
}
 
function handleFileLoad(event){
  //triggered when an individual file completes loading

  switch(event.item.type){

    case createjs.LoadQueue.IMAGE:
      //image loaded
      var img = new Image();
      img.src = event.item.src;
      //img.onload = handleLoadComplete;
      //window[event.item.id] = new Bitmap(img);
      images[totalLoaded] = new createjs.Bitmap(img);
      images[totalLoaded].scaleX=0.75;
      images[totalLoaded].scaleY=0.75;
      totalLoaded++;
     	console.log("loaded "+totalLoaded);
      if(manifest.length==totalLoaded){
        

       	
       	//$("#display1").attr("src",images[0].src).attr("height",images[0].height).attr("width",images[0].width);
   		}
      break;
  }
}

function handleLoadComplete(event){
 
  totalLoaded++;
    
  console.log("loaded "+totalLoaded);

  if(manifest.length==totalLoaded){
    console.log("Carga completada");
  }
}

function nextImg(){

  if(!tweening){
    tweening = true;
    $("#input1").attr("disabled",true);
  //
    createjs.Tween.get(images[currentImg]).to({x:-images[currentImg].getBounds().width, scaleX:0.25, scaleY:0.25}, 1000);

    var nextImg = Math.floor(visualize === 2 ? Math.random()*2*kana.length : visualize*kana.length+Math.random()*kana.length); 
    currentImg = currentImg === nextImg ? visualize === 2 ? (nextImg+1)%(kana.length*2) : visualize*kana.length+((nextImg+1)%kana.length) : nextImg;
    //console.log(currentImg);
    //currentImg = (currentImg+1)%(kana.length*2);

    images[currentImg].x = 375;
    images[currentImg].scaleX = 0.25;
    images[currentImg].scaleY = 0.25;
    stage.addChild(images[currentImg]);

    createjs.Tween.get(images[currentImg]).to({x:0, scaleX:0.75, scaleY:0.75}, 1000, createjs.Ease.linear).call(finishShift);

    stage.update();
  }
  /*stage.removeChildAt(0);
  stage.addChild(images[currentImg]);
  stage.update();*/

  //var target = new createjs.Bitmap(images[0]);
  //var target = document.getElementById("display"+(currentDisplay+1));
  //$("#display"+(currentDisplay+1));
  //target.height = 50;
  //createjs.Tween.get(target).to({alpha:"0"}, 1000);
  //$("#display"+(currentDisplay+1)).css("visibility","hidden");
}

function finishShift(){
  stage.removeChildAt(stage.children.length-2);
  stage.update();
  tweening = false;
  $("#input1").val("");
  $("#input1").attr("disabled",false);
  $("#input1").focus();
  console.log(stage.children.length);
}

function setLngVariables(){
  //document.getElementById("boton1").innerHTML
  $("#boton1").html(i18n.t("skip"));

  updateStreak(0);
  updateBest(0);

  $("#both").text(i18n.t("both"));
}

function inputChange(){
  if($("#input1").val().toLowerCase() === kana[currentImg%kana.length].name){
    nextImg();
    updateStreak(streak+1);
    if(streak > best){
      updateBest(streak);
    }
  }
}

function selectChange(){
  updateStreak(0);
  visualize = $("#select1")[0].selectedIndex;
  if(visualize !== 2){
    nextImg();
  }
}

function updateStreak(value){
  streak = value;
  streakText.text = i18n.t("streak")+": "+value;
  //stage.update();
}

function updateBest(value){
  best = value;
  bestText.text = i18n.t("best")+": "+value;
  //stage.update();
}