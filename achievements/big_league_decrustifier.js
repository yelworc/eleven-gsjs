var name		= "Big League Decrustifier";
var collection_type	= 0;
var is_secret		= 0;
var desc		= "Expertly scraped 503 stubborn Barnacles";
var status_text		= "No doubt you have other passions in life. Philanthropy. The opera. And so on. You just also happen to be a deft hand with a Barnacle Scraper, hence your newly earned title, Big League Decrustifier.";
var last_published	= 1348796800;
var is_shareworthy	= 1;
var url		= "big-league-decrustifier";
var category		= "harvesting";
var url_swf		= "\/c2.glitch.bz\/achievements\/2011-09-10\/big_league_decrustifier_1315685951.swf";
var url_img_180		= "\/c2.glitch.bz\/achievements\/2011-09-10\/big_league_decrustifier_1315685951_180.png";
var url_img_60		= "\/c2.glitch.bz\/achievements\/2011-09-10\/big_league_decrustifier_1315685951_60.png";
var url_img_40		= "\/c2.glitch.bz\/achievements\/2011-09-10\/big_league_decrustifier_1315685951_40.png";
function on_apply(pc){
	
}
var conditions = {
	503 : {
		type	: "counter",
		group	: "mortar_barnacle",
		label	: "scrape",
		value	: "503"
	},
};
function onComplete(pc){ // generated from rewards
	var multiplier = pc.buffs_has('gift_of_gab') ? 1.2 : pc.buffs_has('silvertongue') ? 1.05 : 1.0;
	multiplier += pc.imagination_get_achievement_modifier();
	if (/completist/i.exec(this.name)) { 
		 var level = pc.stats_get_level(); 
		 if (level > 4) {  
				multiplier *= (pc.stats_get_level()/4); 
		} 
	} 
	pc.stats_add_xp(round_to_5(600 * multiplier), true);
	pc.stats_add_favor_points("mab", round_to_5(100 * multiplier));
	if(pc.buffs_has('gift_of_gab')) {
		pc.buffs_remove('gift_of_gab');
	}
	else if(pc.buffs_has('silvertongue')) {
		pc.buffs_remove('silvertongue');
	}
}
var rewards	= {
	"xp"	: 600,
	"favor"	: {
		"giant"		: "mab",
		"points"	: 100
	}
};

//log.info("big_league_decrustifier.js LOADED");

// generated ok (NO DATE)
