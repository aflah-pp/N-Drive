import { File } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      className="mx-auto  max-w-sm rounded-[16px] border border-[#e9e3d8] bg-[#fcfbf7] p-[45px_20px] text-center text-[#78867e]"
      style={{ marginTop: 150 }}
    >
      <div className="mx-auto mb-[13px] grid h-[51px] w-[51px] place-items-center rounded-[16px] bg-[#edf1e9] text-[#42715f]">
        <File size={21} />
      </div>

      <h3 className="font-['Manrope',sans-serif] mb-1.5 text-sm font-bold text-[#344841]">That page went missing</h3>

      <p className="mx-auto mb-3.5 max-w-[320px] text-[11px] leading-[1.6]">
        Try heading back to your workspace overview.
      </p>

      <Link
        to="/"
        data-testid="link-go-home"
        className="inline-flex items-center justify-center rounded-lg bg-[#183c37] px-4 py-2 font-['Manrope',sans-serif] text-[11px] font-bold text-[#f4f0e5] transition-colors duration-200 hover:bg-[#21514a]"
      >
        Go to overview
      </Link>
    </div>
  );
}
