const parent_eff = "Pearl of Black Doubt";

const child_eff = "Doubt";


const hook = Hooks.on("midi-qol.AttackRollComplete", main);

async function main(args) {

    //if the workflow is a spell, return
    if (args.templateData != null || args.templateData != undefined) { return; }

    const ttokens = [...args.targets]?.filter(token => [...token.actor.effects].some(ef => ef.data.label.includes(parent_eff) && ef.data.disabled === false));

    if (ttokens.length == 0 || ttokens == null || ttokens == undefined) { return; }

    for (const ttoken of ttokens) {

        

        //if target was hit, do nothing
        if ([...args.hitTargets].includes(ttoken)) { continue; }

        const tactor = ttoken.actor;

        if ([...tactor.effects].some(ef => ef.data.label === child_eff)) { continue; }

        //define effect
        const effectData = {
            label: child_eff,
            icon: "modules/dfreds-convenient-effects/images/dodging.svg",
            duration: { startTime: 120, turns: 1 },
            flags: {
                core: { statusId: " " },
            },
            changes: [
                {
                    key: "flags.midi-qol.grants.disadvantage.attack.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "1"
                },
            ]
        };

        //apply effect
        MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tactor.uuid, effects: [effectData] });
        console.log("Pearl of Black Doubt Activated sucessfully");







    }


}