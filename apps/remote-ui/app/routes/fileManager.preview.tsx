// routes/fileManager.preview.tsx
import { json } from "@remix-run/node";
import { requireUser } from "server/session.server";
import { FileWithMetadata } from "server/models";
import { getFileWithMetadata } from "server/database/project-files-firestore.server";

export async function loader({ request }: { request: Request }) {
   await requireUser(request);
   try {
      const url = new URL(request.url);
      const projectId = url.searchParams.get("projectId");
      const fileId = url.searchParams.get("fileId");

      if (!projectId || !fileId) {
         return json({ error: "Missing project ID or file ID" }, { status: 400 });
      }
      const file: FileWithMetadata = await getFileWithMetadata(projectId, fileId);
      return json({ file });
   } catch (error) {
      console.error("Error fetching file metadata:", error);
      return json({ error: "Error fetching file metadata" }, { status: 500 });
   }
}
