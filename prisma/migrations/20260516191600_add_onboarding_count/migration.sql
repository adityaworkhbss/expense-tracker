-- AlterTable
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='onboarding_count') THEN
        ALTER TABLE "users" ADD COLUMN "onboarding_count" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "type" DROP NOT NULL;
ALTER TABLE "accounts" ALTER COLUMN "type" DROP DEFAULT;

-- AlterEnum
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountType') THEN
        -- Check if it's the old enum
        IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'AccountType' AND e.enumlabel = 'BANK') THEN
            CREATE TYPE "AccountType_new" AS ENUM ('PAY_NOW', 'PAY_LATER');
            ALTER TABLE "accounts" ALTER COLUMN "type" TYPE "AccountType_new" USING (CASE WHEN "type"::text = 'BANK' THEN 'PAY_NOW'::"AccountType_new" ELSE 'PAY_NOW'::"AccountType_new" END);
            DROP TYPE "AccountType";
            ALTER TYPE "AccountType_new" RENAME TO "AccountType";
        END IF;
    ELSE
        CREATE TYPE "AccountType" AS ENUM ('PAY_NOW', 'PAY_LATER');
        ALTER TABLE "accounts" ALTER COLUMN "type" TYPE "AccountType" USING 'PAY_NOW'::"AccountType";
    END IF;
END $$;
