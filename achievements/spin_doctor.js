var name		= "Spin Doctor";
var collection_type	= 0;
var is_secret		= 0;
var desc		= "Spun 2051 fiber into 293 thread in one super long spin";
var status_text		= "What time is it? It's time to mark your graduation from run-of-the-mill spinner to Spin Doctor. Gratz!";
var last_published	= 1348802863;
var is_shareworthy	= 1;
var url		= "spin-doctor";
var category		= "industrial";
var url_swf		= "\/c2.glitch.bz\/achievements\/2012-07-03\/spin_doctor_1341345443.swf";
var url_img_180		= "\/c2.glitch.bz\/achievements\/2012-07-03\/spin_doctor_1341345443_180.png";
var url_img_60		= "\/c2.glitch.bz\/achievements\/2012-07-03\/spin_doctor_1341345443_60.png";
var url_img_40		= "\/c2.glitch.bz\/achievements\/2012-07-03\/spin_doctor_1341345443_40.png";
function on_apply(pc){
	
}
var conditions = {
	754 : {
		type	: "counter",
		group	: "spun",
		label	: "two_thousand_fiber",
		value	: "1"
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
	pc.stats_add_xp(round_to_5(500 * multiplier), true);
	pc.stats_add_favor_points("humbaba", round_to_5(75 * multiplier));
	if(pc.buffs_has('gift_of_gab')) {
		pc.buffs_remove('gift_of_gab');
	}
	else if(pc.buffs_has('silvertongue')) {
		pc.buffs_remove('silvertongue');
	}
}
var rewards	= {
	"xp"	: 500,
	"favor"	: {
		"giant"		: "humbaba",
		"points"	: 75
	}
};

//log.info("spin_doctor.js LOADED");

// generated ok (NO DATE)
