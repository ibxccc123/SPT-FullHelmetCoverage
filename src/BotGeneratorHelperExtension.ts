import config from "../config/config.json";
import { BotGeneratorHelper } from "@spt/helpers/BotGeneratorHelper";
import { ApplicationContext } from "@spt/context/ApplicationContext";
import { ContextVariableType } from "@spt/context/ContextVariableType";
import { ContainerHelper } from "@spt/helpers/ContainerHelper";
import { DurabilityLimitsHelper } from "@spt/helpers/DurabilityLimitsHelper";
import { InventoryHelper } from "@spt/helpers/InventoryHelper";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { Inventory } from "@spt/models/eft/common/tables/IBotBase";
import { Item, Repairable, Upd } from "@spt/models/eft/common/tables/IItem";
import { Grid, ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { IGetRaidConfigurationRequestData } from "@spt/models/eft/match/IGetRaidConfigurationRequestData";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ItemAddedResult } from "@spt/models/enums/ItemAddedResult";
import { IChooseRandomCompatibleModResult } from "@spt/models/spt/bots/IChooseRandomCompatibleModResult";
import { EquipmentFilters, IBotConfig, IRandomisedResourceValues } from "@spt/models/spt/config/IBotConfig";
import { IPmcConfig } from "@spt/models/spt/config/IPmcConfig";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { DatabaseService } from "@spt/services/DatabaseService";
import { LocalisationService } from "@spt/services/LocalisationService";
import { RandomUtil } from "@spt/utils/RandomUtil";
import { inject, injectable } from "tsyringe";

@injectable()

export class BotGeneratorHelperExtension extends BotGeneratorHelper {

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("RandomUtil") protected randomUtil: RandomUtil,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("DurabilityLimitsHelper") protected durabilityLimitsHelper: DurabilityLimitsHelper,
        @inject("ItemHelper") protected itemHelper: ItemHelper,
        @inject("InventoryHelper") protected inventoryHelper: InventoryHelper,
        @inject("ContainerHelper") protected containerHelper: ContainerHelper,
        @inject("ApplicationContext") protected applicationContext: ApplicationContext,
        @inject("LocalisationService") protected localisationService: LocalisationService,
        @inject("ConfigServer") protected configServer: ConfigServer,


    ) {
        super(
            logger,
            randomUtil,
            databaseService,
            durabilityLimitsHelper,
            itemHelper,
            inventoryHelper,
            containerHelper,
            applicationContext,
            localisationService,
            configServer
        );
    }

    /**
     * Create a repairable object for an armor that containers durability + max durability properties
     * @param itemTemplate weapon object being generated for
     * @param botRole type of bot being generated for
     * @returns Repairable object
     */
    protected override generateArmorRepairableProperties(itemTemplate: ITemplateItem, botRole?: string): Repairable {
        let maxDurability: number;
        let currentDurability: number;
        if (Number.parseInt(`${itemTemplate._props.armorClass}`) === 0) {
            maxDurability = itemTemplate._props.MaxDurability!;
            currentDurability = itemTemplate._props.MaxDurability!;
        } 
        
        else if (itemTemplate._parent == "5a341c4086f77401f2541505" && config.ReduceBotHelmetDurability) {
            maxDurability = this.durabilityLimitsHelper.getRandomizedMaxArmorDurability(itemTemplate, botRole);
            currentDurability = 1;
        }
        
        else {
            maxDurability = this.durabilityLimitsHelper.getRandomizedMaxArmorDurability(itemTemplate, botRole);
            currentDurability = this.durabilityLimitsHelper.getRandomizedArmorDurability(
                itemTemplate,
                botRole,
                maxDurability,
            );
        }

        return { Durability: currentDurability, MaxDurability: maxDurability };
    }

}