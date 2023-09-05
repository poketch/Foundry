const item = await fromUuid(template.flags.dnd5e.origin);
const itemCpy = foundry.utils.duplicate({ ...item, type: "feat" });
delete itemCpy._id;

let damageParts = item.system.damage.parts;
if (item.type === "spell") {

    // cantrip 
    if (item.system.level === 0) {
        const cantripDice = Math.floor((item.actor.system.details.level + 1) / 6) + 1;
        damageParts = damageParts.map(part => {
            return [part[0].replace(part[0].split("d")[0], `${cantripDice}`), part[1]];
        });
    }

    //leveled
    if (item.system.level > 0 && item.system.scaling.mode === "level") {
        const messages = game.messages.filter(m => m.getFlag('midi-qol', "itemUuid") === template.flags.dnd5e.origin)

        const msg = messages[messages.length - 1];
        const castLevel = msg.getFlag("dnd5e", "use.spellLevel");

        scalingDicePoolSize = parseInt(item.system.scaling.formula.split("d")[0]);

        damageParts = damageParts.map(part => {

            oldDicePoolSize = parseInt(part[0].split("d")[0]);
            newDicePoolSize = oldDicePoolSize + ((castLevel - item.system.level) * scalingDicePoolSize);

            return [part[0].replace(part[0].split("d")[0], `${newDicePoolSize}`), part[1]];
        });

    }

    setProperty(itemCpy, "system.damage.parts", damageParts);
}

setProperty(itemCpy, "system.target", {
    "value": 1,
    "width": null,
    "units": "",
    "type": "creature"
});

workflowItem = new CONFIG.Item.documentClass(itemCpy, { parent: item.actor });
await MidiQOL.completeItemUse(workflowItem, {}, { targetUuids: [token.document.uuid] });
