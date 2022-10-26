Hooks.on("createChatMessage", main);

// Set to Perception, Insight, Investigation
const always_blind = ["prc", "ins", "inv"];

function main(args) {

    console.log("running blind rolls macro");
    let data = args;

    if (data.flags?.dnd5e?.roll?.type == null || data.flags?.dnd5e?.roll?.type == undefined) {
        return;
    }

    if (data.flags?.dnd5e?.roll?.skillId == null || data.flags?.dnd5e?.roll?.skillId == undefined) {
        return;
    }

    if (always_blind.includes(data.flags.dnd5e.roll.skillId)) {
        
        setProperty(data.rolls[0].options, "defaultRollMode", "blindroll");
        setProperty(data, "blind", true);
        setProperty(data, "whisper", game.users.filter(user => user.isGM).map(user => user.id));
    }
}