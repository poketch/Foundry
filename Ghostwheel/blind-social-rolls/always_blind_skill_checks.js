Hooks.on("createChatMessage", main);

// Set to Perception, Insight, Investigation
const always_blind = ["prc", "ins", "inv"];

function main(args) {

    console.log("running macro");
    let data = args;

    if (data.data.flags?.dnd5e?.roll?.type == null || data.data.flags?.dnd5e?.roll?.type == undefined) {
        return;
    }

    if (data.data.flags?.dnd5e?.roll?.skillId == null || data.data.flags?.dnd5e?.roll?.skillId == undefined) {
        return;
    }

    if (always_blind.includes(data.data.flags.dnd5e.roll.skillId)) {
        data._roll.options.defaultRollMode = "blindroll"
        data.data.blind = true;
        data.data.whisper = game.users.filter(user => user.isGM).map(user => user.id);
    }
}
