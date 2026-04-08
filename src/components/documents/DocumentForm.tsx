import React, { useEffect, useMemo } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Document, DocumentFolder, DocumentFormData } from '../../types/documents';
import { addDocument, updateDocument } from '../../services/documentsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useFoldersStore } from '../../store/useFoldersStore';

function buildFolderOptions(folders: DocumentFolder[]): { folder: DocumentFolder; depth: number }[] {
  const knownIds = new Set(folders.map((f) => f.id));
  const result: { folder: DocumentFolder; depth: number }[] = [];
  function traverse(parentId: string | null, depth: number) {
    folders
      .filter((f) => (f.parentId && knownIds.has(f.parentId) ? f.parentId : null) === parentId)
      .forEach((folder) => {
        result.push({ folder, depth });
        traverse(folder.id, depth + 1);
      });
  }
  traverse(null, 0);
  return result;
}

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(['Identity', 'Visa & Immigration', 'Health', 'Finance', 'Education', 'Employment', 'Insurance', 'Property', 'Vehicle', 'Other']),
  issuer: z.string().max(100),
  country: z.string().min(1, 'Country is required'),
  documentNumber: z.string().max(100),
  issueDate: z.string(),
  expiryDate: z.string(),
  reminderDaysBefore: z.number().min(0).max(365),
  storageLocation: z.string().max(200),
  notes: z.string().max(500),
  folderId: z.string().nullable().transform((v) => (v === '' ? null : v)),
});

type FormValues = z.infer<typeof schema>;

interface DocumentFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingDocument?: Document | null;
  defaultFolderId?: string | null;
}

const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors';
const selectClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors appearance-none cursor-pointer';

export const DocumentForm: React.FC<DocumentFormProps> = ({ isOpen, onClose, editingDocument, defaultFolderId }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { folders } = useFoldersStore();
  const folderOptions = useMemo(() => buildFolderOptions(folders), [folders]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: '', category: 'Identity', issuer: '', country: 'Germany',
      documentNumber: '', issueDate: '', expiryDate: '',
      reminderDaysBefore: 30, storageLocation: '', notes: '',
      folderId: defaultFolderId ?? '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingDocument) {
      reset({
        name: editingDocument.name, category: editingDocument.category,
        issuer: editingDocument.issuer, country: editingDocument.country,
        documentNumber: editingDocument.documentNumber,
        issueDate: editingDocument.issueDate, expiryDate: editingDocument.expiryDate,
        reminderDaysBefore: editingDocument.reminderDaysBefore,
        storageLocation: editingDocument.storageLocation, notes: editingDocument.notes,
        folderId: editingDocument.folderId ?? '',
      });
    } else {
      reset({ name: '', category: 'Identity', issuer: '', country: 'Germany', documentNumber: '', issueDate: '', expiryDate: '', reminderDaysBefore: 30, storageLocation: '', notes: '', folderId: defaultFolderId ?? '' });
    }
  }, [editingDocument, isOpen, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      const formData: DocumentFormData = { ...data };
      if (editingDocument) {
        await updateDocument(user.uid, editingDocument.id, formData);
        addToast('Document updated', 'success');
      } else {
        await addDocument(user.uid, formData);
        addToast('Document saved!', 'success');
      }
      onClose();
    } catch {
      addToast('Something went wrong', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center px-4 py-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-scale-in mt-4 mb-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingDocument ? 'Edit Document' : 'Add Document'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track important documents and their expiry dates</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Document Name <span className="text-red-500">*</span></label>
              <input {...register('name')} placeholder="e.g. German Residence Permit, Passport" className={inputClass} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select {...register('category')} className={selectClass}>
                  {['Identity', 'Visa & Immigration', 'Health', 'Finance', 'Education', 'Employment', 'Insurance', 'Property', 'Vehicle', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country <span className="text-red-500">*</span></label>
              <div className="relative">
                <select {...register('country')} className={selectClass}>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="India">🇮🇳 India</option>
                  <option value="Other">🌍 Other</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Folder</label>
              <div className="relative">
                <select {...register('folderId')} className={selectClass}>
                  <option value="">No folder (Unfiled)</option>
                  {folderOptions.map(({ folder, depth }) => (
                    <option key={folder.id} value={folder.id}>
                      {'\u00a0\u00a0'.repeat(depth * 2)}{depth > 0 ? '└ ' : ''}{folder.name}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Issuing Authority</label>
              <input {...register('issuer')} placeholder="e.g. Ausländerbehörde, UIDAI" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Document Number</label>
              <input {...register('documentNumber')} placeholder="e.g. Passport no., Policy no." className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Issue Date</label>
              <input {...register('issueDate')} type="date" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expiry Date</label>
              <input {...register('expiryDate')} type="date" className={inputClass} />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Leave blank if document has no expiry</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Remind me (days before expiry)</label>
              <input {...register('reminderDaysBefore', { valueAsNumber: true })} type="number" min="0" max="365" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Storage Location</label>
              <input {...register('storageLocation')} placeholder="e.g. Google Drive > Docs, Blue folder" className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
              <textarea {...register('notes')} rows={2} placeholder="Any extra notes..." className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-indigo-200">
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editingDocument ? 'Save Changes' : 'Save Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
