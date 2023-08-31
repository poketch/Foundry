// Increment Insp counter 
Hooks.on("dnd5e.rollToolCheck", tool);
Hooks.on("dnd5e.rollAbilityTest", ability);
Hooks.on("dnd5e.rollSkill", skill);

// Apply Insp Effects
Hooks.on("dnd5e.preRollToolCheck", (...args) => { return insp("tool", ...args) });
Hooks.on("dnd5e.preRollAbilityTest", (...args) => { return insp("check", ...args) });
Hooks.on("dnd5e.preRollSkill", (...args) => { return insp("skill", ...args); });
Hooks.on("dnd5e.preRollAttack", (...args) => { return insp("attack", ...args); });
// Hooks.on("dnd5e.preRollAbilitySave", (...args) => { return insp("save", ...args); });
// Hooks.on("midi-qol.preambleComplete", (w) => { return flag(w) });

const eff_name = "GM Inspiration";

function flag(workflow) {

    const inspiredTargets = [...workflow.targets.map(t => t.actor).filter(a => a.effects.some(eff => eff.label === "GM Inspiration"))];

    console.log(workflow.uuid);

    for (const target of inspiredTargets) {
        target.setFlag("world", "workflowItem", workflow.uuid);
    }


    // if it's a spell I need to interupt here for insp dialog

}

function insp(type, ...args) {


    let actor = args[0];

    if (type === "tool" || type === "attack") {
        actor = args[0].actor;
    }

    if (actor.flags?.world?.skipInsp === true) {
        actor.setFlag("world", "skipInsp", false);
        return;
    }

    const effect = actor.effects.filter(eff => eff.label === eff_name)[0];

    if (effect === undefined || effect === null) { return; }

    new Dialog({
        title: "INSPIRED!",
        content: "You have GM Inspiration, Do you want to use it?",
        buttons: {
            YES: {
                label: "YES!", callback: async () => {
                    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [effect.id] })
                    await outcome(actor, type, true, ...args);
                }
            },
            NO: {
                label: "no...",
                callback: async () => {
                    await actor.setFlag("world", "skipInsp", true);
                    await outcome(actor, type, false, ...args);
                }
            },
        },
    }).render(true);
    return false;
}

async function outcome(actor, type, adv, ...args) {

    let options;

    switch (type) {
        case "skill":
            await actor.rollSkill(args[2], { advantage: adv, fastForward: true });
            break;
        case "check":
            await actor.rollAbilityTest(args[2], { advantage: adv, fastForward: true });
            break;
        case "tool":
            const w = await MidiQOL.Workflow.getWorkflow(args[0].uuid);
            console.log(w);
            await args[0].rollToolCheck({ advantage: adv, fastForward: true }); //item.rollToolCheck on the requisiute tool
            break;
        case "save":

            const targets = game.users.map(u => [...u.targets]).flat().map(t => t.actor);

            if (!targets.includes(actor)) {
                //lazy save
                await actor.rollAbilitySave(args[2], { advantage: adv, fastForward: true });
                break;
            }

            const item = await fromUuid(actor.flags?.world?.workflowItem);
            if (!item) { return; }

            if (adv) {
                let z = actor;
                z.actor = actor;
                await game.macros.getName("save_buff").execute({ actor: [{ targets: [z] }] });
            }

            options = { showFullCard: false, createWorkflow: true, configureDialog: true };
            await MidiQOL.completeItemUse(item, {}, options);
            actor.unsetFlag("world", "workflowItem");
            break;
        case "attack":
            await args[0].rollAttack({ advantage: adv, fastForward: true })
            break;
    }
}

async function shard(type, actor) {

    if (game.combat != null) { return; }

    let actorUuiD = actor.uuid;
    let itemUuiD = actor.items.filter(it => it.name === "Inspiration Shards")[0].uuid;

    await Requestor.request({
        img: false,
        title: `${actor.name}: ${type} check`,
        description: `Looks like ${actor.name} made a check. What was the outcome?`,
        buttonData: [
            {
                label: `Success`,
                command: async () => {

                    const item = await fromUuid(itemID);
                    const actor = await fromUuid(actorID);

                    const uses = item.system.uses.value;

                    if (uses === 4) {

                        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [[...item.effects][0]] });
                        await item.update({ "system.uses.value": 0 });
                        const message = game.messages.filter(msg => msg.content.includes("requestor") && msg.content.includes(`${actor.name}`)).last();
                        await message.delete();
                        return;
                    }

                    await item.update({ "system.uses.value": uses + 1 });
                    const messages = game.messages.filter(msg => msg.content.includes("requestor") && msg.content.includes(`${actor.name}`));
                    const message = messages[messages.length - 1];
                    await message.delete();
                    return;

                },
                scope: { actorID: actorUuiD, itemID: itemUuiD },
                limit: Requestor.LIMIT.OPTION,
                permission: Requestor.PERMISSION.GM
            },
            {
                actor: actorUuiD,
                label: "Failure",
                command: async () => {
                    const actor = await fromUuid(this.actor);
                    const messages = game.messages.filter(msg => msg.content.includes("requestor") && msg.content.includes(`${actor.name}`));
                    const message = messages[messages.length - 1];
                    await message.delete();
                    return;

                },
                scope: { actor: actorUuiD, item: itemUuiD },
                limit: Requestor.LIMIT.OPTION,
                permission: Requestor.PERMISSION.GM
            }
        ],

        limit: Requestor.LIMIT.OPTION,
        whisper: game.users.filter(user => user.isGM).map(user => user.id),
        blind: true,
    });
}

function skill(...args) {
    shard("skill", args[0]);
}

function ability(...args) {
    shard("ability", args[0]);
}

function tool(...args) {
    shard("tool", args[0].actor);
}