import { FileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers, generateUploadButton, generateUploadDropzone, generateUploader } from "@uploadthing/react";

export const UploadButton = generateUploadButton<FileRouter>();
export const UploadDropzone = generateUploadDropzone<FileRouter>();
export const Uploader = generateUploader<FileRouter>();

export const { uploadFiles, useUploadThing } =
  generateReactHelpers<FileRouter>();