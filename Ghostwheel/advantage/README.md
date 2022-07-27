
## Advantage

This is a small macro to make all attacks with a specific item be made at advantage.


### Usage

Once stored and named in your foundry world, take the following steps:

 - Change the attack_name variable to the desired item's name (maintaining the quotes), e.g. "Quartstaff"
 
 - Put the macro name in the desired item's `OnUseMacro` field and set the trigger to be `Before Attack Roll`

 - ???

 - Profit.

It can also be useful to change the macro's name to reflect the item it's attached to. Alternatively, if this is the only macro to be called by that item it can be placed inside of an `ItemMacro` using the appropriate module.

This will still require the attack_name to be changed, but the macro's name to be input into `OnUseMacro` is now `ItemMacro`

An example Item, `Dagger (test)`, is provided just in case.

