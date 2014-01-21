
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
    if(value){
      this.best = value;
    }
    return this.best;
  };

  function updateHiragana (romaji, time){
    if(romaji){
      if(!this.hiragana[romaji]){
        this.hiragana[romaji] = {'sumTime':0, 'sumSuccess':0, 'sumSkip':0};
      }

      if(time){
        this.hiragana[romaji].sumTime += time;
        this.hiragana[romaji].sumSuccess += 1;
      }
      else{
        this.hiragana[romaji].sumSkip += 1;
      }
    }
    return this.hiragana;
  };

  function updateKatakana (romaji, time){
    if(romaji){
      if(!this.katakana[romaji]){
        this.katakana[romaji] = {'sumTime':0, 'sumSuccess':0, 'sumSkip':0};
      }

      if(time){
        this.katakana[romaji].sumTime += time;
        this.katakana[romaji].sumSuccess += 1;
      }
      else{
        this.katakana[romaji].sumSkip += 1;
      }
    }
    return this.katakana;
  };
}
