# Updating the TEDxKigali website

You do not need to write code to update this website. Everything is done through
a form-based editor called **Pages CMS**.

## 1. Signing in

1. Go to <https://app.pagescms.org>.
2. Click **Sign in with GitHub** and use the GitHub account you were given access with.
3. Open the **tedxkigali** project.

You will see five sections: **Events**, **Talks**, **Speakers**, **Partners** and
**Site texts**.

## 2. Adding a talk

1. Open **Talks** and click **Add an entry**.
2. Fill in the required fields:
   - **Talk title** — exactly as it appears on stage.
   - **Speaker name**.
   - **YouTube link** — open the talk on YouTube, copy the link from your browser's
     address bar and paste it here. Any YouTube link works.
   - **Talk date**.
3. Optional fields you will normally still want to set:
   - **Event edition** — pick the edition this talk belongs to from the list. If
     the edition you need is not there yet, save the event first (see section 3),
     then come back and set this field.
   - **Short summary** — one or two sentences, max 300 characters.
   - **Show on the home page** — turn on for the three or four talks you want to
     highlight first.
   - **Tags** — optional keywords used to filter the talks page, for example:
     *community*, *climate*, *public speaking*. You can leave this empty.
   - **Cover image** — leave empty unless you want a custom cover: by default the
     site uses YouTube's own preview image. If you do upload one, you must also
     fill in **Cover image description** — a short description read aloud to
     visitors who use a screen reader.
4. Click **Save**.

The talk appears on the website about one minute later.

## 3. Adding an event

1. Open **Events** and click **Add an entry**.
2. Fill in the required fields:
   - **Event title**.
   - **Start date and time** — enter the time as it will show on a clock in
     Kigali. **If you are editing from outside Rwanda, check the saved value
     ends in `+02:00`** — that is Kigali's time zone offset, and if it is
     different the event will show at the wrong time on the website.
   - **Venue**.
   - **Short summary** — max 300 characters. Shown in listings and when the
     page is shared.
   - **Ticket status** — see step 4 below for what each option means.
3. Optional fields you may also want to set:
   - **End date and time** — if you leave this empty, the website assumes the
     event lasts four hours.
   - **Address** — the website builds its own "open in Google Maps" link from
     the venue and address, so you do not need to go and find a map link
     yourself.
   - **Exact map link (optional)** — leave this empty unless you have checked
     that searching for the venue and address sends people to the wrong
     place. Only then, paste the correct Google Maps link here.
   - **Edition theme** — one or two words, for example: *Rising*.
   - **Event image** — if you upload one, you must also fill in **Image
     description** (screen reader text).
   - **Full description** — the main body text of the event page. Use this for
     anything that does not fit in the short summary.
4. Choose the **Ticket status** (this field is required):
   - *Tickets coming soon* — the event is announced, no booking button yet.
   - *Tickets on sale* / *Free entry — registration required* — a booking
     button appears. **A booking link is required.**
   - *Sold out* / *Registrations closed* — no booking button.
5. If you chose **Tickets on sale** or **Free entry — registration required**,
   paste the **Booking link** from your ticketing platform (Eventbrite, a Google
   Form, or anything else) — it opens in a new tab. You can also change the
   **Booking button text**, which says "Book your seat" unless you change it.
   Skip this step for the other ticket statuses.
6. Click **Save**.

The event moves from *Upcoming* to *Past editions* by itself once it is over. You
do not need to do anything.

Tip: both talks and events have a **Hide from the website** toggle. Turn it on to
take an entry off the site temporarily without deleting it (for example, to
postpone an event) — turn it off again to bring it back.

One thing to know before you hide an event: if any visible talk is linked to
that edition, the rebuild stops and tells you which talk it is. That is on
purpose — the talk would otherwise advertise an edition nobody can open. Either
hide those talks too, or leave the event visible.

## 4. Adding a speaker or a partner

Same steps, under **Speakers** and **Partners**. Every uploaded photo needs a short
**Photo description**, and every partner logo needs a **Logo description** — both
are read aloud to visitors who use a screen reader.

## 5. Changing the home page or About text

Open **Site texts**. These fields appear across the whole website, so read them
twice before saving.

- **Short about text** is the paragraph on the home page and at the top of the
  About page.
- **About page text** is the main text of the About page. Leave a blank line
  between two paragraphs to start a new paragraph.

The **TED licence notice** field is required by TED. Change its wording only if
TED itself updates the required text.

## 6. What happens after you press Save

1. Your change is saved to GitHub.
2. The website is rebuilt automatically.
3. About one minute later the change is live. Refresh the page to see it.

## 7. If something goes wrong

If a required field is missing or a link is wrong, the rebuild stops and **the
website keeps showing the previous version** — visitors never see a broken page.
You will receive an email saying the build failed.

What to do:

1. Read the message in the email: it names the file and explains the problem in
   plain English (for example *"YouTube link not recognised"*).
2. Go back into the CMS, open that entry, fix the field, and save again.
3. If you cannot work out what is wrong, contact the site maintainer with a
   screenshot of the email.

## 8. Images

Upload photos that are at most about 2000 pixels wide. The website resizes and
compresses them automatically, but starting from a smaller file keeps the site
fast for visitors on mobile data.
