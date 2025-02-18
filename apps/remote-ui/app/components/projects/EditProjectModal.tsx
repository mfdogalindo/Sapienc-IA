import * as Dialog from '@radix-ui/react-dialog';
import { Form, useNavigation } from "@remix-run/react";
import { XMarkIcon } from '@heroicons/react/16/solid';
import { useEffect } from 'react';
import { Project } from 'server/models';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Project
}

export function ProjectFormModal({ isOpen, onClose, initialData }: ProjectFormModalProps) {
  const isEditing = !!initialData?.id;
  const navigation = useNavigation();

  useEffect(() => {
   if (navigation.state === "submitting") {
     onClose();
   }
 }, [navigation.state, onClose]);
  
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl">
          <Dialog.Title className="text-xl font-semibold text-white mb-4">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </Dialog.Title>
          
          <Form method="post" className="space-y-4">
            <input type="hidden" name="_action" value={isEditing ? 'edit' : 'create'} />
            {isEditing && <input type="hidden" name="projectId" value={initialData.id} />}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={initialData?.name}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                defaultValue={initialData?.description}
                rows={3}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter project description"
              />
            </div>
            
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-white mb-1">
                Project Objective
              </label>
              <textarea
                id="objective"
                name="objective"
                required
                defaultValue={initialData?.objective}
                rows={2}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter project objective"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </Form>

          <Dialog.Close asChild>
            <button 
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              aria-label="Close"
            >
              <XMarkIcon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
