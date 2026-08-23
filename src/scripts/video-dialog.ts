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

// Two known edges, both accepted rather than overlooked.
//
// On a desktop browser that reserves a scrollbar gutter, hiding the overflow
// takes the scrollbar away and the page behind the dialog shifts by its width
// for as long as the player is open. Compensating for it means measuring the
// gutter and padding the body, which is more moving parts than a shift nobody
// is looking at during a video.
//
// On iOS Safari `overflow: hidden` on the root is not a reliable lock: a touch
// drag can still rubber-band the page. The fix that does work there is
// position: fixed on the body plus restoring the scroll position afterwards,
// which is exactly the code that loses a reader's place when it goes wrong. The
// mobile audit could not test on iOS, so nothing here is written against a
// device nobody has held.
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
