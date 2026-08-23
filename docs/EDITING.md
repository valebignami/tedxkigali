# Updating the TEDxKigali website

You do not need to write code to update this website. Everything is done through
a form-based editor called **Pages CMS**.

## 1. Signing in

1. Go to **<https://valebignami.github.io/tedxkigali/admin>** — the website's own
   address with `/admin` on the end. It takes you straight to the editing screen,
   so this is the only address you need to remember.
2. Click **Sign in with GitHub** and use the GitHub account you were given access with.

That is all. You land on the **Events** list, already inside the right project.

If that address ever fails, the editing screen itself is at
<https://app.pagescms.org> — sign in there and open the **tedxkigali** project.

Down the left you will see five sections under **Content** — **Events**,
**Talks**, **Speakers**, **Partners** and **Site texts** — and a **Media**
section below them, which holds every picture that has been uploaded.

Each section below lists the fields in the order the form puts them, so you can
work down the page.

**Everything you save is published.** There is no draft copy of the site and no
preview: a save goes live a few minutes later. Every entry has a **Hide from the
website** switch at the bottom of its form — turn it on before you start
practising, and turn it off when you are happy with what you have written. That
is the only safe way to try things out.

## 2. Adding a talk

1. Open **Talks** and start a new entry.
2. Fill in the fields, from the top:
   - **Talk title** (required) — exactly as it appears on stage.
   - **Speaker name** (required) — the full name of the person who gave the
     talk. This is only text. It does not create a page for them: if you want
     this person to appear under **Speakers** too, add them there as well
     (section 4) and write the name the same way in both places. Nothing
     connects the two for you.
   - **YouTube link** (required) — open the talk on YouTube, copy the link from
     your browser's address bar and paste it here. It has to be a link to one
     video. A playlist, a channel page, a `music.youtube.com` link, or anything
     copied out of YouTube Studio will be refused. Short `youtu.be` links, links
     with a time in them, Shorts and live recordings are all fine.
   - **Talk date** (required) — the day of the event where the talk was filmed,
     **not** the day the video was uploaded. It decides the order of the talks
     page and the year printed on the card. The field starts empty on purpose;
     if you try to save without picking a day, the form marks it in red and
     says *Invalid date*, which is its way of saying it is still empty.
   - **Event edition** — pick the edition this talk belongs to from the list.
     You can leave it empty, but then the talk does not appear under any edition
     when visitors filter the talks page. If the edition you need is not there
     yet, save the event first (see section 3), then come back and set this
     field.
   - **Short summary** — one or two sentences. The box stops you at 300
     characters.
   - **Cover image** — leave empty unless you want a custom cover: by default the
     site uses YouTube's own preview image. If you do upload one, you must also
     fill in **Cover image description** — a short description read aloud to
     visitors who use a screen reader.
   - **Show on the home page** — the home page shows **six** talks. Turn this on
     for the ones you want there. If you mark more than six, it shows the six
     most recently dated of them; if you mark none at all, it shows the six most
     recent talks anyway.
   - **Tags** — optional keywords used to filter the talks page, for example:
     *community*, *climate*, *public speaking*. One keyword per row. You can
     leave this empty.
   - **Hide from the website** — see the note at the end of section 1.
3. Click **Save**.

Changing a talk's title later does not rename anything and does not break
anything: the file keeps the name it was given when it was first saved.

## 3. Adding an event

