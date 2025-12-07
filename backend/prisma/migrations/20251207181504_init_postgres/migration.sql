/*
  Warnings:

  - A unique constraint covering the columns `[busId,seatCode]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Seat_seatCode_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Seat_busId_seatCode_key" ON "Seat"("busId", "seatCode");
