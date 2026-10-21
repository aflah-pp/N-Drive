export const storageKeys = {
  all: ['storage'],
  usage: () => [...storageKeys.all, 'usage'],
  files: () => [...storageKeys.all, 'all'],
  bin: () => [...storageKeys.all, 'bin'],
};

export const authKeys = {
  all: ['auth'],
  me: () => [...authKeys.all, 'me'],
};
