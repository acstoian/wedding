-- AlterTable
ALTER TABLE "Guest" ADD COLUMN "parentGuestId" INTEGER;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_parentGuestId_fkey" FOREIGN KEY ("parentGuestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Guest_parentGuestId_idx" ON "Guest"("parentGuestId");
