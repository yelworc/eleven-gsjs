//#include include/mining.js, include/npc_conversation.js, include/cultivation.js

var label = "Metal Rock";
var version = "1346795313";
var name_single = "Metal Rock";
var name_plural = "Metal Rock";
var article = "a";
var description = "A stupefying combination of classic rock and the power of metal. Most often found in rocky areas, these heavyweights are indispensable in the production of ingots and the metallurgic arts.";
var is_hidden = false;
var has_info = true;
var has_infopage = false;
var proxy_item = "rock_metal_1";
var is_routable = false;
var adjusted_scale = 1;
var stackmax = 1;
var base_cost = 0;
var input_for = [];
var parent_classes = ["rock_metal_3", "rock_metal", "mineable_rock"];
var has_instance_props = true;

var classProps = {
	"rock_type"	: "metal_rock",	// defined by mineable_rock (overridden by rock_metal_3)
	"pc_action_distance"	: "75"	// defined by mineable_rock
};

function initInstanceProps(){
	this.instanceProps = {};
	this.instanceProps.chunks_remaining = "50";	// defined by mineable_rock
	this.instanceProps.cultivation_max_wear = "40";	// defined by mineable_rock
	this.instanceProps.cultivation_wear = "";	// defined by mineable_rock
}

var instancePropsDef = {
	chunks_remaining : ["How many chunks remain in this rock"],
	cultivation_max_wear : ["Max wear"],
	cultivation_wear : ["Current wear"],
};

var instancePropsChoices = {
	chunks_remaining : [""],
	cultivation_max_wear : [""],
	cultivation_wear : [""],
};

var verbs = {};

verbs.remove = { // defined by mineable_rock
	"name"				: "remove",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 50,
	"tooltip"			: "",
	"is_drop_target"		: true,
	"drop_many"			: false,
	"drop_tip"			: "Pour {$stack_name} on {$item_name}",
	"drop_ok_code"			: function(stack, pc){

		return this.proto_class && stack.class_tsid == 'wine_of_the_dead';
	},
	"conditions"			: function(pc, drop_stack){

		if (this.container.pols_is_pol() && !this.container.pols_is_owner(pc)) return {state:null};
		if (this.proto_class && drop_stack && drop_stack.class_tsid == 'wine_of_the_dead') return {state:'enabled'};
		return {state:null};
	},
	"handler"			: function(pc, msg, suppress_activity){

		var it = pc.getAllContents()[msg.target_itemstack_tsid];
		if (!it) return false;

		msg.target = this;
		return it.verbs['pour'].handler.call(it, pc, msg);
	}
};

verbs.talk_to = { // defined by mineable_rock
	"name"				: "talk to",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 51,
	"tooltip"			: "I have something to tell you!",
	"is_drop_target"		: false,
	"conditions"			: function(pc, drop_stack){

		var convos = pc.conversations_offered_for_class(this.class_tsid);
		if (convos.length) return {state:'enabled'};

		return {state:null};
	},
	"handler"			: function(pc, msg, suppress_activity){

		var failed = 1;
		var orig_count = this.count;
		var self_msgs = [];
		var self_effects = [];
		var they_effects = [];

		var convos = pc.conversations_offered_for_class(this.class_tsid);
		for (var i=0; i<convos.length; i++){
			var conversation_runner = "conversation_run_"+convos[i];
			if (this[conversation_runner]){
				failed = 0;
				this[conversation_runner](pc, msg);
				break;
			}
		}

		var pre_msg = this.buildVerbMessage(msg.count, 'talk to', 'talked to', failed, self_msgs, self_effects, they_effects);
		if (!suppress_activity && pre_msg) pc.sendActivity(pre_msg);

		return failed ? false : true;
	}
};

