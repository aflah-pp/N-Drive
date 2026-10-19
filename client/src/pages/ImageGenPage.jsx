import { Image as ImageIcon, Sparkles, Trash2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import PageHead from './PageHead';

// eslint-disable-next-line no-unused-vars
function Empty({ icon: Icon = ImageIcon, title, copy }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-10 sm:py-14 px-4"
      data-testid="empty-state"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)] mb-3">
        <Icon size={22} />
      </div>
      <h3 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] max-w-xs leading-relaxed">{copy}</p>
    </div>
  );
}

const PALETTES = {
  'art-one':
    'radial-gradient(ellipse at 64% 22%,#ead4a7 0 11%,transparent 12%),linear-gradient(150deg,#6b9082,#d6a67d 47%,#ba6d58)',
  'art-two':
    'radial-gradient(ellipse at 36% 70%,#e7ca9c 0 16%,transparent 17%),linear-gradient(130deg,#d1d7c5,#75988b 44%,#374f4b)',
  'art-three':
    'radial-gradient(ellipse at 65% 32%,#efcba8 0 12%,transparent 13%),linear-gradient(130deg,#798d78,#e9dfc4 48%,#bf7964)',
};

const pickStyle = (i) => ['art-one', 'art-two', 'art-three'][i % 3];

const dummyImages = [
  {
    id: 'img-1',
    title: 'A quiet monsoon morning',
    date: 'Today · 11:08 AM',
    style: 'art-one',
  },
  {
    id: 'img-2',
    title: 'Objects in soft light',
    date: 'Yesterday · 4:42 PM',
    style: 'art-two',
  },
  {
    id: 'img-3',
    title: 'The botanical archive',
    date: 'May 12 · 2:17 PM',
    style: 'art-three',
  },
  {
    id: 'img-4',
    title: 'Terracotta rooftops at dusk',
    date: 'May 10 · 9:31 AM',
    style: 'art-one',
  },
  {
    id: 'img-5',
    title: 'Jade skies over old Mumbai',
    date: 'May 8 · 3:55 PM',
    style: 'art-two',
  },
];

function GalleryCard({ image, index, onDelete }) {
  const klass = image.style ?? pickStyle(index);

  return (
    <div
      className="group border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      data-testid={`card-generated-${image.id}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: PALETTES[klass] }}>
        <div
          className="absolute w-[38%] h-[120%] left-[37%] top-[-18%] rounded-[45%_45%_10%_10%] bg-white/40 rotate-[16deg]"
          aria-hidden="true"
        />
        <div
          className="absolute w-[24%] h-[70%] left-[19%] bottom-[-18%] rounded-t-full bg-black/30"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => onDelete(image.id)}
          aria-label={`Delete ${image.title}`}
          data-testid={`button-delete-image-${image.id}`}
          className="absolute right-2 top-2 inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/80 text-slate-800 hover:bg-white hover:text-red-600 backdrop-blur-sm transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 active:scale-95"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="p-2.5 sm:p-3">
        <strong className="block font-semibold font-manrope text-[11px] sm:text-xs text-[var(--foreground)] truncate">
          {image.title}
        </strong>
        <span className="block text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">
          {image.date} · local preview
        </span>
      </div>
    </div>
  );
}

const STYLE_CHIPS = ['Editorial illustration', 'Soft daylight', 'Rich texture'];

export function ImagesPage({
  prompt: promptProp,
  setPrompt: setPromptProp,
  images: imagesProp,
  onGenerate: onGenerateProp,
  onDelete: onDeleteProp,
}) {
  const isControlled =
    Array.isArray(imagesProp) &&
    typeof setPromptProp === 'function' &&
    typeof onGenerateProp === 'function' &&
    typeof onDeleteProp === 'function';

  const [localPrompt, setLocalPrompt] = useState('');
  const [localImages, setLocalImages] = useState(dummyImages);

  const prompt = isControlled ? promptProp : localPrompt;
  const setPrompt = isControlled ? setPromptProp : setLocalPrompt;
  const images = isControlled ? imagesProp : localImages;

  const handleGenerate = () => {
    if (isControlled) {
      onGenerateProp();
      return;
    }
    const text = (localPrompt || '').trim();
    if (!text) return;
    setLocalImages((old) => [
      {
        id: `img-${Date.now()}`,
        title: text,
        date: 'Just now · demo preview',
        style: pickStyle(old.length),
      },
      ...old,
    ]);
    setLocalPrompt('');
  };

  const handleDelete = (id) => {
    if (isControlled) {
      onDeleteProp(id);
      return;
    }
    setLocalImages((old) => old.filter((img) => img.id !== id));
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[calc(100dvh-10rem)] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col text-[var(--foreground)] bg-[var(--background)] antialiased">
      <PageHead
        eyebrow="Make a little magic"
        title="Image studio"
        subtitle="Describe a scene. Shape a direction. Keep the previews that spark something."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 shrink-0">
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
            data-testid="input-image-prompt"
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[12px] sm:text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow"
          />

          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2.5 mb-4">
            {STYLE_CHIPS.map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => setPrompt((old) => (old ? `${old}, ${t.toLowerCase()}` : t))}
                data-testid={`button-prompt-style-${i}`}
                className="text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-[0.97]"
              >
                + {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt?.trim()}
            data-testid="button-generate-image"
            className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto self-start px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Wand2 size={14} /> Generate preview
          </button>

          <div className="mt-3 text-[10px] sm:text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/60 border border-[var(--border)] rounded-md px-2 py-1.5 leading-tight">
            Local preview only · This button does not call an image model or create a real generated image.
          </div>
        </section>

        <div
          className="relative border border-[var(--border)] rounded-[var(--radius)] bg-[var(--card)] shadow-sm overflow-hidden min-h-[220px] sm:min-h-[280px] flex items-center justify-center"
          data-testid="image-preview-area"
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: PALETTES['art-two'],
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
              Write a prompt and create a small local preview card in your gallery.
            </p>
          </div>
        </div>
      </div>

      <section className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h2 className="font-bold font-manrope text-sm sm:text-base text-[var(--foreground)]">Your gallery</h2>
            <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5">
              A collection of local demo previews
            </div>
          </div>
          <span className="shrink-0 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
            {images.length} IMAGE{images.length === 1 ? '' : 'S'}
          </span>
        </div>

        {images.length === 0 ? (
          <Empty icon={ImageIcon} title="A blank canvas" copy="Your first image preview will live here." />
        ) : (
          <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {images.map((img, i) => (
              <GalleryCard key={img.id} image={img} index={i} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ImagesPage;
