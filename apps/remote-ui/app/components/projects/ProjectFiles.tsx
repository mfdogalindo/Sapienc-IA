import { DocumentTextIcon } from "@heroicons/react/16/solid";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { FileMetadata } from "server/models";

const formatFileSize = (bytes: number) => {
   if (bytes < 1024) {
      return bytes + " bytes";
   }
   if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
   }
   return (bytes / 1024 / 1024).toFixed(2) + " MB";
};

export function ProjectFiles({ files, className, projectId }: { files: FileMetadata[]; className: string, projectId: string }) {
   const [showList, setShowList] = useState(false);
   const navigate = useNavigate();

   if (!files) {
      return <p className={"italic text-zinc-400 " + className}>No files</p>;
   }

   return (
      <div className={"border border-zinc-700 p-2 " + className}>
         <button className="w-full text-left" onClick={() => setShowList(!showList)}>
            Files: {files.length}
         </button>
         {showList && (
            <div className="bg-white bg-opacity-10">
               {files.map((file) => {
                  return (
                     <div
                        key={file.id}
                        className="flex gap-2 items-baseline px-2"
                        onClick={() => navigate(`/fileManager/preview?fileId=${file.id}&projectId=${projectId}`)}
                     >
                        <DocumentTextIcon className="relative top-1 h-6 w-6 text-zinc-400" />
                        <p>{file.name}</p>
                        <p className="italic text-zinc-400 text-sm">{formatFileSize(file.size)}</p>
                        <p className="italic text-zinc-400 text-sm">{file.type}</p>
                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
}
