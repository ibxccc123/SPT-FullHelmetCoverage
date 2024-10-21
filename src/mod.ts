import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";

class Mod implements IPostDBLoadMod
{
    public postDBLoad(container: DependencyContainer): void
    {
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables: IDatabaseTables = databaseServer.getTables();
        const logger = container.resolve<ILogger>("WinstonLogger");
        const itemHelper: ItemHelper = container.resolve<ItemHelper>("ItemHelper");
        const items = Object.values(tables.templates.items);

        //IDs of all helmets that should be ignored.  The ID below is the DevTac Ronin ballistic helmet as it already covers the full head
        const ignoredHelmetsList = ["5b4329f05acfc47a86086aa1"]
        //IDs of all face shields that should be manually added to the array due to not having a face shield property
        const additionalFaceShields = ["5ea058e01dbce517f324b3e2"] 

        //The armored headwear to be modified.  Filters out headwear that does not have slots since clothing headwear has 0 slots
        const helmets = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.HEADWEAR) && x._props.Slots.length > 1 && !(ignoredHelmetsList.includes(x._id)));

        //The built-in plate inserts to be used for referencing the armor value and durability of a helmet
        const builtInInserts = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.BUILT_IN_INSERTS)) 
        
        //The face shields to be modified.  Ignores all items that have less than 2 armor class (ex: eyewear)
        let visors = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.ARMORED_EQUIPMENT) && x._props.MaterialType == "GlassVisor" && Number(x._props.armorClass) > 1);
        for (const additionalFaceShield of additionalFaceShields) {
            if (tables.templates.items[additionalFaceShield] !== undefined) {
                visors = visors.concat(tables.templates.items[additionalFaceShield]);
            }
        }

        for (const helmet of helmets) {
            // Modifies the helmet to cover the full head
            helmet._props.armorColliders = [
                "HeadCommon",
                "ParietalHead",
                "BackHead",
                "Ears",
                "Eyes",
                "Jaw",
                "NeckFront",
                "NeckBack"
            ];

            //Finds the plate item in the top plate slot of the helmet.
            const slotId = helmet._props.Slots.findIndex(slot => slot._name.toLowerCase() == "helmet_top");
            const topPlateId = helmet._props.Slots[slotId]._props.filters[0].Plate;
            const topPlate = builtInInserts.find(ins => ins._id == topPlateId);

            // Modifies the armor class and durability of the helmet by referencing the top plate's props.  Durability is multiplied by 2
            helmet._props.armorClass = topPlate._props.armorClass;
            helmet._props.Durability = topPlate._props.Durability * 2;
            helmet._props.MaxDurability = topPlate._props.MaxDurability * 2;
        }

        //Increases armor class of face shields by 2, multiplies the durability by 2, and modifies face shields to cover the full face.
        const ceiling = 6; 
        for (const visor of visors) {
            let newArmorClass = Number(visor._props.armorClass) + 2;
            if (newArmorClass > ceiling) {
                newArmorClass = ceiling;
            }
            visor._props.armorClass = newArmorClass.toString();
            visor._props.Durability *= 2;
            visor._props.MaxDurability *= 2;
            visor._props.armorColliders = [
                "HeadCommon",
                "ParietalHead",
                "BackHead",
                "Ears",
                "Eyes",
                "Jaw",
                "NeckFront",
                "NeckBack"
            ];
        }

    }
}

export const mod = new Mod();
