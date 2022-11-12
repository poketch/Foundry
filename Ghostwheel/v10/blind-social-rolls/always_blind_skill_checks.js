Hooks.on("dnd5e.rollSkill", main);

// Set to Perception, Insight, Investigation
const always_blind = ["prc", "ins", "inv"];

function main(...args) {

    if (!always_blind.includes(args[2])) { return; }

    let roll = args[1];

    roll.options.defaultRollMode = "blindroll"
    roll.options.rollMode = "blindroll"
    roll.blind = true;
    roll.whisper = game.users.filter(user => user.isGM).map(user => user.id);
}