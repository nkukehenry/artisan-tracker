-- AlterTable: Fix gpsCoordinates column length in call_logs table
ALTER TABLE `call_logs` MODIFY COLUMN `gpsCoordinates` TEXT NULL;

-- AlterTable: Fix gpsCoordinates column length in media_files table  
ALTER TABLE `media_files` MODIFY COLUMN `gpsCoordinates` TEXT NULL;

-- AlterTable: Fix gpsCoordinates column length in messages table
ALTER TABLE `messages` MODIFY COLUMN `gpsCoordinates` TEXT NULL;
