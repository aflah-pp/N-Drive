import { useQuery } from '@tanstack/react-query';

import { getReceipt, getTransactions } from '@/service/endpoints/transaction';

const FIVE_MIN = 5 * 60_000;

export const billingKeys = {
  all: ['billing'],
  transactions: () => [...billingKeys.all, 'transactions'],
};

export function useTransactions() {
  return useQuery({
    queryKey: billingKeys.transactions(),
    queryFn: getTransactions,
    staleTime: FIVE_MIN,
    select: (data) => data?.transactions ?? [],
  });
}

export async function downloadReceipt(trxId) {
  const response = await getReceipt(trxId);

  const disposition = response.headers?.['content-disposition'] ?? response.headers?.['Content-Disposition'];
  let filename = `Invoice_${trxId}.pdf`;
  if (disposition) {
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    if (match?.[1]) filename = decodeURIComponent(match[1]);
  }

  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return filename;
}
