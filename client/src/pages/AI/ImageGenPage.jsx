import { ExternalLink, Image as ImageIcon, Loader2, Sparkles, Trash2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useDeleteImage, useGenerateImage, useImages } from '@/hooks/use-image';
import PageHead from '../shared/PageHead';

const STYLE_CHIPS = ['Editorial illustration', 'Soft daylight', 'Rich texture'];

function Empty({ icon: Icon = ImageIcon, title, copy }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 sm:py-14 px-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-3">
        <Icon size={22} />
      </div>
      <h3 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] max-w-xs leading-relaxed">{copy}</p>
    </div>
  );
}

function GalleryCard({ image, onDelete, deleting }) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="group border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--muted)]">
        {broken ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
            <ImageIcon size={22} className="text-[var(--muted-foreground)] mb-1.5" />
            <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">Preview expired</p>
          </div>
        ) : (
          <img
            src={image.src}
            alt="Generated preview"
            loading="lazy"
            onError={() => setBroken(true)}
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {!broken && image.src?.startsWith('http') && (
            <a
              href={image.src}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open full image"
              className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 text-slate-800 hover:bg-white hover:text-slate-900 backdrop-blur-sm shadow-sm active:scale-95"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <button
            type="button"
            onClick={() => onDelete(image.id)}
            disabled={deleting}
            aria-label="Delete image"
            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 text-slate-800 hover:bg-white hover:text-red-600 backdrop-blur-sm shadow-sm active:scale-95 disabled:opacity-40"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>

      <div className="p-2.5 sm:p-3">
        <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] truncate">
          {image.date || 'Just now'}
        </span>
      </div>
    </div>
  );
}

export function ImageStudio() {
  const images = useImages();
  const generate = useGenerateImage();
  const remove = useDeleteImage();

  const [prompt, setPrompt] = useState('');

  // The most recently generated image (from this session)
  const lastGenerated = generate.data?.result
    ? {
        id: generate.data.result.id,
        src: generate.data.result.image_url,
        date: new Date(generate.data.result.created_at).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
    : null;

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text || generate.isPending) return;

    try {
      await generate.mutateAsync({ prompt: text });
      setPrompt('');
      toast.success('Image generated');
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not generate image';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove.mutateAsync(id);
      toast.success('Image deleted');
    } catch (err) {
      toast.error(
        err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Could not delete image',
      );
    }
  };

  const list = images.data ?? [];

  const renderCanvas = () => {
    if (generate.isPending) {
      return (
        <div className="flex flex-col items-center text-center px-4 py-6">
          <div className="relative w-14 h-14 mb-4">
            <span className="absolute inset-0 rounded-full bg-[var(--primary)]/20 animate-ping" />
            <div className="relative w-14 h-14 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--secondary-foreground)]">
              <Sparkles size={22} />
            </div>
          </div>
          <strong className="font-manrope text-[12px] sm:text-[13px] text-[var(--foreground)]">
            Painting your image…
          </strong>
          <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1 max-w-[240px] leading-relaxed">
            The backend is polling a GPU. This is normal and can take up to 90 seconds.
          </p>
        </div>
      );
    }

    // Show the freshly generated image
    if (lastGenerated?.src) {
      return (
        <div className="relative w-full h-full">
          <img
            src={lastGenerated.src}
            alt="Latest generated"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">Just generated</div>
              <div className="text-[11px] text-white truncate">{lastGenerated.date}</div>
            </div>
            <a
              href={lastGenerated.src}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 text-slate-900 text-[10px] font-semibold hover:bg-white"
            >
              <ExternalLink size={11} /> Open
            </a>
          </div>
        </div>
      );
    }

    return (
      <>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(135deg,#6b9082 0%,#d6a67d 47%,#ba6d58 100%)',
            filter: 'saturate(0.6) blur(2px)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col items-center text-center px-4 py-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/70 text-slate-700 mb-3 backdrop-blur-sm">
            <Sparkles size={22} />
          </div>
          <strong className="font-manrope text-[12px] sm:text-[13px] text-white drop-shadow-sm">
            Your canvas is waiting
          </strong>
          <p className="text-[11px] sm:text-xs text-white/90 mt-1 max-w-[240px] leading-relaxed drop-shadow-sm">
            Write a prompt and generate an image — it lands in your gallery below.
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Make a little magic"
        title="Image studio"
        subtitle="Describe a scene. Shape a direction. Keep the previews that spark something."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 shrink-0">
        {/* Prompt panel */}
        <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-5 flex flex-col shadow-sm">
          <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
            01 / Your prompt
          </div>
          <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mt-1">
            What are you imagining?
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-0.5 mb-3 leading-relaxed">
            A few concrete details make a lovely starting point.
          </p>

          <label
            htmlFor="image-prompt"
            className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mb-1"
          >
            Prompt
          </label>
          <textarea
            id="image-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A hand-painted travel poster for a rainy afternoon in old Mumbai, terracotta rooftops and soft jade skies…"
            rows={4}
            disabled={generate.isPending}
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow disabled:opacity-60"
          />

          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2.5 mb-4">
            {STYLE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setPrompt((old) => (old ? `${old}, ${chip.toLowerCase()}` : chip))}
                disabled={generate.isPending}
                className="text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-[0.97] disabled:opacity-40"
              >
                + {chip}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || generate.isPending}
            className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto self-start px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generate.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating… (this can take a minute)
              </>
            ) : (
              <>
                <Wand2 size={14} /> Generate image
              </>
            )}
          </button>

          <div className="mt-3 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2 py-1.5 leading-tight">
            Image generation runs on a shared GPU pool. Expect 30–90 seconds per image.
          </div>
        </section>

        {/* Canvas */}
        <div className="relative border border-[var(--border)] rounded-[var(--radius)] bg-[var(--card)] shadow-sm overflow-hidden min-h-[220px] sm:min-h-[280px] flex items-center justify-center">
          {renderCanvas()}
        </div>
      </div>

      {/* Gallery */}
      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Your gallery</h2>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Every image you’ve generated
            </div>
          </div>
          <span className="shrink-0 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
            {list.length} IMAGE{list.length === 1 ? '' : 'S'}
          </span>
        </div>

        {images.isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : images.isError ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Couldn’t load your gallery.</p>
              <button
                type="button"
                onClick={() => images.refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
              >
                Try again
              </button>
            </div>
          </div>
        ) : list.length === 0 ? (
          <Empty icon={ImageIcon} title="A blank canvas" copy="Your first generated image will live here." />
        ) : (
          <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {list.map((img) => (
              <GalleryCard
                key={img.id}
                image={img}
                onDelete={handleDelete}
                deleting={remove.isPending && remove.variables === img.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ImageStudio;
