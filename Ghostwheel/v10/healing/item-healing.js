if (args[0].tag === 'OnUse') {
    if (args[0].hitTargets.length < 1) { return; }

    const healing_amt = "1d4";

    const workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid);
    let hpRoll = await new Roll(healing_amt).evaluate({ async: true })

    new MidiQOL.DamageOnlyWorkflow(
        workflow.actor,
        workflow.token,
        hpRoll.total,
        "healing",
        workflow.actor ? [workflow.actor] : [], hpRoll,
        { flavor: `${item.name} healing`, itemCardId: workflow.itemCardId }
    );

    let newHp = Math.min(workflow.actor.system.attributes.hp.value + hpRoll.total,
        workflow.actor.system.attributes.hp.max);
    workflow.actor.update({ 'system.attributes.hp.value': newHp });

    console.log("dagger_healing executed");
}