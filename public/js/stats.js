
function Game1Stats(best, hiragana, katakana){

  if(best){
    this.best = best;
  }
  else{
    this.best = 0;
  }

  if(hiragana){
    this.hiragana = hiragana;
  }
  else{
    this.hiragana = {};
  }

  if(katakana){
    this.katakana = katakana;
  }
  else{
    this.katakana = {};
  }
 
  this.updateBest = updateBest;
  this.updateHiragana = updateHiragana;
  this.updateKatakana = updateKatakana;

  function updateBest (value){
    if(value !== undefined){
      this.best = value;
    }
  };

  function updateHiragana (id, time){
    if(id !== undefined){
      if(!this.hiragana[id]){
        this.hiragana[id] = {'sumTime':0, 'sumSuccess':0, 'sumSkip':0};
      }

      if(time){
        this.hiragana[id].sumTime += time;
        this.hiragana[id].sumSuccess += 1;
      }
      else{
        this.hiragana[id].sumSkip += 1;
      }
    }
  };

  function updateKatakana (id, time){
    if(id !== undefined){
      if(!this.katakana[id]){
        this.katakana[id] = {'sumTime':0, 'sumSuccess':0, 'sumSkip':0};
      }

      if(time){
        this.katakana[id].sumTime += time;
        this.katakana[id].sumSuccess += 1;
      }
      else{
        this.katakana[id].sumSkip += 1;
      }
    }
  };
  
}
