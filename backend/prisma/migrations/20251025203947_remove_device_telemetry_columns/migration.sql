/*
  Warnings:

  - You are about to drop the column `androidVersion` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `appInstallTime` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `appVersionCode` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `board` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `brand` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `codename` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `collectedAt` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `deviceName` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `freeMemoryGB` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `freeStorageGB` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `hardware` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `incremental` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `isEmulator` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `isRooted` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `networkOperator` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `orientation` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `product` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `release` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `screenDensity` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `screenResolution` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `sdkVersion` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `securityPatch` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `simCountryISO` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `simOperator` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `totalMemoryGB` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `totalStorageGB` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `usedMemoryPercentage` on the `devices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `devices` DROP COLUMN `androidVersion`,
    DROP COLUMN `appInstallTime`,
    DROP COLUMN `appVersionCode`,
    DROP COLUMN `board`,
    DROP COLUMN `brand`,
    DROP COLUMN `codename`,
    DROP COLUMN `collectedAt`,
    DROP COLUMN `deviceName`,
    DROP COLUMN `freeMemoryGB`,
    DROP COLUMN `freeStorageGB`,
    DROP COLUMN `hardware`,
    DROP COLUMN `incremental`,
    DROP COLUMN `isEmulator`,
    DROP COLUMN `isRooted`,
    DROP COLUMN `manufacturer`,
    DROP COLUMN `networkOperator`,
    DROP COLUMN `orientation`,
    DROP COLUMN `product`,
    DROP COLUMN `release`,
    DROP COLUMN `screenDensity`,
    DROP COLUMN `screenResolution`,
    DROP COLUMN `sdkVersion`,
    DROP COLUMN `securityPatch`,
    DROP COLUMN `simCountryISO`,
    DROP COLUMN `simOperator`,
    DROP COLUMN `totalMemoryGB`,
    DROP COLUMN `totalStorageGB`,
    DROP COLUMN `usedMemoryPercentage`;