1. Open **Events** and start a new entry.
2. Fill in the fields, from the top. Five of them are required: **Event title**,
   **Start date and time**, **Venue**, **Short summary** and **Ticket status**.
   - **Event title** (required).
   - **Start date and time** (required) — enter the time as it will show on a
     clock in Kigali. **You do not have to convert anything.** Wherever in the
     world you are sitting, and whatever your own computer clock says, the
     website reads what you pick here as Kigali time. Pick 09:00 and the website
     says 09:00. The field starts out filled in with today's date and the
     current time, so change it.
   - **End date and time** — starts empty, and read as Kigali time in the same
     way as the start. If you leave it empty, the website assumes the event
     lasts four hours. It has to be later than the start: if it is the same
     time, or earlier, the rebuild stops and tells you (see section 8).
   - **Venue** (required) — the name of the place, for example *Kigali
     Convention Centre*.
   - **Address** — the street of the venue, for example *KG 2 Roundabout,
     Kigali*. It is printed after the venue on the event page, and the website
     builds its own "open in Google Maps" link out of the two together, so a
     rough address is better than none.
   - **Map link** — leave this empty unless you have checked that the link built
     from the venue and address sends people to the wrong place. Only then, open
     the right place in Google Maps and copy the link out of your browser's
     address bar. Do not use the **Share** button: the short link it gives you
     is not guaranteed to keep working.
   - **Event image** — if you upload one, you must also fill in **Image
     description** (read aloud to visitors who use a screen reader).
   - **Edition theme** — one or two words, for example: *Rising*.
   - **TEDx programme** — which kind of TEDx event this edition is. Leave it
     on *TEDxKigali* unless it is one of the others; see "The five
     programmes" at the end of this section. This is not the running order of
     the day, which is **Programme of the day** further down the same form.
   - **Short summary** (required) — shown in listings and when the page is
     shared. The box stops you at 300 characters.
   - **Ticket status** (required) — see step 3 below for what each option means.
   - **Booking link** — see step 4.
   - **Booking button text** — the words printed on the booking button. It says
     *Book your seat* unless you change it, and if you empty it, it goes back to
     saying *Book your seat*.
   - **Programme of the day** — the running order of the day. Add one row for each thing
     that happens: a welcome, a talk, a break, anything. These rows live inside
     the event you are already editing — you are not creating another event.
     Fill in **What happens** (required) and, if you have them, **Time**,
     **Speaker** and **Note**. Rows appear on the website in the order they are
     in here and the website never reorders them for you. To move a row, drag it
     by the handle — the six dots to the left of the row — and drop it where it
     belongs. A row with no time is fine; that is how you add a break like lunch
     or a coffee break, which does not have a speaker either. If you do fill in
     **Time**, write it as a 24-hour time, for example `09:00`, or a range like
     `09:00 - 09:20`. Anything else (an "am"/"pm" time, or a time with a full
     stop instead of a colon) will stop the rebuild — see section 8 for what
     happens next.
   - **Hide from the website** — see the note at the end of section 1.
   - **Full description** — the main body text of the event page. Use this for
     anything that does not fit in the short summary.
3. Choose the **Ticket status** (this field is required):
   - *Tickets coming soon* — the event is announced, no booking button yet.
   - *Tickets on sale* / *Free entry — registration required* — a booking
     button appears. **A booking link is required.**
   - *Sold out* / *Registrations closed* — no booking button.
4. If you chose **Tickets on sale** or **Free entry — registration required**,
   paste the **Booking link** from your ticketing platform (Eventbrite, a Google
   Form, or anything else) — it opens in a new tab. The form cannot put a
   *Required* mark on that field, because whether it is required depends on the
   ticket status you picked; if you forget it, the rebuild stops and tells you.
   Skip this step for the other ticket statuses.
5. Click **Save**.

The event moves from *Upcoming* to *Past editions* by itself once it is over. You
do not need to do anything.

Tip: **Hide from the website** is also how you take an event off the site
temporarily without deleting it — to postpone it, for instance. Turn it off
again to bring it back.

One thing to know before you hide an event: if any visible talk is linked to
that edition, the rebuild stops and tells you which talk it is. That is on
purpose — the talk would otherwise advertise an edition nobody can open. Either
hide those talks too, or leave the event visible.

### The five programmes

TEDxKigali does not run only one kind of event. Every edition belongs to one of
five programmes, and the **TEDx programme** field is where you say which:

| Choice | What it is |
|---|---|
| **TEDxKigali** | The main edition. This is the right answer for most events. |
| **TEDxKigali Women** | Held alongside TEDWomen, on the ideas and work of women. |
| **TEDxKigali Youth** | Planned and hosted with young people, in their schools and communities. |
| **TEDxKigali Kids** | For younger children and the adults who bring them. |
| **TEDxKigali Countdown** | Part of Countdown, TED's global initiative on the climate crisis. |

