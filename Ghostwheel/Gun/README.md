
# Description

**All attacks with firearms are made at advantage**; however unlike other loading weapons, firearms are muzzle loaded and **must be reloaded after every shot as an action** (which requires at least one hand unoccupied), and have a **misfire chance**. 

If any of the dice on the attack roll fall within the misfire range (including any that would be rerolled, such as via the halfling race's Lucky trait), a misfire occurs and the shot misses, while the firearm itself becomes faulty.

A faulty firearm can still be fired, but creatures using it do not have advantage to attack any longer and **if it misfires again it is irrecoverably broken** and unable to be used. Creatures who have proficiency in firearms can take an action to fix a faulty firearm.


Created by Ghostwheel#0698
(emphasis mine)

# Usage

### REQUIRES:
 `Midi QOL`, `Item Macros` and `Effect Macros` modules

The example item: `ExampleGunItem.json` is a complete ready to import version of what an item needs to have to follow these rules. 

Different firearms can easily be made by duplicating the item and changing **its name and the name of its effect to be matching**.
From there the details (damage, crit threshold, etc, etc.) can be whatever you want. 
In theory this will work for any item requiring an attack roll though Ranged Weapon Attack is the only one tested.

To change the misfire range, set the `Fumble Threshold` property under the `Midi Qol Fields` in teh item details


##### To set up one from scratch:
- The desired weapon must have the GunItemMacro.js attached as an Item Macro, with its `On Use Macros` set to `ItemMacro`and the trigger in the drop down set to `All`

- The item should impart an effect which **must have the same name as the item.** It is useful to make this a passive effect so that it can be easily toggled (even more easily toggled via the TokenActionHUD module).

- The effect need not impart any changes (though it can if it is desired) the only thing necessary is that it have `GunEffectMacro.js` stored in its effect macro under the trigger `Never Automatically`

- To set the misfire range, set the `Fumble Threshold` property under the `Midi Qol Fields` in the item details.


From here the use flow is as follows:

   - Rolling on the item will roll an attack at advantage. It is assumed the first action will be taken while the weapon is loaded.

   - Rolling another time will cause the reload action to take place with no attack. 

From here this can be repeated ad nauseam.

  - If the gun misfires, the chat card will reflect that in its message and the item's effect will be disabled

  - From here the player can keep attacking though the attack will **not** be at advantage.

  - If the player wishes to fix the firearm all they have to do is reactivate the effect.

  - If the player misfires while the weapon is faulty (i.e. the effect is not active. The weapon will be broken beyond repair and attempting to fre it again will reflect that



## Technical Details 

There is a known bug that opening and closing the item's sheet or the character's sheet will reset the item's internal state, "fixing" it. 
I have no interest in attempting to fix this as it's too niche.

