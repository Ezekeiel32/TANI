/*
  Warnings:

  - A unique constraint covering the columns `[trainerId,weekday]` on the table `AvailabilityTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AvailabilityTemplate_trainerId_weekday_idx";

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityTemplate_trainerId_weekday_key" ON "AvailabilityTemplate"("trainerId", "weekday");
