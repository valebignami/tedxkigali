# Updating the TEDxKigali website

You do not need to write code to update this website. Everything is done through
a form-based editor called **Pages CMS**.

## 1. Signing in

1. Go to <https://app.pagescms.org>.
2. Click **Sign in with GitHub** and use the GitHub account you were given access with.
3. Open the **tedxkigali** project.

You will see five sections: **Events**, **Talks**, **Speakers**, **Partners** and
**Site texts**.

Each section below lists the fields in the order the form puts them, so you can
work down the page.

## 2. Adding a talk

1. Open **Talks** and start a new entry.
2. Fill in the fields, from the top:
   - **Talk title** (required) — exactly as it appears on stage.
   - **Speaker name** (required).
   - **YouTube link** (required) — open the talk on YouTube, copy the link from
     your browser's address bar and paste it here. It has to be a link to one
     video. A playlist, a channel page, a `music.youtube.com` link, or anything
     copied out of YouTube Studio will be refused. Short `youtu.be` links, links
     with a time in them, Shorts and live recordings are all fine.
   - **Talk date** (required).
   - **Event edition** — pick the edition this talk belongs to from the list. If
     the edition you need is not there yet, save the event first (see section 3),
     then come back and set this field.
   - **Short summary** — one or two sentences, at most 300 characters.
   - **Cover image** — leave empty unless you want a custom cover: by default the
     site uses YouTube's own preview image. If you do upload one, you must also
     fill in **Cover image description** — a short description read aloud to
     visitors who use a screen reader.
   - **Show on the home page** — turn on for the three or four talks you want to
     highlight first.
   - **Tags** — optional keywords used to filter the talks page, for example:
     *community*, *climate*, *public speaking*. You can leave this empty.
3. Click **Save**.

## 3. Adding an event

1. Open **Events** and start a new entry.
2. Fill in the fields, from the top. Five of them are required: **Event title**,
   **Start date and time**, **Venue**, **Short summary** and **Ticket status**.
   - **Event title** (required).
   - **Start date and time** (required) — enter the time as it will show on a
     clock in Kigali. The time you pick is saved together with the time zone of
     the computer you are sitting at, so **set that computer's clock to Kigali
     time before you edit**. If you forget, the website will not publish the
     wrong hour: the rebuild stops and tells you (see section 8).
   - **End date and time** — if you leave this empty, the website assumes the
     event lasts four hours. Same rule about your computer's clock. It has to be
     after the start; if it is not, the rebuild stops.
   - **Venue** (required).
   - **Address** — the website builds its own "open in Google Maps" link from
     the venue and address, so you do not need to go and find a map link
     yourself.
   - **Map link** — leave this empty unless you have checked that searching for
     the venue and address sends people to the wrong place. Only then, open the
     right place in Google Maps and copy the link out of your browser's address
     bar. Do not use the **Share** button: the short link it gives you is not
     guaranteed to keep working.
   - **Event image** — if you upload one, you must also fill in **Image
     description** (read aloud to visitors who use a screen reader).
   - **Edition theme** — one or two words, for example: *Rising*.
   - **Short summary** (required) — at most 300 characters. Shown in listings and
     when the page is shared.
   - **Ticket status** (required) — see step 3 below for what each option means.
   - **Booking link** — see step 4.
   - **Booking button text** — says "Book your seat" unless you change it.
   - **Programme** — the running order of the day. Add one row for each thing
     that happens: a welcome, a talk, a break, anything. These rows live inside
     the event you are already editing — you are not creating another event.
     Fill in **What happens** (required) and, if you have them, **Time**,
     **Speaker** and **Note**. Rows appear on the website in the order you put
     them in here and the website never reorders them for you, so move them
     around until the order matches the day. A row with no time is fine; that is
     how you add a break like lunch or a coffee break, which does not have a
     speaker either. If you do fill in **Time**, write it as a 24-hour time, for
     example `09:00`, or a range like `09:00 - 09:20`. Anything else (an
     "am"/"pm" time, or a time with a full stop instead of a colon) will stop the
     rebuild — see section 8 for what happens next.
   - **Full description** — the main body text of the event page. Use this for
     anything that does not fit in the short summary.
3. Choose the **Ticket status** (this field is required):
   - *Tickets coming soon* — the event is announced, no booking button yet.
   - *Tickets on sale* / *Free entry — registration required* — a booking
     button appears. **A booking link is required.**
   - *Sold out* / *Registrations closed* — no booking button.
4. If you chose **Tickets on sale** or **Free entry — registration required**,
   paste the **Booking link** from your ticketing platform (Eventbrite, a Google
   Form, or anything else) — it opens in a new tab. Skip this step for the other
   ticket statuses.
5. Click **Save**.

The event moves from *Upcoming* to *Past editions* by itself once it is over. You
do not need to do anything.

