-- CreateEnum
CREATE TYPE "PlanCode" AS ENUM ('FREE', 'PRO', 'TEAM');

-- CreateEnum
CREATE TYPE "BillingSku" AS ENUM ('PRO_MONTHLY', 'PRO_YEARLY', 'LIFETIME', 'TEAM_MONTHLY', 'ADDON_AI_COACHING', 'ADDON_EXPORT', 'ADDON_NOTIFICATIONS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PAID', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('OWNER', 'MEMBER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "trialStartedAt" TIMESTAMP(3),
ADD COLUMN "trialEndsAt" TIMESTAMP(3),
ADD COLUMN "plan" "PlanCode" NOT NULL DEFAULT 'FREE',
ADD COLUMN "planExpiresAt" TIMESTAMP(3),
ADD COLUMN "lifetime" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserAddon" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sku" "BillingSku" NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sku" "BillingSku" NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "razorpayPaymentLinkId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpayOrderId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HabitGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GroupRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitGroupChallenge" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitGroupChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAddon_userId_sku_key" ON "UserAddon"("userId", "sku");

-- CreateIndex
CREATE INDEX "UserAddon_userId_idx" ON "UserAddon"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayPaymentLinkId_key" ON "Payment"("razorpayPaymentLinkId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HabitGroup_inviteCode_key" ON "HabitGroup"("inviteCode");

-- CreateIndex
CREATE INDEX "HabitGroup_ownerId_idx" ON "HabitGroup"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "HabitGroupMember_groupId_userId_key" ON "HabitGroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "HabitGroupMember_userId_idx" ON "HabitGroupMember"("userId");

-- CreateIndex
CREATE INDEX "HabitGroupChallenge_groupId_createdAt_idx" ON "HabitGroupChallenge"("groupId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserAddon" ADD CONSTRAINT "UserAddon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitGroup" ADD CONSTRAINT "HabitGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitGroupMember" ADD CONSTRAINT "HabitGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HabitGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitGroupMember" ADD CONSTRAINT "HabitGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitGroupChallenge" ADD CONSTRAINT "HabitGroupChallenge_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "HabitGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
