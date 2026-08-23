-- CreateTable
CREATE TABLE "CardContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "addressEnc" TEXT,
    "notes" TEXT,
    "personId" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CardContact_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardSeasonStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contactId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "sendCard" BOOLEAN NOT NULL DEFAULT true,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "received" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CardSeasonStatus_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CardContact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CardSeasonStatus_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TripItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATETIME,
    "mealSlot" TEXT,
    "time" TEXT,
    "venue" TEXT,
    "booked" BOOLEAN NOT NULL DEFAULT false,
    "reference" TEXT,
    "notes" TEXT,
    "lat" REAL,
    "lng" REAL,
    "purchaseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TripItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TripItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TripItem" ("booked", "createdAt", "date", "id", "lat", "lng", "mealSlot", "notes", "reference", "time", "title", "tripId", "type", "updatedAt", "venue") SELECT "booked", "createdAt", "date", "id", "lat", "lng", "mealSlot", "notes", "reference", "time", "title", "tripId", "type", "updatedAt", "venue" FROM "TripItem";
DROP TABLE "TripItem";
ALTER TABLE "new_TripItem" RENAME TO "TripItem";
CREATE UNIQUE INDEX "TripItem_purchaseId_key" ON "TripItem"("purchaseId");
CREATE INDEX "TripItem_tripId_idx" ON "TripItem"("tripId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CardContact_personId_key" ON "CardContact"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "CardSeasonStatus_contactId_seasonId_key" ON "CardSeasonStatus"("contactId", "seasonId");
