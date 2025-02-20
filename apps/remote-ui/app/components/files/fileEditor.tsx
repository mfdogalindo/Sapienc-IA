import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";
import { FileMetadata } from "server/models";
import { XMarkIcon, DocumentPlusIcon } from "@heroicons/react/16/solid";
import { Form, useFetcher } from "@remix-run/react";
import { nordTheme } from "./editorThemes";
import LoadingBar from "../ui/loading-bar";

interface EditorProps {
   file?: FileMetadata;
   projectId: string;
   onClose: () => void;
}

const FileEditor = ({ file, projectId, onClose }: EditorProps) => {
   const [content, setContent] = useState("");
   const [isLoading, setIsLoading] = useState(true);
   const [transaction, setTransaction] = useState(false);
   const [fileName, setFileName] = useState(file?.name || "");
   const [showPreview, setShowPreview] = useState(false);
   const [error, setError] = useState("");
   const fetcher = useFetcher();
   const isNew = !file;

   useEffect(() => {
      loader.init().then((monaco) => {
         monaco.editor.defineTheme("nord", nordTheme);
      });
   });

   useEffect(() => {
      if (file) {
         setIsLoading(true);
         fetcher.load(`/fileManager/preview?projectId=${projectId}&fileId=${file.id}`);
      }
   }, [file]);

   useEffect(() => {
      if (fetcher.data?.file) {
         setContent(fetcher.data.file.data);
         setIsLoading(false);
         setTransaction(false);
      }
   }, [fetcher.data]);

   useEffect(() => {
      if (isNew) {
         setIsLoading(false);
      }
   }, [fileName]);

   const getLanguage = (fileName: string) => {
      const ext = fileName.split(".").pop()?.toLowerCase();
      const languageMap: { [key: string]: string } = {
         js: "javascript",
         ts: "typescript",
         jsx: "javascript",
         tsx: "typescript",
         json: "json",
         py: "python",
         md: "markdown",
         yml: "yaml",
         yaml: "yaml",
         txt: "plaintext",
      };
      return languageMap[ext || ""] || "plaintext";
   };

   const handleSave = async () => {
      setTransaction(true);
      if (!fileName) {
         setError("Please enter a file name");
         return;
      }

      const formData = new FormData();
      formData.append("_action", isNew ? "upload" : "update");
      formData.append("projectId", projectId);

      // Create a new File object from the content
      const fileNew = new File([content], fileName, {
         type: `text/${getLanguage(fileName)}`,
      });
      formData.append("file", fileNew);

      if (!isNew) {
         formData.append("fileId", file.id);
      }

      fetcher.submit(formData, {
         method: "POST",
         encType: "multipart/form-data",
      });
   };

   return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
         {transaction && <LoadingBar className="absolute top-10" />}
         <div className="bg-zinc-900 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
               <div className="flex items-center gap-4">
                  <DocumentPlusIcon className="w-6 h-6 text-teal-500" />
                  {isNew ? (
                     <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name with extension..."
                        className="bg-zinc-800 text-white px-3 py-1 rounded border border-zinc-700"
                     />
                  ) : (
                     <h3 className="text-lg font-medium text-white">{fileName}</h3>
                  )}
               </div>

               <div className="flex items-center gap-4">
                  {fileName.endsWith(".md") && (
                     <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-4 py-2 text-sm bg-zinc-800 text-white rounded hover:bg-zinc-700"
                     >
                        {showPreview ? "Edit" : "Preview"}
                     </button>
                  )}
                  <button
                     onClick={handleSave}
                     disabled={transaction}
                     className="disabled:cursor-not-allowed disabled:bg-opacity-30 px-4 py-2 text-sm bg-teal-600 text-white rounded hover:bg-teal-700"
                  >
                     Save
                  </button>
                  <button onClick={onClose} className="btn text-gray-400 hover:text-white transition-colors ">
                     <XMarkIcon className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* Error Message */}
            {error && <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 mx-4 my-2 rounded-md">{error}</div>}

            {/* Editor/Preview Area */}
            <div className="flex-1 overflow-hidden">
               {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
               ) : (
                  <>
                     {fileName.endsWith(".md") && showPreview ? (
                        <div className="h-full overflow-auto p-4 prose prose-invert max-w-none">
                           {/* Add markdown preview component here */}
                           <div dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                     ) : (
                        <Editor
                           height="100%"
                           language={getLanguage(fileName)}
                           value={content}
                           onChange={(value) => setContent(value || "")}
                           theme="nord"
                           options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              lineNumbers: "on",
                              wordWrap: "on",
                              automaticLayout: true,
                           }}
                        />
                     )}
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export default FileEditor;
