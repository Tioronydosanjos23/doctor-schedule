CREATE TYPE "public"."blood_type" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "occupation" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "blood_type" "blood_type";--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "weight" numeric(5, 1);--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "height" numeric(5, 1);--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "allergies" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "chronic_conditions" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "medications" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "emergency_contact_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "emergency_contact_phone" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "observations" text;