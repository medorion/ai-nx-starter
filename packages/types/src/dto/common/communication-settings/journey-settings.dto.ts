import { JourneyRestartType } from "../../../enums/features/journey-restart-type.enum";

export class JourneySettingsDto {
    public journeyRestartType: JourneyRestartType;
    public journeyRetentionDays: number;
}