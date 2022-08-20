
// Based on Shove Macro made by G.O.D.#0001
// Create action, Activation Cost: None , Target: self, Action type: Utility, On Use Macro: ItemMacro.

const effect = actor.effects.filter(i => i.data.label === "Grappled")[0];

if (effect == null || effect == undefined) {
    ui.notifications.error("You must be grappled to use this feature.");
    return;
}

const grapplerUuid = `Actor.${effect.data.origin.split(".")[1]}`;
const grappler = game.actors.filter(i => i.uuid === grapplerUuid)[0];

new Dialog({
    title: "Escape Grapple",
    content: "Which Check to use to escape?",
    buttons: {
        athletics: {
            label: "Athletics", callback: () => {
                return DoCheck("ath");
            }
        },
        acrobatics: {
            label: "Acrobatics", callback: () => {
                return DoCheck("acr");
            }
        },
        auto: {
            label: "Auto", callback: () => {
                return DoCheck("auto");
            }
        },
    }
}).render(true);

async function DoCheck(input) {
    let roll;

    switch (input) {
        case "ath":
            roll = await actor.rollSkill("ath");
            break;
        case "acr":
            roll = await actor.rollSkill("acr");
            break;
        case "auto":
            let check = actor.data.data.skills.ath.total > actor.data.data.skills.acr.total ? "ath" : "acr";

            if (Math.abs(actor.data.data.skills.ath.total - actor.data.data.skills.acr.total) <= 4) {

                if (CheckForDisadvEffect(actor, "acr")) {
                    check = "ath";
                }

                if (CheckForDisadvEffect(actor, "ath")) {
                    check = "acr";
                }

                if (CheckForDisadvEffect(actor, "acr") && CheckForDisadvEffect(actor, "ath")) {
                    check = actor.data.data.skills.ath.total > actor.data.data.skills.acr.total ? "ath" : "acr";
                }

                if (CheckForAdvEffect(actor, "acr")) {
                    check = "acr";
                }

                if (CheckForAdvEffect(actor, "ath")) {
                    check = "ath";
                }

                if (CheckForAdvEffect(actor, "acr") && CheckForAdvEffect(actor, "ath")) {
                    check = actor.data.data.skills.ath.total > actor.data.data.skills.acr.total ? "ath" : "acr";
                }
            }
            roll = await actor.rollSkill(check);
            break;
    }

    let actorCheck = roll.total;

    let gc = await grappler.rollSkill("ath");
    let grapplerCheck = gc.total;

    let chatTemplate = "";

    if (actorCheck > grapplerCheck) {
        chatTemplate += `${actor.name} escaped being grappled by ${grappler.name}`;

        actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
    }
    else {
        chatTemplate += `${actor.name} failed to escape being grappled by ${grappler.name}`;
    }

    ChatMessage.create({
        speaker: {
            alias: actor.name
        },
        content: chatTemplate
    });

    console.log("escape grapple successfully executed");
}

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