-- DropForeignKey
ALTER TABLE "emis" DROP CONSTRAINT "emis_account_id_fkey";

-- AlterTable
ALTER TABLE "emis" ADD COLUMN     "end_date" DATE,
ADD COLUMN     "start_date" DATE,
ALTER COLUMN "account_id" DROP NOT NULL,
ALTER COLUMN "principal" DROP NOT NULL,
ALTER COLUMN "next_due_date" DROP NOT NULL,
ALTER COLUMN "remaining_balance" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "emis" ADD CONSTRAINT "emis_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