Tip: both talks and events have a **Hide from the website** toggle. Turn it on to
take an entry off the site temporarily without deleting it (for example, to
postpone an event) — turn it off again to bring it back.

One thing to know before you hide an event: if any visible talk is linked to
that edition, the rebuild stops and tells you which talk it is. That is on
purpose — the talk would otherwise advertise an edition nobody can open. Either
hide those talks too, or leave the event visible.

## 4. Adding a speaker

Open **Speakers** and start a new entry. The fields, from the top:

- **Full name** (required) — as it should appear on the speakers page.
- **Role or organisation** — shown under the name, for example *Environmental
  researcher, University of Rwanda*.
- **Photo** — if you upload one, you must also fill in **Photo description**, a
  short description read aloud to visitors who use a screen reader.
- **Their talk** — the talk this person gave, picked from the list. It puts a
  "Watch the talk" button on their card. Add the talk under **Talks** first.
  Do not delete a talk that is still chosen here: empty this field first, or the
  rebuild stops.
- **Links** — where else to find this person. Each row needs a **Name** (for
  example *LinkedIn*) and a complete **Link** starting with `https://`.
- **Display order** — who comes first on the speakers page. The lowest number is
  first; anyone you leave empty comes after everyone with a number. Number them
  in tens — 10, 20, 30 — so you can slot somebody in later without renumbering
  everyone else.
- **Hide from the website** — as for talks and events.
- **Short biography** — a paragraph or two, shown on the speaker's card.

## 5. Adding a partner or sponsor

Open **Partners** and start a new entry. **Four fields are required**, which is
more than anywhere else on the site:

- **Organisation name** (required).
- **Logo** (required) — a PNG or an SVG with a transparent background works
  best. This is the only image on the whole site you cannot leave empty.
- **Logo description** (required) — for example *Acme Ltd logo*. Read aloud to
  visitors who use a screen reader.
- **Website** — the complete address, starting with `https://`. The logo becomes
  a link to it.
- **Partner level** (required) — this decides which block of the Partners page
  the logo appears in. The four choices produce the headings **Headline
  partner**, **Gold partners**, **Partners** and **Community partners**, in that
  order down the page, with the largest logos at the top.
- **Display order** — who comes first inside that block. Same rule as for
  speakers: lowest number first, empty last, number in tens.
- **Hide from the website** — as everywhere else.

## 6. Changing the home page or About text

Open **Site texts**. These fields appear across the whole website, so read them
twice before saving. Every one of them is required — none can be left empty.

- **Short about text** is the paragraph on the home page and at the top of the
  About page.
- **About page text** is the main text of the About page. Leave a blank line
  between two paragraphs to start a new paragraph.
- **Search engine description** is the sentence Google and social networks show
  under the name of the site. At most 300 characters.

The **TED licence notice** field is required by TED. Change its wording only if
TED itself updates the required text.

## 7. What happens after you press Save

1. Your change is saved to GitHub.
2. The website rebuilds itself and publishes the new version.
3. Refresh the page to see it.

If the rebuild stops because something is wrong, nothing is lost and nothing
breaks: your change is safely saved, and the website goes on showing the last
version that worked. Visitors never see a broken page.

## 8. If something goes wrong

**How you find out.** Look at the website a few minutes after you save. If your
change is not there, the rebuild stopped.

Before you start editing, ask the site maintainer to set up a failure email to
your address, and to test it once with you. Until you have seen one arrive, do
not count on being told — check the site yourself after each save.

**What to do:**

1. If a failure email reached you, read the message in it. It says what is wrong
   in plain English and what to do about it, for example *"YouTube link not
   recognised. Copy the full link from your browser address bar"*, or *"This
   event has no venue. Write the name of the place it happens"*.
2. Go back into the CMS, open that entry, fix the field, and save again.
3. If no email reached you, or you cannot work out what is wrong, contact the
   site maintainer. Tell them which entry you saved and roughly when — the
   message is waiting for them in the build record. A screenshot of the email,
   if you have one, saves them a step.

## 9. Images

**File types.** JPG, PNG, WEBP, AVIF and SVG. Capital letters in the file name
or the extension are fine, and so are spaces and accents: `IMG_1234.JPG` and
`café — 2026.jpeg` both work.

HEIC is not on the list, and it is what an iPhone camera saves by default, so an
iPhone photo has to be turned into a JPG before you upload it. Your phone's
camera settings can be changed to take photos as JPG from then on; for photos
you already have, whoever gave you the photo can usually re-export them.

**Size.** Upload photos that are at most about 2000 pixels wide. The website
resizes and compresses them automatically, but starting from a smaller file keeps
the site fast for visitors on mobile data.

**One warning.** Renaming a file to end in `.jpg` does not make it a picture. If
a file is not really an image, the rebuild stops with a message that is hard to
read and does not say which entry it belongs to — so if that happens right after
you uploaded something, tell the maintainer what you uploaded and where.
