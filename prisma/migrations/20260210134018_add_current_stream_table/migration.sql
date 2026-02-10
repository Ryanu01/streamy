-- CreateTable
CREATE TABLE "CurrentStream" (
    "spaceId" INTEGER NOT NULL,
    "songId" INTEGER NOT NULL,

    CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("spaceId")
);

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
