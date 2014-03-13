#!usr/bin/perl

#use: perl csv2upsert.pl <db> <collection> <id_init> <csv_file_input> <file_output>
#perl csv2upsert.pl npl_jp syllables 0 japanese_sounds.csv upsertsFile

die "Wrong input\n" if $#ARGV < 4;
my $db = $ARGV[0];
my $collection = $ARGV[1];
my $id = $ARGV[2];
my $csvFile = $ARGV[3];
my $upsertsFile = $ARGV[4];

open(IN, "<$csvFile") or die "Could not open \"$csvFile\"";
open(OUT, ">$upsertsFile") or die "Could not open \"$upsertsFile\"";

my @content = [];
my $lines = 0;
print OUT "use $db\n\n";
while(<IN>){
	chomp;
	$content[$lines] = [split("\t")];
	$lines++;

}
close(IN);

my $command = "db.$collection.update(";
my $commandOptions = "},{upsert: true})\n\n";
my %usedRoute = {};

for (my $i = 0; $i < $lines; $i += 2){
	for (my $j = 1; $j < @{$content[$i]}-1; $j+=2){
		my $romaji = $content[$i][$j];
		my $special;
		my $obsolete;
		if (substr($romaji,-1) eq '*'){
			chop($romaji);
			$obsolete = 1;
		}
		my $hiragana = $content[$i+1][$j];
		my $katakana = $content[$i+1][$j+1];
		next if ($hiragana eq "" and $katakana eq "");
		my $column = $content[0][$j];
		my $modif = "";
		my @aux = split(/\./,$content[$i][0]);
		my $row = $aux[0];
		if (scalar(@aux) > 1){
			my $symb = chop($aux[1]);
			if($symb eq '-'){
				$modif = "dakuten";
			}elsif ($symb eq '+'){
				$modif = "handakuten";
			}elsif ($symb eq '*'){
				$column = "";
				$special = $aux[1];
			}
		}
		$usedRoute{$romaji}++;
		my $upsert = $command;
		$upsert .= "{id:$id},{";

		my @record;
		push @record, "id:$id";
		push @record, "romaji: \"$romaji\"" if $romaji;
		push @record, "hiragana: \"$hiragana\"" if $hiragana;
		push @record, "katakana: \"$katakana\"" if $katakana;
		push @record, "route: ".($romaji ? "\"$romaji-".$usedRoute{$romaji}."\"" : "\"".$special."\"");
		push @record, "row: \"$row\"" if $row;
		push @record, "column: \"$column\"" if $column;
		push @record, "youon: true" if ($column ~~ ['ya','yu','yo']);
		push @record, $modif.": \"".$aux[1]."\"" if $modif;
		push @record, "special: \"$special\"" if $special;
		push @record, "obsolete: true" if $obsolete;

		$id++;

		$upsert .= join(', ', @record);
		$upsert .= $commandOptions;
		print OUT $upsert;
	}
}


close(OUT);