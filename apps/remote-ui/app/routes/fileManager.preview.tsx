// routes/fileManager.preview.tsx
import { json } from "@remix-run/node";
import { requireUser } from "server/session.server";
import { storage } from "server/firebase/firebase.server";
import { ref, getDownloadURL } from "firebase/storage";
import { database } from "server/firebase/firebase.server";
import { ref as dbRef, get } from "firebase/database";
import { FileMetadata } from "server/models";

export async function loader({ request }: { request: Request }) {
  await requireUser(request);
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const fileId = url.searchParams.get("fileId");

  if (!projectId || !fileId) {
    return json({ error: "Missing project ID or file ID" }, { status: 400 });
  }

  try {
    // Get project data to find the file
    const projectRef = dbRef(database, `projects/${projectId}`);
    const snapshot = await get(projectRef);
    
    if (!snapshot.exists()) {
      return json({ error: "Project not found" }, { status: 404 });
    }

    const project = snapshot.val();
    const files = project.files || [];
    const file = files.find((f: FileMetadata) => f.id === fileId);

    if (!file) {
      return json({ error: "File not found" }, { status: 404 });
    }

    // Get the file content from Firebase Storage
    try {
      const response = await fetch(file.url);
      const content = await response.text();
      return json({ content });
    } catch (error) {
      console.error("Error reading file:", error);
      return json({ error: "Error reading file content" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching file metadata:", error);
    return json({ error: "Error fetching file metadata" }, { status: 500 });
  }
}