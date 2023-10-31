let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
let effect = actor.effects.filter(eff => eff.label === item.name)[0];

if (args[0].macroPass === "preItemRoll") {

    item.setFlag("world", "gw.loaded", true);
    item.setFlag("world", "gw.properties", storeProperties(item.system.actionType, item.system.damage, item.system.range, item.system.consume));


    if (item.getFlag("world", "gw.misfired") !== null || item.getFlag("world", "gw.misfired") !== undefined) {

        if (item.getFlag("world", "gw.misfired") === "broken" && effect.disabled === true) {
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

    if (item.getFlag("world", "gw.loaded") === true) {
        loadGun(item);
    }

    if (item.getFlag("world", "gw.loaded") === false) {

        item.setFlag("world", "gw.properties", storeProperties(item.system.actionType, item.system.damage, item.system.range, item.system.consume));
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

        item.setFlag("world", "gw.loaded", true);
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

    let misfireThreshold = item.flags['midi-qol'].fumbleThreshold;

    for (const effect of [...actor.effects]) {

        if (effect.flags.babonus === undefined || effect.flags.babonus === null) continue;

        for (const [_, bonus] of Object.entries(effect.flags.babonus.bonuses)) {

            if (bonus.bonuses.fumbleRange === null || bonus.bonuses.fumbleRange === undefined) continue;

            misfireThreshold += parseInt(bonus.bonuses.fumbleRange);
        }

    }

    const ammo = await fromUuid(`${actor.uuid}.Item.${item.system.consume.target}`)
    if (ammo.flags['midi-qol'].fumbleThreshold !== null || ammo.flags['midi-qol'].fumbleThreshold !== undefined) {
        misfireThreshold += ammo.flags['midi-qol'].fumbleThreshold;
    }

    const roll = workflow.attackRoll;
    const misFires = roll.dice[0].results.map(obj => obj.result <= misfireThreshold);

    if (misFires.includes(true)) {

        if (effect.disabled === false) {

            // set flag to deactivate effect
            item.setFlag("world", "gw.misfired", "misfire");
        }

        if (effect.disabled === true) {

            // set flag to mark item as broken
            item.setFlag("world", "gw.misfired", "broken");
        }

        // make attack automiss
        workflow.setAttackRoll(await new Roll('1').evaluate());
        setProperty(workflow, "isFumble", true);
        setProperty(workflow, "attackRollHTML", await MidiQOL.midiRenderRoll(roll));
    }
}

if (args[0].macroPass === "postAttackRoll") {

    if (item.getFlag("world", "gw.misfired") === "misfire") {

        // change message to reflect misfire, will only work if a misfire actually happened
        let message = game.messages.filter(msg => msg.flags['midi-qol']?.workflowId === workflow.uuid && msg.content.includes("midi-qol-item-card") && msg.content.includes(`${actor.name}`)).last()
        message.content = message.content.replace("badly misses", "misfired against");

        item.setFlag("world", "gw.misfired", "okay");

        effectId = effect.id;

        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: actor.uuid, updates: [{ "_id": effectId, "disabled": true }] });

    } else if (item.getFlag("world", "gw.loaded") === "broken") {

        let message = game.messages.filter(msg => msg.flags['midi-qol']?.workflowId === workflow.uuid && msg.content.includes("midi-qol-item-card") && msg.content.includes(`${actor.name}`)).last()
        message.content = message.content.replace("badly misses", `breaks ${item.name} misfiring against`);
    }

    item.setFlag("world", "gw.loaded", false);
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

    setProperty(item.system, "actionType", item.flags.world.gw.properties.actionType);
    setProperty(item.system, "damage", item.flags.world.gw.properties.damage);
    setProperty(item.system, "range", item.flags.world.gw.properties.range);
    setProperty(item.system, "consume", item.flags.world.gw.properties.ammunition);
}