
// Based on Shove Macro made by G.O.D.#0001
// Create action, 1 action, Target: 1 creature, Range: Touch, Action type: Utility, On Use Macro: ItemMacro.


const targets = Array.from(game.user.targets);
if (targets.length !== 1) {
    ui.notifications.error("You can only attempt to grapple one creature at once.");
    return;
}

const currentTarget = targets[0].actor;


let check = currentTarget.data.data.skills.ath.total > currentTarget.data.data.skills.acr.total ? "ath" : "acr";

if (Math.abs(currentTarget.data.data.skills.ath.total - currentTarget.data.data.skills.acr.total) <= 4) {

    if (CheckForDisadvEffect(currentTarget, "acr")) {
        check = "ath";
    }
    if (CheckForDisadvEffect(currentTarget, "ath")) {
        check = "acr";
    }
    if (CheckForDisadvEffect(currentTarget, "acr") && CheckForDisadvEffect(currentTarget, "ath")) {
        check = currentTarget.data.data.skills.ath.total > currentTarget.data.data.skills.acr.total ? "ath" : "acr";
    }

    if (CheckForAdvEffect(currentTarget, "acr")) {
        check = "acr";
    }

    if (CheckForAdvEffect(currentTarget, "ath")) {
        check = "ath";
    }

    if (CheckForAdvEffect(currentTarget, "acr") && CheckForAdvEffect(currentTarget, "ath")) {
        check = currentTarget.data.data.skills.ath.total > currentTarget.data.data.skills.acr.total ? "ath" : "acr";
    }
}

const actorCheck = await actor.rollSkill("ath");
const targetCheck = await currentTarget.rollSkill(check);

const actorResult = actorCheck.total;
const targetResult = targetCheck.total;

let chatTemplate = "";

if (actorResult > targetResult) {
    chatTemplate += `${actor.name} sucessfully grappled ${currentTarget.name}`;

    const effectData = {
        label: "Grappled",
        icon: "modules/combat-utility-belt/icons/grappled.svg",
        flags: { core: { statusId: "combat-utility-belt.grappled" } },
        changes: [
            { key: "data.attributes.movement.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "*0" },
        ],
        origin: actor.items.getName("Grapple").uuid,
    }

    MidiQOL.socket().executeAsGM("createEffects", { actorUuid: currentTarget.uuid, effects: [effectData] });
}
else {
    chatTemplate += `${actor.name} failed to grapple ${currentTarget.name}`;
}

ChatMessage.create({
    speaker: {
        alias: actor.name
    },
    content: chatTemplate
})

console.log("grapple attempt successfully executed");


function CheckForDisadvEffect(actor, skillName) {
    return CheckForEffect(actor, skillName, "disadvantage")
}

function CheckForAdvEffect(actor, skillName) {
    return CheckForEffect(actor, skillName, "advantage")
}

function CheckForEffect(actor, skillName, condition) {
    const check = (eff) => eff.data.changes.some((change) => change.key === `flags.midi-qol.${condition}.skill.${skillName}` && change.value === '1');

    const result = actor.effects?.some(check)

    if (result != null || result != undefined) {
        return result;
    } else {
        return false;
    }
}
