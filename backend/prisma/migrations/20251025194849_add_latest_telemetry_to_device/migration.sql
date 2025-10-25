-- AlterTable
ALTER TABLE `devices` ADD COLUMN `latestTelemetryId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_latestTelemetryId_fkey` FOREIGN KEY (`latestTelemetryId`) REFERENCES `telemetry`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
