
// Based on Shove Macro made by G.O.D.#0001
// Create action, Activation Cost: None , Target: self, Action type: Utility, On Use Macro: ItemMacro.

const effect = actor.effects.filter(i => i.data.label === "Grappled")[0];

if (effect == null || effect == undefined)
{
    ui.notifications.error("You must be grappled to use this feature.");
    return;
}

const grapplerUuid = `Actor.${effect.data.origin.split(".")[1]}`;
const grappler = game.actors.filter(i => i.uuid === grapplerUuid)[0];

new Dialog({
    title: "Escape Grapple",
    content: "Which Check to use to escape?",
    buttons: {
      athletics: { label: "Athletics", callback: () => { 
        return DoCheck("ath");
    }},
      acrobatics: { label: "Acrobatics", callback: () => { 
        return DoCheck("acr");
    }},
      auto: { label: "Auto", callback: () => { 
        return DoCheck("auto");
    }},
    }
}).render(true);

async function DoCheck(input){
    let roll;
    
    switch(input) {
        case "ath":
            roll = await actor.rollSkill("ath");
            break;
        case "acr":
            roll = await actor.rollSkill("acr");
            break;
        case "auto":
            const check = actor.data.data.skills.ath.total > actor.data.data.skills.acr.total ? "ath" : "acr";
            roll = await actor.rollSkill(check);
            break;
    }

    let actorCheck = roll.total;

    let gc = await grappler.rollSkill("ath");
    let grapplerCheck = gc.total;
    
    let chatTemplate = "";

    if( actorCheck > grapplerCheck) {
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