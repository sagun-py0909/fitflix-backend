-- CreateEnum
CREATE TYPE "gender_enum" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "membership_status_enum" AS ENUM ('not_started', 'active', 'started', 'ended', 'expired', 'cancelled', 'tobestarted');

-- CreateEnum
CREATE TYPE "payment_status_enum" AS ENUM ('success', 'pending', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "attendance_status_enum" AS ENUM ('not_marked', 'attended', 'missed');

-- CreateEnum
CREATE TYPE "payment_for_enum" AS ENUM ('membership', 'personal_training', 'service', 'event', 'other');

-- CreateTable
CREATE TABLE "memberships" (
    "membership_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "duration_days" INTEGER NOT NULL,
    "price_rupees" INTEGER NOT NULL,
    "status" "membership_status_enum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("membership_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "payment_status_enum" NOT NULL DEFAULT 'pending',
    "method" VARCHAR(50),
    "staff_id" UUID,
    "notes" TEXT,
    "payment_for" "payment_for_enum" DEFAULT 'other',
    "membership_id" UUID,
    "user_trainer_id" UUID,
    "service_id" UUID,
    "event_id" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "user_memberships" (
    "user_membership_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "start_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "end_date" DATE,
    "payment_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "membership_status_enum" NOT NULL DEFAULT 'tobestarted',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_memberships_pkey" PRIMARY KEY ("user_membership_id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "profile_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "date_of_birth" DATE,
    "gender" "gender_enum",
    "height_cm" DECIMAL(5,2),
    "weight_kg" DECIMAL(5,2),
    "food_preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lifestyle" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "phone" VARCHAR(20),
    "role" VARCHAR(50) NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "gym_types" (
    "gym_type_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "gym_types_pkey" PRIMARY KEY ("gym_type_id")
);

-- CreateTable
CREATE TABLE "gym_info" (
    "info_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "contact_number" VARCHAR(20),
    "opening_hours" VARCHAR(100),
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "google_maps_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "gym_info_pkey" PRIMARY KEY ("info_id")
);

-- CreateTable
CREATE TABLE "gyms" (
    "gym_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_type_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "gyms_pkey" PRIMARY KEY ("gym_id")
);

-- CreateTable
CREATE TABLE "activities" (
    "activity_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "admins" (
    "admin_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(100) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "amenity_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "icon_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("amenity_id")
);

-- CreateTable
CREATE TABLE "event_bookings" (
    "booking_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "booked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_id" UUID,
    "attendance_status" "attendance_status_enum" DEFAULT 'not_marked',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "event_bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "events" (
    "event_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "event_date" TIMESTAMPTZ(6) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'upcoming',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price_rupees" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "gym_activities" (
    "gym_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,

    CONSTRAINT "gym_activities_pkey" PRIMARY KEY ("gym_id","activity_id")
);

-- CreateTable
CREATE TABLE "gym_amenities" (
    "gym_id" UUID NOT NULL,
    "amenity_id" UUID NOT NULL,

    CONSTRAINT "gym_amenities_pkey" PRIMARY KEY ("gym_id","amenity_id")
);

-- CreateTable
CREATE TABLE "gym_services" (
    "gym_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,

    CONSTRAINT "gym_services_pkey" PRIMARY KEY ("gym_id","service_id")
);

-- CreateTable
CREATE TABLE "services" (
    "service_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price_rupees" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "services_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "staff" (
    "staff_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gym_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "staff_type" VARCHAR(50) NOT NULL,
    "bio" TEXT,
    "photo_url" TEXT,
    "phone" VARCHAR(20),
    "email" VARCHAR(150),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "user_trainers" (
    "user_trainer_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "payment_id" UUID,
    "rate_cents" INTEGER NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "status" "membership_status_enum" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_trainers_pkey" PRIMARY KEY ("user_trainer_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "gym_types_name_key" ON "gym_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "activities_name_key" ON "activities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE INDEX "idx_bookings_event" ON "event_bookings"("event_id");

-- CreateIndex
CREATE INDEX "idx_events_gym" ON "events"("gym_id");

-- CreateIndex
CREATE INDEX "idx_gyma_gym" ON "gym_activities"("gym_id");

-- CreateIndex
CREATE INDEX "idx_ga_gym" ON "gym_amenities"("gym_id");

-- CreateIndex
CREATE INDEX "idx_gs_gym" ON "gym_services"("gym_id");

-- CreateIndex
CREATE UNIQUE INDEX "services_gym_id_name_key" ON "services"("gym_id", "name");

-- CreateIndex
CREATE INDEX "idx_staff_gym" ON "staff"("gym_id");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "fk_membership_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_pay_event" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_pay_membership" FOREIGN KEY ("membership_id") REFERENCES "memberships"("membership_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_pay_service" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_pay_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_pay_user_trainer" FOREIGN KEY ("user_trainer_id") REFERENCES "user_trainers"("user_trainer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "fk_payments_staff" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "fk_um_membership" FOREIGN KEY ("membership_id") REFERENCES "memberships"("membership_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "fk_um_payment" FOREIGN KEY ("payment_id") REFERENCES "payments"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_memberships" ADD CONSTRAINT "fk_um_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "fk_profile_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_info" ADD CONSTRAINT "fk_gym_info_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gyms" ADD CONSTRAINT "fk_gym_type" FOREIGN KEY ("gym_type_id") REFERENCES "gym_types"("gym_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookings" ADD CONSTRAINT "fk_eb_event" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookings" ADD CONSTRAINT "fk_eb_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookings" ADD CONSTRAINT "fk_eventbooking_payment" FOREIGN KEY ("payment_id") REFERENCES "payments"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "fk_events_activity" FOREIGN KEY ("activity_id") REFERENCES "activities"("activity_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "fk_events_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_activities" ADD CONSTRAINT "fk_gyma_activity" FOREIGN KEY ("activity_id") REFERENCES "activities"("activity_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_activities" ADD CONSTRAINT "fk_gyma_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_amenities" ADD CONSTRAINT "fk_ga_amenity" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("amenity_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_amenities" ADD CONSTRAINT "fk_ga_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_services" ADD CONSTRAINT "fk_gs_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_services" ADD CONSTRAINT "fk_gs_service" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "fk_services_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "fk_staff_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("gym_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_trainers" ADD CONSTRAINT "fk_ut_payment" FOREIGN KEY ("payment_id") REFERENCES "payments"("payment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_trainers" ADD CONSTRAINT "fk_ut_trainer" FOREIGN KEY ("trainer_id") REFERENCES "staff"("staff_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_trainers" ADD CONSTRAINT "fk_ut_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
