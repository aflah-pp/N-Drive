import api from '../api';

export const uploadFile = ({ file, folderId, onProgress }) => {
  const fd = new FormData();
  fd.append('file', file);
  if (folderId) fd.append('folder_id', folderId);

  return api.post('/file/upload/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      onProgress?.(percent);
    },
  });
};

export const deleteItem = async ({ fileId, folderId }) => {
  const body = {};
  if (folderId) body.folder_id = folderId;
  else if (fileId) body.file_id = fileId;
  else throw new Error('deleteItem needs fileId or folderId');

  const { data } = await api.delete('/storage/delete/', { data: body });
  return data;
};

export const createFolder = async ({ name }) => {
  const { data } = await api.post('/create/folder/', { name });
  return data;
};
