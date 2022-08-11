
# Description

### Lion's Roar (Novice, Strike, Prowess)
    
    *As you strike a foe you unleash a howl that exhilarates and inspires your allies.*

    Make an melee weapon attack; if you hit, you deal your normal damage and 2d6 additional damage. In addition, if you hit, the first successful attack that each ally makes against the target deals 1d6 additional damage until the start of your next turn.

Created by Ghostwheel#0698

# Usage

The desired actor must have all three features:
- Lion's Roar
- Lion's Roar - Marked
- Lion's Roar - Inspiration

Though they will only ever need to activate `Lion's Roar` when they wish to use the feature, the rest of the process is automated.

To use, Activate the `Lion's Roar` feature and then make a weapon attack.


## Minor technical details

`Lion's roar - Inspiration` is applied to all tokens on the current canvas which have have a player owner using Foundry's 'acto.hasPlayerOwner' field. According to my testing the buff will apply to NPCs with player owners like pets, etc. This may not be intended behaviour and may cause slowdown if there are alot of player owned tokens on a map. 

I have no current plans for "fixing" this. 
