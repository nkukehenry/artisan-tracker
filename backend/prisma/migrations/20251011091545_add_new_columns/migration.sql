-- AlterTable
ALTER TABLE `call_logs` ADD COLUMN `gpsCoordinates` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `mediaId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `devices` ADD COLUMN `androidVersion` VARCHAR(191) NULL,
    ADD COLUMN `appInstallTime` BIGINT NULL,
    ADD COLUMN `appVersionCode` INTEGER NULL,
    ADD COLUMN `board` VARCHAR(191) NULL,
    ADD COLUMN `brand` VARCHAR(191) NULL,
    ADD COLUMN `codename` VARCHAR(191) NULL,
    ADD COLUMN `collectedAt` BIGINT NULL,
    ADD COLUMN `deviceName` VARCHAR(191) NULL,
    ADD COLUMN `freeMemoryGB` DOUBLE NULL,
    ADD COLUMN `freeStorageGB` DOUBLE NULL,
    ADD COLUMN `hardware` VARCHAR(191) NULL,
    ADD COLUMN `incremental` VARCHAR(191) NULL,
    ADD COLUMN `isEmulator` BOOLEAN NULL,
    ADD COLUMN `isRooted` BOOLEAN NULL,
    ADD COLUMN `manufacturer` VARCHAR(191) NULL,
    ADD COLUMN `networkOperator` VARCHAR(191) NULL,
    ADD COLUMN `orientation` VARCHAR(191) NULL,
    ADD COLUMN `product` VARCHAR(191) NULL,
    ADD COLUMN `release` VARCHAR(191) NULL,
    ADD COLUMN `screenDensity` DOUBLE NULL,
    ADD COLUMN `screenResolution` VARCHAR(191) NULL,
    ADD COLUMN `sdkVersion` INTEGER NULL,
    ADD COLUMN `securityPatch` VARCHAR(191) NULL,
    ADD COLUMN `simCountryISO` VARCHAR(191) NULL,
    ADD COLUMN `simOperator` VARCHAR(191) NULL,
    ADD COLUMN `totalMemoryGB` DOUBLE NULL,
    ADD COLUMN `totalStorageGB` DOUBLE NULL,
    ADD COLUMN `usedMemoryPercentage` INTEGER NULL;

-- AlterTable
ALTER TABLE `media_files` ADD COLUMN `callId` VARCHAR(191) NULL,
    ADD COLUMN `gpsCoordinates` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `messages` ADD COLUMN `gpsCoordinates` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL;
