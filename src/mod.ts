import config from "../config/config.json";
import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { BotGeneratorHelperExtension } from "./BotGeneratorHelperExtension";

class Mod implements IPostDBLoadMod, IPreSptLoadMod
{

    preSptLoad(container: DependencyContainer): void {
        container.register<BotGeneratorHelperExtension>("BotGeneratorHelperExtension", BotGeneratorHelperExtension);
        container.register("BotGeneratorHelper", { useToken: "BotGeneratorHelperExtension" });
    }

    public postDBLoad(container: DependencyContainer): void
    {

        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables: IDatabaseTables = databaseServer.getTables();
        const logger = container.resolve<ILogger>("WinstonLogger");
        const itemHelper: ItemHelper = container.resolve<ItemHelper>("ItemHelper");
        const items = Object.values(tables.templates.items);

        if (config.ModifyHelmets) 
        {
            //IDs of all helmets that should be ignored.
            const ignoredHelmetsList = []

            //The armored headwear to be modified.  Filters out headwear that does not have slots since clothing headwear has 0 slots
            const helmets = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.HEADWEAR) && x._props.Slots.length > 1 && !(ignoredHelmetsList.includes(x._id)));

            //The built-in plate inserts to be used for referencing the armor value and durability of a helmet
            const builtInInserts = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.BUILT_IN_INSERTS)) 

            //List of all helmet plate inserts that will be set to 1 durability after helmets iteration is complete
            let helmetPlates = [];

            for (const helmet of helmets) 
            {
                // Modifies the helmet to cover the full head
                helmet._props.armorColliders = 
                [
                    "HeadCommon",
                    "ParietalHead",
                    "BackHead",
                    "Ears",
                    "Eyes",
                    "Jaw",
                    "NeckFront",
                    "NeckBack"
                ];

                let numOfPlates = 0;
                let armorClass;
                let plateDurability;

                //Iterates through all slots in the helmet to find the plate inserts, then adds the plate insert to helmetPlates[] for later durability setting
                for (const slot of helmet._props.Slots) 
                {
                    let slotName = slot._name.toLowerCase(); 
                    if (slotName == "helmet_top" ||
                        slotName == "helmet_back" ||
                        slotName == "helmet_eyes" ||
                        slotName == "helmet_jaw" ||
                        slotName == "helmet_ears")
                    {
                        const plateId = slot._props.filters[0].Plate;
                        const plate = builtInInserts.find(ins => ins._id == plateId);
                        //Stores the helmet's armor class and durability in armorClass and plateDurability
                        if ((armorClass == null || plateDurability == null) && plate != undefined) 
                        {
                            armorClass = plate._props.armorClass;
                            plateDurability = plate._props.MaxDurability;
                        }
                        if (!helmetPlates.includes(plate)) 
                        {
                            helmetPlates.push(plate);
                        }
                        numOfPlates++;
                    }
                }

                // Modifies the armor class and durability of the helmet
                if (armorClass != undefined && plateDurability != undefined) 
                {
                    helmet._props.armorClass = armorClass;
                    helmet._props.Durability = (plateDurability*numOfPlates) - numOfPlates;
                    helmet._props.MaxDurability = (plateDurability*numOfPlates) - numOfPlates;
                }
                
            }

            //Set the plate inserts in the helmet to 1 durability
            for (const plate of helmetPlates) 
            {
                if (plate._props.Durability != undefined && plate._props.MaxDurability != undefined) 
                {
                    plate._props.Durability = 1;
                    plate._props.MaxDurability = 1;    
                }
            }

        }

        if (config.ModifyFaceShields) 
        {
            //IDs of all face shields that should be manually added to the array due to not having a face shield property
            const additionalFaceShields = ["5ea058e01dbce517f324b3e2"] 

            //The face shields to be modified.  Ignores all items that have less than 2 armor class (ex: eyewear)
            let visors = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.ARMORED_EQUIPMENT) && x._props.MaterialType == "GlassVisor" && Number(x._props.armorClass) > 1);
            for (const additionalFaceShield of additionalFaceShields) {
                if (tables.templates.items[additionalFaceShield] !== undefined) {
                    visors = visors.concat(tables.templates.items[additionalFaceShield]);
                }
            }

            //Increases armor class of face shields by 2 and modifies face shields to cover the full face.
            const ceiling = 6; 
            for (const visor of visors) 
            {
                let newArmorClass = Number(visor._props.armorClass) + 2;
                if (newArmorClass > ceiling) 
                {
                    newArmorClass = ceiling;
                }
                visor._props.armorClass = newArmorClass.toString();
                visor._props.armorColliders = 
                [
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
}

export const mod = new Mod();