verbs.regenerate = { // defined by mineable_rock
	"name"				: "regenerate",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_single"			: 1,
	"is_default"			: true,
	"is_emote"			: false,
	"sort_on"			: 52,
	"tooltip"			: "Regenerate this rock",
	"is_drop_target"		: true,
	"drop_many"			: false,
	"drop_tip"			: "",
	"drop_ok_code"			: function(stack, pc){

		return stack.class_tsid == 'potion_rocky_regeneration_solution' ? true : false;
	},
	"conditions"			: function(pc, drop_stack){

		function has_potion(it){ return it.class_tsid == 'potion_rocky_regeneration_solution' ? true : false; }
		var potion = pc.findFirst(has_potion);
		if (potion) {
			if (this.getInstanceProp('chunks_remaining') >= 50) return {state:'disabled', reason:'This rock is not worn down enough to need regeneration.'}
			
			return {state:'enabled'};
		}

		return {state:null};
	},
	"handler"			: function(pc, msg, suppress_activity){

		function is_potion(it){ return it.class_tsid == 'potion_rocky_regeneration_solution' ? true : false; }
		var potion = pc.findFirst(is_potion);

		if (!potion){
			return false;
		}

		msg.target = this;

		return potion.verbs['pour'].handler.call(potion, pc, msg);
	}
};

verbs.mine = { // defined by mineable_rock
	"name"				: "mine",
	"ok_states"			: ["in_location"],
	"requires_target_pc"		: false,
	"requires_target_item"		: false,
	"include_target_items_from_location"		: false,
	"is_default"			: false,
	"is_emote"			: false,
	"sort_on"			: 53,
	"tooltip"			: "Or, drag pick to rock. Costs $energy_cost energy and takes $seconds seconds",
	"is_drop_target"		: true,
	"drop_many"			: false,
	"drop_tip"			: "Mine this {$item_name}",
	"drop_ok_code"			: function(stack, pc){

		if (this.getClassProp('rock_type') == 'metal_rock'){
			return stack.class_tsid == 'fancy_pick' && stack.isWorking() ? true : false;
		}
		else{
			return stack.is_pick && stack.isWorking() ? true : false;
		}
	},
	"proximity_override"			: 150,
	"conditions"			: function(pc, drop_stack){

		var required_skill = 'mining_1';
		if (!pc.skills_has(required_skill)){
			return {state:'disabled', reason:"You need to know "+pc.skills_get_name(required_skill)+" to use this."};
		}

		if (this.getClassProp('rock_type') == 'metal_rock'){
			function is_pick(it){ return it.is_pick && it.isWorking() && it.class_tsid == 'fancy_pick' ? true : false; }
			if (!pc.items_has(is_pick, 1)){
				return {state: 'disabled', reason: "You'll need a Fancy Pick first."};
			}
		}
		else{
			function is_pick(it){ return it.is_pick && it.isWorking() ? true : false; }
			if (!pc.items_has(is_pick, 1)){
				return {state: 'disabled', reason: "You'll need a pick first."};
			}
		}

		return {state:'enabled'};
	},
	"effects"			: function(pc){

		// this assumes we'll use the best pick we have...
		function is_pick(it){ return it.class_tsid =='fancy_pick' && it.isWorking() ? true : false; }
		var pick = pc.findFirst(is_pick);
		if (!pick){
			function is_pick(it){ return it.class_tsid =='pick' && it.isWorking() ? true : false; }
			pick = pc.findFirst(is_pick);
		}

		if (pick.class_tsid == 'fancy_pick'){
			return pc.trySkillPackage('mining_fancypick');
		}else{
			return pc.trySkillPackage('mining');
		}
	},
	"handler"			: function(pc, msg, suppress_activity){

		var required_skill = 'mining_1';
		if (!pc.skills_has(required_skill)){
			return false;
		}

		if (this.getClassProp('rock_type') == 'metal_rock' && msg.force_pick){
			pc.sendActivity("This humdrum, everyday pick is far too brittle to mine a metal rock!");
			return true;
		}

		if (msg.target_item_class || msg.target_itemstack_tsid){
			return this.startMining(pc, msg);
		}
		else{
			function is_pick(it){ return it.class_tsid =='fancy_pick' && it.isWorking() ? true : false; }
			var pick = pc.findFirst(is_pick);
			if (!pick || msg.force_pick){
				function is_pick(it){ return it.class_tsid =='pick' && it.isWorking() ? true : false; }
				pick = pc.findFirst(is_pick);
				if (!pick){
					return false;
				}
			}

			return this.startMining(pc, pick.class_tsid);
		}
	}
};

function make_config(){ // defined by mineable_rock
	var ret = {};
	ret = this.buildConfig(ret);
	return ret;
}

function onCreate(){ // defined by mineable_rock
	this.initInstanceProps();
	this.state = 1;

	this.apiSetPlayersCollisions(true);
	this.apiSetHitBox(400, 400);
}