You pick from the list and never type a name, and that is deliberate: the name
of a licensed TEDx event is part of its licence, and TED's own rule is that the
programme word comes after the location with a single space — *TEDxKigali
Youth*, not *TEDxYouth@Kigali* and not *TEDx Kigali Youth*. Nobody can mistype
one into a heading on the website.

Picking a programme changes three things, all by itself:

- **Events** groups the past editions under a heading for each programme.
- **Talks** groups the filter buttons the same way — but there is only a
  button for an edition that has talks in it, so this one waits until two
  programmes have a published talk between them.
- **About** gains an "Our programmes" block explaining what each one is.

Each of the three appears only once that page has more than one programme to
tell apart, and a programme joins the About page on the day its first edition
goes live. That is on purpose: a programme named on the About page before it has ever
happened reads to a visitor as a promise that one is coming.

Write the event title with the programme in it — *TEDxKigali Women 2025 — In the
Room* — the same way the main editions are titled. The heading above the group
and the title on the card are both read, and they should agree.

> **One caution about TEDxKigali Kids.** The other four are event types TED
> lists by name. "Kids" is not in that list — the TED programme for young people
> is Youth. It is offered here because it was asked for, but before you publish
> an event under it, check with whoever holds the TEDxKigali licence that it is
> a type you may run. Nothing on the website can check that for you.

## 4. Adding a speaker

Open **Speakers** and start a new entry. This section is separate from
**Talks**: adding a speaker here does not create a talk, and adding a talk does
not create a speaker. Someone who spoke at a TEDxKigali event and whose talk is
on the website usually needs both, with the name written the same way in each.

The fields, from the top:

- **Full name** (required) — as it should appear on the speakers page, and
  exactly as it is written under **Speaker name** in their talk.
- **Role or organisation** — shown under the name, for example *Environmental
  researcher, University of Rwanda*.
- **Photo** — if you upload one, you must also fill in **Photo description**, a
  short description read aloud to visitors who use a screen reader.
- **Their talk** — the talk this person gave, picked from the list. It puts a
  "Watch the talk" button on their card. Add the talk under **Talks** first.
  Do not delete a talk that is still chosen here: empty this field first, or the
  rebuild stops.
- **Links** — where else to find this person. Each row needs a **Name** (for
  example *LinkedIn*, which is the word visitors read and click) and a complete
  **Link** starting with `https://`. The form refuses a link that does not.
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
  a link to it. The form refuses an address that does not start with `https://`.
- **Partner level** (required) — this decides which block of the Partners page
  the logo appears in. The four choices produce the headings **Headline
  partner**, **Gold partners**, **Partners** and **Community partners**, in that
  order down the page, with the largest logos at the top.
- **Display order** — who comes first inside that block. Same rule as for
  speakers: lowest number first, empty last, number in tens.
- **Hide from the website** — as everywhere else.

## 6. Changing the home page or About text

Open **Site texts**. Every field here appears on every page of the website, or on
the home page, so a mistake in this form is a mistake everywhere. Every one of
them is required — none can be left empty.

- **Site name** is the name of the event. It follows the page name in the
  browser tab and in search results, and it is the name shown when somebody
  shares a page.
- **Tagline** is the line after the site name in the browser tab and in search
  results for the home page. It is not printed anywhere on the page itself; it
  is also read aloud after the logo to visitors using a screen reader. If you
  are trying to change the big line on the home page, that is **Home page
  headline**, not this. The two currently hold the same sentence, which makes
  them easy to confuse.
- **Home page headline** is the big line across the top of the home page.
- **Home page intro** is the paragraph under it.
- **Short about text** is the paragraph on the home page and at the top of the
  About page.
- **About page text** is the main text of the About page. Leave a blank line
  between two paragraphs to start a new paragraph.
- **Contact email** is the address printed in the footer of every page.
- **Social links** are the links in the footer. In each row, **Name** is the word
  visitors read and click — *Instagram*, *LinkedIn* — and **Link** is the
  address, starting with `https://`. Do not paste the address into **Name**.
