-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "address" VARCHAR(255),
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(100),
ADD COLUMN     "profile_picture_url" VARCHAR(500),
ADD COLUMN     "state" VARCHAR(100),
ADD COLUMN     "zip_code" VARCHAR(20);
