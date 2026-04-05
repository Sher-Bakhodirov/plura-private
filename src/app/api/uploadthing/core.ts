import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter as UploadthingFileRouter } from "uploadthing/next";

const f = createUploadthing();

const authenticateUser = async () => {
  const user = await auth();

  if (!user) throw new Error("Unauthorized");

  // accessible in onUploadComplete as `metadata`
  return user;
};

// FileRouter for your app, can contain multiple FileRoutes
export const fileRouter = {
  subAccountLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(() => { }),
  avatar: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(() => { }),
  agencyLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(() => { }),
  media: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(() => { }),
} satisfies UploadthingFileRouter;

export type FileRouter = typeof fileRouter;
