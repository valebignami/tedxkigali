import { youtubeEmbedUrl } from '~/lib/youtube';

const dialog = document.querySelector<HTMLDialogElement>('#video-dialog');
const frame = document.querySelector<HTMLElement>('#video-dialog-frame');
const heading = document.querySelector<HTMLElement>('#video-dialog-title');

function openVideo(id: string, title: string): void {
  if (!dialog || !frame) return;

  if (heading) heading.textContent = title;

  const iframe = document.createElement('iframe');
  iframe.src = youtubeEmbedUrl(id);
  iframe.title = title;
  iframe.className = 'h-full w-full';
  iframe.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';

  frame.replaceChildren(iframe);
  dialog.showModal();
  // showModal() makes the page inert but does not stop it scrolling, so without
  // this the talk slides out from under the player on a wheel or a swipe.
  lockScroll();
}

let scrollLock: string | null = null;

function lockScroll(): void {
  scrollLock = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
}

function releaseScroll(): void {
  if (scrollLock === null) return;
  document.documentElement.style.overflow = scrollLock;
  scrollLock = null;
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const trigger = target?.closest<HTMLElement>('[data-youtube-id]');
  if (!trigger) return;

  const id = trigger.dataset.youtubeId;
  if (!id) return;

  event.preventDefault();
  openVideo(id, trigger.dataset.videoTitle ?? 'TEDxKigali talk');
});

// Clicking the backdrop closes the dialog.
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

dialog?.querySelector('[data-close-video]')?.addEventListener('click', () => dialog.close());

// Removing the iframe is what actually stops the audio.
dialog?.addEventListener('close', () => {
  frame?.replaceChildren();
  releaseScroll();
});
