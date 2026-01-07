/*
  Warnings:

  - Added the required column `recoveryTrendScore` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Blockchain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionHash" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "Blockchain_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "recoveryTrendScore" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Session_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("createdAt", "id", "patientId", "updatedAt") SELECT "createdAt", "id", "patientId", "updatedAt" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Blockchain_sessionId_key" ON "Blockchain"("sessionId");
