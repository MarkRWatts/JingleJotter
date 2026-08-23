-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN "expectedBy" DATETIME;

-- CreateTable
CREATE TABLE "GiftIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "url" TEXT,
    "approxPence" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "purchaseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GiftIdea_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GiftIdea_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftIdea_purchaseId_key" ON "GiftIdea"("purchaseId");

-- CreateIndex
CREATE INDEX "GiftIdea_personId_idx" ON "GiftIdea"("personId");
