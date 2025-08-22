/*
  Warnings:

  - A unique constraint covering the columns `[bookingId,transaction]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."ServiceRequest" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_transaction_key" ON "public"."Payment"("bookingId", "transaction");
