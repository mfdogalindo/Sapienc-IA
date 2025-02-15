import { Project } from 'server/models';
import { database } from '../firebase/firebase.server';
import { ref, set, onValue, get } from 'firebase/database';

export async function getProjects(): Promise<Project[]> {
   const snapshot = await get(ref(database, "projects"));
   if (!snapshot.exists()) {
      return [];
   }
   else {
      const projects = snapshot.val();
      return Object.keys(projects).map((key) => {
         return { id: key, ...projects[key] };
      });
   }
}

export async function updateProject(project: Project) {
   const projectRef = ref(database, `projects/${project.id}`);
   await set(projectRef, project);
}