function onLoad(){ // defined by mineable_rock
	if (!this.hitBox){
		this.apiSetPlayersCollisions(true);
		this.apiSetHitBox(400, 400);
	}

	if (this.label != this.name_single) this.label = this.name_single;
}

function onPlayerCollision(pc){ // defined by mineable_rock
	if (!this.isUseable()) return;

	if (this.conversations){
		for (var i=0; i<conversations.length; i++){
			if (pc.conversations_offer(this, conversations[i])){
				return pc.conversations_offer_bubble(this);
			}
		}
	}
}

function onPlayerExit(pc){ // defined by mineable_rock
	if(!this.helpers) {
		return;
	}

	if(this.helpers[pc.tsid]) {
		this.removeMiner(pc);
	}

	if(pc['!mining']) {
		delete pc['!mining'];
	}
}

function onPrototypeChanged(){ // defined by mineable_rock
	this.onLoad();
}

function conversation_canoffer_metal_lives_forever_1(pc){ // defined by conversation auto-builder for "metal_lives_forever_1"
	var chain = null;
	if (!pc.conversations_can_do_chain(chain)) return false;

	if (pc.conversations_has_completed(null, "genesis_of_a_rock_4")){
		return true;
	}
	return false;
}

function conversation_run_metal_lives_forever_1(pc, msg, replay){ // defined by conversation auto-builder for "metal_lives_forever_1"
	if (!msg.count) msg.count = 1;
	var self_effects = [];
	var conversation_id = "metal_lives_forever_1";
	var conversation_title = "Metal Lives Forever";
	var chain = null;
	var choices = {};

	choices['0'] = {};
	choices['1'] = {};
	choices['2'] = {};
	choices['3'] = {};
	choices['4'] = {};
	choices['5'] = {};
	choices['6'] = {};
	choices['7'] = {};
	choices['8'] = {};
	if (!msg.choice){
		choices['0']['metal_lives_forever_1-0-2'] = {txt: "No.", value: 'metal_lives_forever_1-0-2'};
		this.conversation_start(pc, "Metal, Man? Metal never goes out of fashion?", choices['0'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_1', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_1-0-2"){
		choices['1']['metal_lives_forever_1-1-2'] = {txt: "Wind? ", value: 'metal_lives_forever_1-1-2'};
		this.conversation_reply(pc, msg, "No, and trust me, man, I’ve been here through all the ages, through ice, fire, floods and the other stuff.", choices['1'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_1', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_1-1-2"){
		choices['2']['metal_lives_forever_1-2-2'] = {txt: "Fair enough.", value: 'metal_lives_forever_1-2-2'};
		this.conversation_reply(pc, msg, "No. The other stuff. The stuff that isn’t ice, fire, floods, wind or critters. It’s ‘messy’. I don’t want to talk about it.", choices['2'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_1', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_1-2-2"){
		choices['3']['metal_lives_forever_1-3-2'] = {txt: "Hm.", value: 'metal_lives_forever_1-3-2'};
		this.conversation_reply(pc, msg, "Regardless. I’ve lived through it all. An infinite number of eras - no matter what anyone tells you, they’ve not been around as long as I have.", choices['3'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_1', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_1-3-2"){
		choices['4']['metal_lives_forever_1-4-2'] = {txt: "Really?", value: 'metal_lives_forever_1-4-2'};
		this.conversation_reply(pc, msg, "And I know what I know. The acquisition of knowledge is a valuable thing. And what I know is this: you’ve got to hold on to what you’ve got.", choices['4'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_1', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_1-4-2"){
		choices['5']['metal_lives_forever_1-5-2'] = {txt: "Wait, what?", value: 'metal_lives_forever_1-5-2'};
		this.conversation_reply(pc, msg, "It doesn’t make a difference if you make it or not.", choices['5'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_1', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_1-5-2"){
		choices['6']['metal_lives_forever_1-6-2'] = {txt: "Ahhhh.", value: 'metal_lives_forever_1-6-2'};
		this.conversation_reply(pc, msg, "As long as you know what you know, I mean.", choices['6'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_1', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_1-6-2"){
		choices['7']['metal_lives_forever_1-7-2'] = {txt: "Yes.", value: 'metal_lives_forever_1-7-2'};
		this.conversation_reply(pc, msg, "Just give it a shot. And rock on, man. Rock on.", choices['7'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_1', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_1-7-2"){
		pc.conversations_complete(this.class_tsid, conversation_id, chain);
		this.conversation_end(pc, msg);
		pc.conversations_clear_current_state();
	}

}

function conversation_canoffer_metal_lives_forever_2(pc){ // defined by conversation auto-builder for "metal_lives_forever_2"
	var chain = null;
	if (!pc.conversations_can_do_chain(chain)) return false;

	if (pc.conversations_has_completed(null, "metal_lives_forever_1")){
		return true;
	}
	return false;
}

function conversation_run_metal_lives_forever_2(pc, msg, replay){ // defined by conversation auto-builder for "metal_lives_forever_2"
	if (!msg.count) msg.count = 1;
	var self_effects = [];
	var conversation_id = "metal_lives_forever_2";
	var conversation_title = "Metal Lives Forever";
	var chain = null;
	var choices = {};

	choices['0'] = {};
	choices['1'] = {};
	choices['2'] = {};
	choices['3'] = {};
	choices['4'] = {};
	choices['5'] = {};
	choices['6'] = {};
	choices['7'] = {};
	choices['8'] = {};
	choices['9'] = {};
	choices['10'] = {};
	if (!msg.choice){
		choices['0']['metal_lives_forever_2-0-2'] = {txt: "Hmn?", value: 'metal_lives_forever_2-0-2'};
		this.conversation_start(pc, "Are you a betting Glitch?", choices['0'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-0-2"){
		choices['1']['metal_lives_forever_2-1-2'] = {txt: "Well, I…", value: 'metal_lives_forever_2-1-2'};
		this.conversation_reply(pc, msg, "Do you bet?", choices['1'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-1-2"){
		choices['2']['metal_lives_forever_2-2-2'] = {txt: "Oh.", value: 'metal_lives_forever_2-2-2'};
		this.conversation_reply(pc, msg, "I mean, basically, man: if you like to gamble, I tell you, I’m your rock.", choices['2'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-2-2"){
		choices['3']['metal_lives_forever_2-3-2'] = {txt: "The rook?", value: 'metal_lives_forever_2-3-2'};
		this.conversation_reply(pc, msg, "I tell you, there was this time I took a bet with a Dullite friend of mine that we’d seen the very last of the rook.", choices['3'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-3-2"){
		choices['4']['metal_lives_forever_2-4-2'] = {txt: "And?", value: 'metal_lives_forever_2-4-2'};
		this.conversation_reply(pc, msg, "This was, bear in mind, a thousand eons ago, and we weren’t even young rocks then. Dullite said the rook would be back, and I? I said no.", choices['4'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-4-2"){
		choices['5']['metal_lives_forever_2-5-2'] = {txt: "Still?", value: 'metal_lives_forever_2-5-2'};
		this.conversation_reply(pc, msg, "You win some, lose some… Still.", choices['5'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-5-2"){
		choices['6']['metal_lives_forever_2-6-2'] = {txt: "Really though?!", value: 'metal_lives_forever_2-6-2'};
		this.conversation_reply(pc, msg, "If I was a betting rock - and I am - I’m still willing to take the bet that every time we see that winged chaos-bringer will be the last time.", choices['6'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-6-2"){
		choices['7']['metal_lives_forever_2-7-2'] = {txt: "… You’re not going to live forever?", value: 'metal_lives_forever_2-7-2'};
		this.conversation_reply(pc, msg, "I know. I’m born to lose, gambling’s for fools, but that’s the way I like it, baby.", choices['7'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-7-2"){
		choices['8']['metal_lives_forever_2-8-2'] = {txt: "No?", value: 'metal_lives_forever_2-8-2'};
		this.conversation_reply(pc, msg, "Well, no, of course I’m going to live forever, I’m made of metal, and you know the best thing about metal, baby?", choices['8'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-8-2"){
		choices['9']['metal_lives_forever_2-9-2'] = {txt: "Rock on!", value: 'metal_lives_forever_2-9-2'};
		this.conversation_reply(pc, msg, "METAL LIVES FOREVER.", choices['9'], null, null, null, {title: conversation_title});
		pc.conversations_set_current_state(this.tsid, 'metal_lives_forever_2', msg.choice);
	}

	if (msg.choice == "metal_lives_forever_2-9-2"){
		pc.conversations_complete(this.class_tsid, conversation_id, chain);
		this.conversation_end(pc, msg);
		pc.conversations_clear_current_state();
	}

}

var conversations = [
	"metal_lives_forever_1",
	"metal_lives_forever_2",
];

function getDescExtras(pc){
	var out = [];
	if (pc && (!pc.checkItemsInBag("fancy_pick", 1))) out.push([1, "Metal Rocks can only be mined with a <a href=\"\/items\/425\/\" glitch=\"item|fancy_pick\">Fancy Pick.<\/a>"]);
	out.push([2, "Mining this yields <a href=\"\/items\/615\/\" glitch=\"item|metal_rock\">Chunks of Metal Rock<\/a>."]);
	return out;
}

var tags = [
	"mineable",
	"no_trade",
	"mining"
];

var responses = {
	"gem_drop_amber": [
		"Here - small, garish, and has a dead bug in, yet still oddly pleasing.",
		"What do you mean ONLY amber?! It's still a gem, chum",
	],
	"gem_drop_diamond": [
		"Woah! Best friend this bulky are many carats. Also: many currants.",
		"OH! The glory of super-compressed coal!",
	],
	"gem_drop_moonstone": [
		"Oh my! It is like you've pulled a moon from the sky. So... glowy!",
		"Take! Display it, love it... Or sell it… whatever, I'm easy",
	],
	"gem_drop_ruby": [
		"Ah! A rich, blood-hued, passionate stone. If on the small side.",
		"Better than pearl? Maybe. Worth its weight in currants? Yes.",
	],
	"gem_drop_sapphire": [
		"Want this? A little blingy for my taste, but if you like showing off...",
		"Feel blue? Well, I'm not feeling it at all, so you take it",
	],
	"metal_rock_disappeared": [
		"The spirit of metal be with you, man. ROCK ON.",
		"Goodnight Cleveland!",
		"Fade to Black, man. Fade to black.",
		"Long live METAL!",
		"MELTDOWN!",
	],
	"mine_beryl": [
		"Hey! To the left a little next time.",
		"Ughh, you're so frikkin' picky.",
		"I wasn't cut out for this.",
		"Not in the face! Oh. Wait. No face.",
		"If you need any tips on technique, just axe.",
		"Pick on someone else, will you?",
		"You're on rocky ground, Glitch.",
		"I feel like you're taking me for granite.",
		"Well, at least that's a weight off me mined.",
		"You sure have one big axe to grind.",
	],
	"mine_dullite": [
		"Ooof. I feel lighter already.",
		"Mmm, thanks, I've been itching there all day.",
		"Ow. Ow-hangover. Ow-my-head. Ow.",
		"Not bad. Work on your backswing.",
		"You're really picking this up.",
		"Nothing wrong with a sedimentary lifestyle, chum.",
		"I should have been a wrestler. I'm rock-hard! Hee!",
		"Ah. You've taken a lode of my mind.",
		"You sure have an apatite for this.",
		"Woah. I'm tuff. But you're tuffer.",
	],
	"mine_max_beryl": [
		"I'm way too gneiss to you.",
		"*sigh* You're just going to pick up and leave me anyway.",
		"Stone me, you're persistent.",
		"Well, you just keep on rocking, doncha?",
		"Fine, get your rocks off. Then leave me in peace.",
	],
	"mine_max_dullite": [
		"Igneous is bliss. Ta-da!",
		"May I just say: you're rocking this.",
		"Well THAT's taken a weight off my mind.",
		"Stand back: admire my chiseled good looks.",
		"Hey! Pick like that, I'll be nothin' but gravel soon!",
	],
	"mine_max_metal_rock": [
		"Gotta whole lotta METAL!",
		"That pick goes all the way up to eleven, man.",
		"Nice work! Countdown to pick-axtinction! YEAH!",
		"You’re Zincing BIG! WOO!",
		"How much more metal could this be? None. None more metal.",
	],
	"mine_max_sparkly": [
		"Super chunks of sparkly joy! WHEEE!",
		"Are you trying to pick me up?",
		"Pretty sparkles! Oh yes: I'm no common ore.",
		"When I see you, sparkles fly!",
		"Sure, I'm no gem, but there's more of me to love!",
	],
	"mine_metal_rock": [
		"Slave to the GRIND, kid! ROCK ON!",
		"I’d feel worse if I wasn’t under such heavy sedation.",
		"Sweet! Air pickaxe solo! C'MON!",
		"Yeah. Appetite for destruction, man. I feel ya.",
		"LET THERE BE ROCK!",
		"Those who seek true metal, we salute you!",
		"YEAH, man! You SHOOK me!",
		"All hail the mighty metal power of the axe!",
		"Metal, man! METAL!",
		"Wield that axe like a metal-lover, man!",
	],
	"mine_sparkly": [
		"Here! What's mined is yours!",
		"Pick me! Pick me!",
		"I sparkle! You sparkle! Sparkles!",
		"Oooh, you're cute. You into carbon-dating?",
		"Oh yeah! Who's your magma?!?",
		"Yay! You picked me!",
		"Hey, cutestuff! You make me sliver.",
		"You crack me up, Glitchy!",
		"Yay! Everything should sparkle! Except maybe vampires.",
		"Together, we'll make the world sparkly, Glitchy",
	],
	"rock_disappeared": [
		"Oof, where'd I go?",
		"brb",
		"kbye",
		"A la peanut butter sammiches",
		"Alakazam!",
		"*poof*",
		"I'm all mined out!",
		"Gone to the rock quarry in the sky",
		"Yes. You hit rock bottom",
		"All rocked out for now",
	],
};

// this is a temporary fix, while the client doesn't load item defs
// from the XML files. we pass this data on login events.

function getAssetInfo(){
	return {
		'position': {"x":-92,"y":-92,"w":184,"h":92},
		'thumb': "iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM\/rhtAAAHGklEQVR42u1Va0yTVxjeD\/9syWSL\nWZYtW5hm0egSyESdirSg2FIoFJDLKGjLrR0tUEVuWqCVKHIpIHeUcRNQrFABC3KvclWH4HDMLdsy\nd02WbHPJ9mP\/np33jHZgWLLbj\/3om7z5zjnf+c77nOd93vd76imnOc1pTnOa0\/53BvzoOjs1oGhr\nrTMs3LtluNxRZwgJ8f1co5EbVKoIg1od6f6fBgwP93WRSg\/o8vLSZX2WS8LxYYtwZmJYuDg\/IxwZ\ntMhGRswudmC\/\/vJt+ScfzWPC1o+bY1ZYultw7KgK46NWmDtbEC0PhkIRjEOHRM3\/GtjtGZtOr9c1\nq1XRqCg\/wwI0wjbai5mpYczPTeL2zDhsY32w9l5CY0OVjeaff7rI18mbG2vQb+1yzKcnhtDWWou6\nmmJcbK6GpavVVl1tcv3bwObmRlxuT481V5SfhTwqBFFRMvR0t3JWZqZGHAFpTEEJZLe5la99\/91n\nHOQnHy+grPQ0qiqLUFdbivaL51FqMqK9rRL5xkx0Xmrg3netHakpynKW9nIvrx2yvwRudnpsgYJZ\n+8wcRP6pTNyZHcV7d25yEO8vzPD12elRPh8Z6kVNVRHGRnrQ19OBgjM5MOal43ytib\/vvNzEzurE\n8JAFS4uzuM726E\/qcORwKDLSVRAKdyI83A8ikSdKinJtUqnozzV6c6z\/mp0h8n5rJ4KCRLhyqZGl\n8jIWFyY5O\/Tu1riVp7zH0o6kJCVWfrfSieXpyWF89OEclh7cQffVVv6tpbsd8XFyhB0KgEQiQMOF\ncrwdGYrAQL+19Tk\/P+Y6PXkD33z1EF8+WsLXXyyhtaUWQYFiqBNj8O75c9ytvZ08KAHrutKE+toy\nXgRrgSOW6Yz6OhOu93YwHTehpamKv7vR382flJkB6xWWahWBg1TqZ1sTIANnsI1RukqYNjowcdOK\n1uYa5OjTERLiB2\/vXVAqwpGrT8O5stMoLMjBxZZqPPzgrgPQ1MQwBge6uJs7GyCXB7GgPvD3F+Id\ndTRSUpRQq4449hO4+\/cmoVbHcnB2X0N7ZhetRvm4qaECxYVGVJQVYOhGF2esvqYEer0WSmUo9u3z\nQGlJPqvGenZrM75iTK9kbOrWIC8m8ox0NQIChPDz8+KM35mlCwxy8PScn7uFjrYLTH+yVeBkMj92\nIf\/V1b1p0yaXMlM+kjWxqKs2MYGXMa20cICVrJo9PT2QmBANiZ+Qr9VUFrP+psHZM7l49NkiZ4J0\nNTrU7fDbM0M8nSnaODy4Pw3L1YvIzjoKTVIcTmQf437KmM0KJg2JiQoOjvSu0cQwl+tWAbx7d1zY\n9G4lqyIj00ICsjKTcTztHTQ1lOPkiRQwdnm6yxh7acfUqK0q5kBzc9Ix2G\/GTz884rolf7h0F1ev\ntHBp6FLjUHA6h7WZelzuaICpOB+ZGakw5GWy87U8U2Wm0yz9sUx7Ivj67oWHxzZs2fLaqpbz9MCA\nWUgp62XCJxCmYiNvzsnaWMacHFXnCkEXIFDVrLdlZmgcTFIAekcXILHT3uxMHY7qkhAZKUN1VSHX\nc4+ljX9D+wlYfFwMu3iCg02jMQ0REf4IDRXDx2fXgh3cBubrtNp4RWxsBAMTww5P5Temw+jGVHk0\nJgD2SpZIhHxO+yigfZ3m9v0kFWL47Bk9QoLF\/GL2M2mdWCP9EVBiU6V6m4ET8bO3b9+6yHBtJoDr\nCKRI5NWsS1Vz+u03ymIsxMRE8EDEkB00BfLY\/gYf0zrp1Q7wSaeCIz95QueQBemOzpdIfFhz9uba\nI5CU3j173PHmm1t\/fvbZZ+IYrj12FtdlZaW5n8g6ukCUk5NwS4pOsXZSwAFwfbJAhQV5rDiSWKuI\nQW11MWfRDpB+Z3b27MWlUim4BmkeHiZFYnw0dDoVA5zK2WK\/OA7Q23sP7xAbN77c89xz61MYJinz\nV1bqcIObm9sWxtg1uTyMHZDGD228UIELdb8DNBqyeDMlRnJzUxnIww5dkhaJGRoToLjYaP5X0J88\nztfoDPou\/XgyxGIh+73t4sWg1UbDy2sn3nrLDW5um0eWgUmXpbfKKNUbmb8okRwIo24eGCh+TLdL\nTDjC0lzC+loKZ\/BUXga2bduEhHg5LwoCSYVBRUF6JIB0EZnMn1crfUPvKI1KRRRLpQDx8WGspeyH\nQLAD7u6bOdgXXng+m8XfsRa4J209VTYN9u7dKfD03B0qEHgGMdAGhSLqcfpxFSIjpCgvNXA9EnvJ\n2gQueBI7SeTw4UgOkFj8oxGLWSs5yJ6+2L9\/Nwe1detGuLq+lMNCiZl72Qvj79q65Vu96Ovr68J6\nlC4wUHRNnai0hYUFPA4ODrAReHKx+EARk4ljfPCgz+JKFwh2L77++qvMX5ldoTXpMnP\/ua1fPpiq\nbdvyfJWun9hDvn8FKGLN\/a+k1GlOc5rTnOa0f2a\/ATuPzTGvu5bJAAAAAElFTkSuQmCC",
	};
};

var itemDef = {
	label		: this.label,
	name_plural	: this.name_plural,
	stackmax	: this.stackmax,
	is_hidden	: this.is_hidden,
	has_info	: this.has_info,
	adjusted_scale	: this.adjusted_scale,
	asset_swf_v	: "\/c2.glitch.bz\/items\/2012-08\/rock_metal_3-1345763572.swf",
	admin_props	: true,
	obey_physics	: false,
	in_background	: true,
	in_foreground	: false,
	has_status	: false,
	not_selectable	: false,
};

if (this.consumable_label_single) itemDef.consumable_label_single = this.consumable_label_single;
if (this.consumable_label_plural) itemDef.consumable_label_plural = this.consumable_label_plural;

itemDef.verbs = {
};
itemDef.hasConditionalVerbs = 1;
itemDef.emote_verbs = {
};
itemDef.hasConditionalEmoteVerbs = 0;
itemDef.tags = [
	"mineable",
	"no_trade",
	"mining"
];
itemDef.keys_in_location = {
	"n"	: "mine",
	"e"	: "regenerate",
	"o"	: "remove",
	"t"	: "talk_to"
};
itemDef.keys_in_pack = {};

log.info("rock_metal_3.js LOADED");

// generated ok 2012-09-04 14:48:33 by mygrant
