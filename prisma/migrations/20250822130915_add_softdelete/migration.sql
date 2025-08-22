-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "deletedAt" TIMESTAMP(3);
