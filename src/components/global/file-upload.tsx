import { UploadDropzone } from "@/lib/uploadthing";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

interface FileUploadProps {
  apiEndpoint: 'agencyLogo' | 'avatar' | 'subAccountLogo',
  onChange: (url?: string) => void,
  value?: string,
}

export default function FileUpload({ apiEndpoint, onChange, value }: FileUploadProps) {
  const type = value?.split(".").pop();

  if (value) {
    return (
      <div className="flex flex-col justify-center items-center">
        {
          type !== 'pdf' ? (
            <div className="relative w-40 h-40">
              <Image
                src={value}
                alt="uploaded image"
                className="object-contain"
                fill
              />
            </div>
          ) : (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon />
              <a
                href={value}
                target="_blank"
                rel="noopener_noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                View PDF
              </a>
            </div>
          )}

        <Button variant="ghost" type="button">
          <X className="h-4 w-4" />
          Remove Logo
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full bg-muted/30">
      <UploadDropzone
        endpoint={apiEndpoint}
        appearance={{
          container: ({ isDragActive }) =>
            `cursor-pointer transition-colors duration-200 ${isDragActive ? "border-primary bg-primary/10" : "hover:border-primary/60 hover:bg-muted/50"}`,
          button: "ut-ready:bg-primary ut-uploading:bg-primary/70 transition-all duration-150 hover:opacity-90 active:scale-95 cursor-pointer",
        }}
        onClientUploadComplete={(res) => {
          onChange(res?.[0].ufsUrl)
        }}
        onUploadError={(error: Error) => {
          // TODO: Add logging
          console.log(error)
        }}
      />
    </div>
  )
}