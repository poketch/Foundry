# Healing

This is a macro to make the named item always heal on hit. Because of its general use case it is useful to make it an ItemMacro

## Usage

Once added as an ItemMacro on the desired item:
 - change the attack_name variable to the exact name of the item it's attached to, maintaining the quotes e.g. `"Quarterstaff"`

 - Change the healing to the desired amount. Usable syntax is the same as the `/r` command [https://foundryvtt.com/article/dice/] 

 - Add `ItemMacro`` to `OnUseMacros` with the trigger `Before Active Effects`

 - ???

 - Profit


An example Item, `Dagger (test)`, is provided just in case.
