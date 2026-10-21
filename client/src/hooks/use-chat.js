import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getChatHistory, resetChatSession, sendChatMessage } from '@/service/endpoints/ai';

export const chatKeys = {
  all: ['chat'],
  history: () => [...chatKeys.all, 'history'],
};

export function normalizeConversation(conversation = []) {
  if (!Array.isArray(conversation)) return [];
  return conversation
    .filter(
      (m) =>
        m &&
        typeof m === 'object' &&
        typeof m.role === 'string' &&
        (typeof m.content === 'string' || typeof m.text === 'string'),
    )
    .map((m) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
      text: typeof m.text === 'string' ? m.text : m.content,
    }));
}

export function useChatHistory() {
  return useQuery({
    queryKey: chatKeys.history(),
    queryFn: async () => {
      const data = await getChatHistory();
      return normalizeConversation(data?.conversation ?? []);
    },
    staleTime: Infinity,
  });
}

export function useSendChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message) => sendChatMessage(message),

    // 1) Show the user's message immediately
    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.history() });

      const previous = queryClient.getQueryData(chatKeys.history()) ?? [];

      queryClient.setQueryData(chatKeys.history(), [...previous, { role: 'user', text: message }]);

      return { previous };
    },

    // 2) Rollback on failure
    onError: (_err, _message, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(chatKeys.history(), ctx.previous);
      }
    },

    // 3) Replace optimistic thread with the server's authoritative version
    onSuccess: (data) => {
      const normalized = normalizeConversation(data?.conversation ?? []);
      queryClient.setQueryData(chatKeys.history(), normalized);
    },
  });
}

export function useResetChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resetChatSession(),
    onSuccess: () => {
      queryClient.setQueryData(chatKeys.history(), []);
    },
  });
}
