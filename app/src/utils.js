exports.checkGame1Stats = function(oldBest,stats,oldStreak,streak,callback){
	var bestIncr = stats.best-oldBest,
		totalSuccSkip = 0;

	if(bestIncr > 5){
		return callback(new Error('Best score increased too much'));
	}

	if(streak-oldStreak > 5){
		return callback(new Error('Streak increased too much'));
	}

	for(var syllabary in stats){
		if(syllabary !== 'best'){
			for(var syllable in stats[syllabary]){
				var syllableObject = stats[syllabary][syllable];

				if(syllableObject.sumSuccess === 0 && syllableObject.sumTime > 0){
					return callback(new Error('Didn\'t succeed, still took time'));
				}

				var timePerSyllable = syllableObject.sumTime / syllableObject.sumSuccess;
				if(syllableObject.sumSuccess > 0 && (timePerSyllable < 200 || timePerSyllable > 600000)){
					return callback(new Error('Time per syllable is too unrealistic'));
				}

				totalSuccSkip += syllableObject.sumSuccess + syllableObject.sumSkip;
				bestIncr -= syllableObject.sumSuccess;
			}
		}
	}

	if(totalSuccSkip > 5){
		return callback(new Error('Received more data than expected'));
	}

	if(bestIncr > 0){
		return callback(new Error('Best increase does not match number of correct syllables'));
	}

	callback(null);
}

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
