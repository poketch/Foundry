let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
let effect = actor.effects.filter(eff => eff.label === item.name)[0];

if (args[0].macroPass === "preItemRoll") {

    item.flags.loaded ??= true
    item.flags.properties ??= storeProperties(item.system.actionType, item.system.damage, item.system.range, item.system.consume);

    if (item.flags.misfired !== null || item.flags.misfired !== undefined) {

        if (item.flags.misfired === "broken" && effect.disabled === true) {

            unloadGun(item);

            ChatMessage.create({
                speaker: {
                    alias: actor.name
                },
                content: 
                `<p style="text-align:center;font-style:italic;font-size:16px">
                    ${actor.name}'s ${item.name} is completely destroyed and can't be fired again...
                </p>`
            });

            return;
        }

    }

    if (item.flags.loaded === true) {
        loadGun(item);
    }

    if (item.flags.loaded === false) {

        item.flags.properties = storeProperties(item.system.actionType, item.system.damage, item.system.range, item.system.consume);
        unloadGun(item);

        ChatMessage.create({
            speaker: {
                alias: actor.name
            },
            content: 
            `<p style="text-align: center;font-style:italic;font-size: 16px">
                ${actor.name} reloaded their ${item.name}
            </p>`
        });

        item.flags.loaded = true;
        return;
    }
}

if (args[0].macroPass === "preambleComplete") {

    if (effect.disabled === false) {
        // Make all attacks at advantage
        effect.callMacro("never", workflow);
    }
}
if (args[0].macroPass === "preCheckHits") {

    // check for misfires

    const misfireThreshold = item.flags['midi-qol'].fumbleThreshold;
    const roll = workflow.attackRoll;
    const misFires = roll.dice[0].results.map(obj => obj.result <= misfireThreshold);

    if (misFires.includes(true)) {

        if (effect.disabled === false) {
            
            // set flag to deactivate effect
            item.flags.misfired = "misfire";
        }
        
        if (effect.disabled === true) {
            
            // set flag to mark item as broken
            item.flags.misfired = "broken";
        }
        
        // make attack automiss
        workflow.setAttackRoll(await new Roll('1').evaluate());
        setProperty(workflow, "isFumble", true);
        setProperty(workflow, "attackRollHTML", await MidiQOL.midiRenderRoll(roll));
    }
}
if (args[0].macroPass === "postAttackRoll") {

    if (item.flags.misfired === "misfire") {

        // change message to reflect misfire, will only work if a misfire actually happened
        let message = game.messages.filter(i => i.flags['midi-qol']?.workflowId === workflow.uuid).at(-1);
        message.content = message.content.replace("badly misses", "misfired against");

        item.flags.misfired = "okay";

        effectId = effect.id;

        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: actor.uuid, updates: [{ "_id": effectId, "disabled": true }] });

    } else if (item.flags.misfired === "broken") {

        let message = game.messages.filter(i => i.flags['midi-qol']?.workflowId === workflow.uuid).at(-1);
        message.content = message.content.replace("badly misses", `breaks ${item.name} misfiring against`);
    }

    item.flags.loaded = false;
}

function storeProperties(actionType, damage, range, ammunition) {

    itemProperties = {
        actionType: actionType,
        damage: damage,
        range: range,
        ammunition: ammunition,
    };

    return itemProperties;
}

function unloadGun(item) {

    setProperty(item.system, "actionType", "other");
    setProperty(item.system, "damage", {});
    setProperty(item.system, "range", {});
    setProperty(item.system, "consume", {});
}

function loadGun(item) {

    setProperty(item.system, "actionType", item.flags.properties.actionType);
    setProperty(item.system, "damage", item.flags.properties.damage);
    setProperty(item.system, "range", item.flags.properties.range);
    setProperty(item.system, "consume", item.flags.properties.ammunition);
}