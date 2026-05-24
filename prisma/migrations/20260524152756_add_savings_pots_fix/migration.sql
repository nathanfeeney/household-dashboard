-- CreateTable
CREATE TABLE "SavingsPot" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🏦',
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT 'green',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingsPot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PotContribution" (
    "id" TEXT NOT NULL,
    "potId" TEXT NOT NULL,
    "contributedById" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "contributionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PotContribution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavingsPot" ADD CONSTRAINT "SavingsPot_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsPot" ADD CONSTRAINT "SavingsPot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PotContribution" ADD CONSTRAINT "PotContribution_potId_fkey" FOREIGN KEY ("potId") REFERENCES "SavingsPot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PotContribution" ADD CONSTRAINT "PotContribution_contributedById_fkey" FOREIGN KEY ("contributedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
