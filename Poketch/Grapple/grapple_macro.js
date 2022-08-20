
// Based on Shove Macro made by G.O.D.#0001
// Create action, 1 action, Target: 1 creature, Range: Touch, Action type: Utility, On Use Macro: ItemMacro.


const targets = Array.from(game.user.targets);
if (targets.length !== 1)
{
    ui.notifications.error("You can only attempt to grapple one creature at once.");
    return;
}

const currentTarget = targets[0].actor;

const check = currentTarget.data.data.skills.ath.total > currentTarget.data.data.skills.acr.total ? "ath" : "acr";

let actorCheck = actor.rollSkill("ath");
let targetCheck = currentTarget.rollSkill(check);

actorCheck.then( r1 => {
    targetCheck.then( r2 => {

        let actorResult = r1.total;
        let targetResult = r2.total;
        
        let chatTemplate = "";

        if (actorResult > targetResult)
        {
            chatTemplate += `${actor.name} sucessfully grappled ${currentTarget.name}`;
            
            const effectData = {
                label : "Grappled",
                icon : "modules/combat-utility-belt/icons/grappled.svg",
                flags: { core: {statusId: "combat-utility-belt.grappled"}},
                changes: [
                   {key: "data.attributes.movement.all", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "*0"},
               ],
                origin: actor.items.getName("Grapple").uuid,
               }
               
            MidiQOL.socket().executeAsGM("createEffects", { actorUuid: currentTarget.uuid, effects: [effectData] });
        }
        else
        {
            chatTemplate += `${actor.name} failed to grapple ${currentTarget.name}`;
        }

        ChatMessage.create({
            speaker: {
              alias: actor.name
            },
            content: chatTemplate
          })
    });
});

console.log("grapple attempt successfully executed");
