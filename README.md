# Full Helmet Coverage

This simple mod edits helmets and face shields to cover all armor zones in the entire head (Face, Head top, Nape, Ears, Eyes, Jaws, Throat, Back neck).  Face shields' armor classes are raised by 2.

## **Overview**

Helmets receive additional durability that protects all head hitboxes.  Face shields are buffed with their armor class increased by 2 and their durability doubled. These changes apply to ALL helmets and face shields so expect PMC firefights with low-to-medium caliber rounds to last longer.  Enemy PMCs with a high-tier helmet and body armor will be major threats.  However, one taps through the helmet will happen provided the ammo has enough penetration/damage.

Naturally there is a loss of realism since a player/bot can take a low-pen round to the naked face and not be damaged at all, provided their equipped helmet has a high enough armor class to stop the round.  

I made this mod since I wanted head armor, specifically helmets and face shields, to be more useful pieces of gear in the early-mid game.  I like helmet drip a lot but find their viability unsatisfactory as they provide debuffs to ergo and turn speed and when bots shoot at an exposed head, the lower hitboxes below the helmet like eyes/jaws/throat are much more likely to be hit.  This mod can be used as an alternative way of preventing sudden headshot deaths if a bot shoots at your face that's peeking out of cover, but other mods like **Headshot Damage Redirection** or **Dad Gamer Mode** are recommended if most of your bots are using ammo that pens through most helmets.


## **Install**

Extract directly into the SPT folder.  Mod folder can be located in user/mods/.

## **Specifics**

The armorColliders, Durability, MaxDurability, and armorClass are updated for all helmets.  For example, the SSh-68 steel helmet has 90 durability from its original 54 (2 * Durability of helmet_top plate).  The plates and new helmet durability are shown below:

- Plate - Head top - 18/18
- Plate - Nape - 18/18
- Plate - Ears - 18/18
- *NEW*: Helmet - Face, Head top, Nape, Ears, Eyes, Jaws, Throat, Back neck - 36/36

In practice, the additional 36 durability is used for all head armor zones and block bullets, while receiving durability damage when shot at.  Due to this implementation, this additional durability is not shown separately in-game like a plate but can be calculated through Current Durability - (Durability of All Plates + Additional Armor like Ear Covers).  

Generally speaking, if the shown durability of the helmet is ~50% to ~75%, then the modded armor zones added onto the helmet are likely compromised and only the "default" plates in the helmet will be functional.  The helmet can be repaired normally.

## **Other Mods**

This mod is compatible with any other mods that add helmets or face shields with "GlassVisor" MaterialType to the game.
