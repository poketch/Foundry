let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
let effect = actor.effects.filter(eff => eff.data.label === item.name)[0];

if (args[0].macroPass === "preItemRoll") {

    item.data.flags.loaded ??= true
    item.data.flags.properties ??= storeProperties(item.data.data.actionType, item.data.data.damage, item.data.data.range);

    if (item.data.flags.misfired !== null || item.data.flags.misfired !== undefined) {

        if (item.data.flags.misfired === "broken" && effect.data.disabled === true) {

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

    if (item.data.flags.loaded === true) {
        loadGun(item);
    }

    if (item.data.flags.loaded === false) {

        item.data.flags.properties = storeProperties(item.data.data.actionType, item.data.data.damage, item.data.data.range);
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

        item.data.flags.loaded = true;
        return;
    }
}

if (args[0].macroPass === "preambleComplete") {

    if (effect.data.disabled === false) {
        // Make all attacks at advantage
        effect.callMacro("never", workflow);
    }
}
if (args[0].macroPass === "preCheckHits") {

    // check for misfires

    const misfireThreshold = item.data.flags['midi-qol'].fumbleThreshold;
    const misFires = workflow.attackRoll.dice[0].results.map(obj => obj.result <= misfireThreshold);

    if (misFires.includes(true)) {
        // make attack automiss
        workflow.setAttackRoll(await new Roll('1').evaluate());


        if (effect.data.disabled === false) {

            // set flag to deactivate effect
            item.data.flags.misfired = "misfire";
        }

        if (effect.data.disabled === true) {

            // set flag to mark item as broken
            item.data.flags.misfired = "broken";
        }
    }
}
if (args[0].macroPass === "postAttackRoll") {


    if (item.data.flags.misfired === "misfire") {

        // change message to reflect misfire, will only work if a misfire actually happened
        let message = game.messages.filter(i => i.data.flags['midi-qol']?.workflowId === workflow.uuid).at(-1);
        message.data.content = message.data.content.replace("badly misses", "misfired against");

        item.data.flags.misfired = "okay";

        effectId = actor.effects.filter(eff => eff.data.label === item.name)[0].id;

        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: actor.uuid, updates: [{ "_id": effectId, "disabled": true }] });

    } else if (item.data.flags.misfired === "broken") {

        let message = game.messages.filter(i => i.data.flags['midi-qol']?.workflowId === workflow.uuid).at(-1);
        message.data.content = message.data.content.replace("badly misses", `breaks ${item.name} misfiring against`);
    }

    item.data.flags.loaded = false;
}

function storeProperties(actionType, damage, range) {

    itemProperties = {
        actionType: actionType,
        damage: damage,
        range: range,
    };

    return itemProperties;
}

function unloadGun(item) {

    setProperty(item.data.data, "actionType", "other");
    setProperty(item.data.data, "damage", {});
    setProperty(item.data.data, "range", {});
}

function loadGun(item) {

    setProperty(item.data.data, "actionType", item.data.flags.properties.actionType);
    setProperty(item.data.data, "damage", item.data.flags.properties.damage);
    setProperty(item.data.data, "range", item.data.flags.properties.range);
}