function comparePairs(pair1, pair2){
	
	if (pair1.val < pair2.val){
		return -1;
	}
	if (pair1.val > pair2.val){
		return 1;
	}
	return 0;
}

function getGame1MeanTimeStats(stats, syllabaries, callback){

	var list = [];

	if(syllabaries.length > 0){
		var syllabary1 = syllabaries[0],
			syllabary2 = syllabaries[1],
			item,
			syllablesAdded = [];

		for(var syllable in stats[syllabary1]){
			item = {};

			if(stats[syllabary1][syllable].sumSuccess){
				if(syllabary2 && stats[syllabary2][syllable] && stats[syllabary2][syllable].sumSuccess){
					item['val'] = (stats[syllabary1][syllable].sumTime + stats[syllabary2][syllable].sumTime)/
				      	(stats[syllabary1][syllable].sumSuccess + stats[syllabary2][syllable].sumSuccess);
				}
				else{
					item['val'] = stats[syllabary1][syllable].sumTime/stats[syllabary1][syllable].sumSuccess;
				}
			}

			if(item['val']){
				syllablesAdded.push(syllable);

				item['syllable'] = syllable;
				list.push(item);
			}
		}

		if(syllabary2){
			for(var syllable in stats[syllabary2]){
				item = {};

				if(stats[syllabary2][syllable].sumSuccess && syllablesAdded.indexOf(syllable) < 0){
					item['val'] = stats[syllabary2][syllable].sumTime/stats[syllabary2][syllable].sumSuccess;
				
					syllablesAdded.push(syllable);

					item['syllable'] = syllable;
					list.push(item);
				}
			}
		}
	}

	list.sort(comparePairs);

	callback(list);
}

function getGame1SuccessRateStats(stats, syllabaries, callback){

	var list = [];

	if(syllabaries.length > 0){
		var syllabary1 = syllabaries[0],
			syllabary2 = syllabaries[1],
			item,
			syllablesAdded = [];

		for(var syllable in stats[syllabary1]){
			item = {};

			if(syllabary2 && stats[syllabary2][syllable]){
				item['val'] = (stats[syllabary1][syllable].sumSuccess + stats[syllabary2][syllable].sumSuccess)/
				      (stats[syllabary1][syllable].sumSuccess + stats[syllabary2][syllable].sumSuccess + 
				      	stats[syllabary1][syllable].sumSkip + stats[syllabary2][syllable].sumSkip);
			}
			else{
				item['val'] = stats[syllabary1][syllable].sumSuccess/(stats[syllabary1][syllable].sumSuccess + stats[syllabary1][syllable].sumSkip);
			}

			syllablesAdded.push(syllable);

			item['syllable'] = syllable;
			list.push(item);
		}

		if(syllabary2){
			for(var syllable in stats[syllabary2]){
				item = {};

				if(syllablesAdded.indexOf(syllable) < 0){
					item['val'] = stats[syllabary2][syllable].sumSuccess/(stats[syllabary2][syllable].sumSuccess + stats[syllabary2][syllable].sumSkip);
				
					syllablesAdded.push(syllable);

					item['syllable'] = syllable;
					list.push(item);
				}
			}
		}
	}

	list.sort(comparePairs);

	callback(list);
}

function getGame1SumStats(stats, statToSum, syllabaries, callback){

	var list = [];

	if(syllabaries.length > 0){
		var syllabary1 = syllabaries[0],
			syllabary2 = syllabaries[1],
			item,
			syllablesAdded = [];

		for(var syllable in stats[syllabary1]){
			item = {};

			if(syllabary2 && stats[syllabary2][syllable] && stats[syllabary2][syllable][statToSum]){
				item['val'] = stats[syllabary1][syllable][statToSum] + stats[syllabary2][syllable][statToSum];
			}
			else{
				if(stats[syllabary1][syllable][statToSum]){
					item['val'] = stats[syllabary1][syllable][statToSum];
				}
			}

			if(item['val']){
				syllablesAdded.push(syllable);

				item['syllable'] = syllable;
				list.push(item);
			}
		}

		if(syllabary2){
			for(var syllable in stats[syllabary2]){
				item = {};

				if(stats[syllabary2][syllable][statToSum] && syllablesAdded.indexOf(syllable) < 0){
					item['val'] = stats[syllabary2][syllable][statToSum];
				
					syllablesAdded.push(syllable);

					item['syllable'] = syllable;
					list.push(item);
				}
			}
		}
	}

	list.sort(comparePairs);

	callback(list);
}