-- AlterTable: Add isIncoming field to messages table
ALTER TABLE `messages` ADD COLUMN `isIncoming` BOOLEAN NOT NULL DEFAULT true;
