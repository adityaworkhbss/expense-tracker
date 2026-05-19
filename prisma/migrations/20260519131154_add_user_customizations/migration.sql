-- CreateTable
CREATE TABLE "user_customizations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ai_transaction" BOOLEAN NOT NULL DEFAULT false,
    "reminder" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_customizations_user_id_key" ON "user_customizations"("user_id");

-- CreateIndex
CREATE INDEX "user_customizations_user_id_idx" ON "user_customizations"("user_id");

-- AddForeignKey
ALTER TABLE "user_customizations" ADD CONSTRAINT "user_customizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
