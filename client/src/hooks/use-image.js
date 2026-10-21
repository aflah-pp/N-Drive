import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteGeneratedImage, generateImage, getUserImages } from '@/service/endpoints/ai';

export const imageKeys = {
  all: ['images'],
  list: () => [...imageKeys.all, 'list'],
};

function toSrc(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('data:')) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

export function normalizeImage(raw) {
  return {
    id: raw.id,
    src: toSrc(raw.image_url ?? raw.image_base64 ?? ''),
    createdAt: raw.created_at ?? null,
    date: raw.created_at
      ? new Date(raw.created_at).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '',
    raw,
  };
}

export function useImages() {
  return useQuery({
    queryKey: imageKeys.list(),
    queryFn: async () => {
      try {
        const data = await getUserImages();
        return data?.result ?? data?.images ?? [];
      } catch (err) {
        if (err?.response?.status === 400) return [];
        throw err;
      }
    },
    staleTime: 2 * 60_000,
    gcTime: 5 * 60_000,
    select: (list) => (Array.isArray(list) ? list.map(normalizeImage) : []),
  });
}

export function useGenerateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateImage,
    onSuccess: (data) => {
      const raw = data?.result;
      if (!raw) return;

      const normalized = normalizeImage(raw);

      queryClient.setQueryData(imageKeys.list(), (old) => {
        if (!Array.isArray(old)) return [raw];
        const dedup = old.filter((item) => item?.id !== raw.id);
        return [raw, ...dedup]; // ← new image at the top, immediately
      });

      queryClient.invalidateQueries({ queryKey: imageKeys.all });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGeneratedImage,
    onSuccess: (_, id) => {
      queryClient.setQueryData(imageKeys.list(), (old) => {
        if (!Array.isArray(old)) return [];
        return old.filter((row) => row?.id !== id);
      });
      queryClient.invalidateQueries({ queryKey: imageKeys.all });
    },
  });
}
