/*
  Warnings:

  - The `staff_type` column on the `staff` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[user_id]` on the table `staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `staff` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "staff_type_enum" AS ENUM ('manager', 'housekeeping', 'basic_staff');

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "staff_type",
ADD COLUMN     "staff_type" "staff_type_enum" NOT NULL DEFAULT 'basic_staff';

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "fk_staff_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
