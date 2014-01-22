exports.mergeGame1Stats = function(stats1, stats2, callback){

	var newStats = {'best':0,'hiragana':{},'katakana':{}};

	newStats.best = stats1.best > stats2.best ? stats1.best : stats2.best;

	for(var syllabary in stats2){
		if(syllabary !== 'best'){
			for(var syllable in stats2[syllabary]){
				
				if(stats1[syllabary] && stats1[syllabary][syllable]){
					newStats[syllabary][syllable] = {'sumTime':stats1[syllabary][syllable].sumTime+stats2[syllabary][syllable].sumTime,
										'sumSuccess':stats1[syllabary][syllable].sumSuccess+stats2[syllabary][syllable].sumSuccess,
										'sumSkip':stats1[syllabary][syllable].sumSkip+stats2[syllabary][syllable].sumSkip
					};
				}
				else{
					newStats[syllabary][syllable] = stats2[syllabary][syllable];
				}
			}

			for(var syllable in stats1[syllabary]){
				
				if(stats2[syllabary] && !stats2[syllabary][syllable]){
					newStats[syllabary][syllable] = stats1[syllabary][syllable];
				}	
			}
		}
	}

	callback(null,newStats);
}