- **Search engine description** is the sentence Google and social networks show
  under the name of the site. At most 300 characters.
- **TED licence notice** is required by TED. Change its wording only if TED
  itself updates the required text.
- **Meaning of the x** is the line that explains the x in TEDx — today, *x =
  independently organized TED event*. It is printed in the footer of every page
  and inside the "What is TEDx?" paragraph on the About page.

## 7. What happens after you press Save

Your change is saved to GitHub the moment you press Save. That part always
happens, and nothing you have typed is lost after it — it stays in the file
exactly as you left it, even if everything below goes wrong.

Every save then starts a rebuild of the website, on its own, with nothing for
you or anybody else to press. It usually takes two or three minutes. Refresh the
page when it is done and your change is there.

If the rebuild stops because something is wrong, nothing is published and the
website goes on showing the last version that worked. Your change is still
saved. Go back into the entry, fix the field, and save again — see section 8.

## 8. If something goes wrong

**How you find out.** You are told. When a rebuild stops, the website's own
repository opens a page on GitHub — GitHub calls it an *issue* — that says what
went wrong, and it writes your name on that page. GitHub emails you as soon as
that happens, at the address on the account you signed in to the CMS with. There
is nothing to switch on: being named on a page is one of the few things GitHub
emails everybody about without being asked.

The subject of the email is always the same sentence:

> The website was not updated — your last save did not go live

Follow the link in it and you land on the page. It looks like this:

> **@your-name — the change just saved has not gone live. The website was not
> updated.**
>
> *"This event ends at the same moment it starts, or earlier. Check the end date
> and time — the same time left in both fields, or a mistyped year, is the usual
> cause — or empty it, and the website will assume four hours."*
>
> It is the entry saved as `tedxkigali-2026`, under **Events** in the CMS.
>
> **Nothing is broken.** The website is still showing exactly what it showed
> before this save, and visitors see a working site. Nothing was published, and
> nothing was damaged. The words that were typed are not lost either: they are
> saved, exactly as they were left.
>
> **What to do.** Open the CMS at https://app.pagescms.org, go back into that
> entry, change what is asked for above, and save. […]

The quoted sentence near the top is the whole of it. It is written for you, it
says which field is wrong and what to do about it, and it is the only part you
have to read. Under it is the name of the entry to go and open — that is the
name of the file, so it may not be quite the title you typed, but it is close
enough to recognise. Everything below that is the same reassurance every time,
and a link to the technical record for whoever maintains the site. There is no
stack trace, no red log and nothing addressed to a programmer.

If more than one thing is wrong with the same entry, all of them are quoted, as
a list. Fix them all before you save.

**What to do:**

1. Read the quoted sentence and note the entry named under it.
2. Go back into the CMS, open that entry, fix the field, and save again.
3. Nothing else. The save starts a new rebuild; if it works, the website
   publishes and that same page closes itself, with one last note on it telling
   you so. You get an email for that too, so you know it went through.

**If it stops again.** You get a new email, but not a new page: the same one is
used for every failed save until one of them works, with your name and the new
message added at the bottom. That is on purpose — one page, however many
attempts, so nobody has to wade through a pile of them.

**If the page says it was not your doing.** Some failures have nothing to do with
what anybody typed. Then the page says so, in those words — *"This is not
something you did wrong"* — and there is no entry to go and fix. Send the link to
whoever maintains the site; everything they need is on it.

**If you would rather look than wait.** Every one of these pages, open and
closed, is listed at
<https://github.com/valebignami/tedxkigali/issues>. If you ever suspect a save
did not land, look there.

**And while any of this is going on**, the website is up and unchanged, showing
the last version that worked. A failed save never takes the site down and never
shows visitors half a page.

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
you upload something that is not really an image, the rebuild stops and names
the file for you:

> The file "poster.jpg" is not a picture, whatever its name says. A file renamed
> to end in .jpg does not become one, and an upload that was cut short does not
> either. Upload the picture again, from the original.

Do that — upload it again from the original file — and save. An upload that was
interrupted halfway looks exactly the same from here, and the same fix works.
