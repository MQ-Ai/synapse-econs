# Switching on sign-up and tracking (about 5 minutes)

1. Create a new Google Sheet, for example "Synapse Econs users". Keep it private.
2. In the sheet choose **Extensions → Apps Script**, delete the sample code, paste in everything from `apps-script.gs`, and click **Save**.
3. Choose **Deploy → New deployment**, click the gear and pick **Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** and approve the permissions Google asks for.
4. Copy the **Web app URL** (it ends in `/exec`) and put it in `assets/config.js` as `endpoint`. Optionally add a `contact` email to show on the form for questions and deletion requests.
   (Students get one free question; the form appears when they try to answer a second.)
5. Push the change. Open the live site in a private window, answer one question, then try a second: the form should appear. Sign up with a test name, finish a round in any lab, and check that rows appear in the `Signups` and `Events` tabs.

If you change `apps-script.gs` later, use **Deploy → Manage deployments → edit → New version** so the same URL keeps working.

## What is collected and where it lives
- Signups tab: name, school, level, email (the consent columns stay blank). Events tab: page, lab, set, score and time, linked to the signup by a random `uid`. Nothing else.
- It lives only in your Google Sheet. The public web app can add rows but cannot read any.
- Once signed up, students cannot edit or delete their details on the site. To see, correct or delete them they email the contact address shown on the form (`contact` in `assets/config.js`). Find the row by email in Signups and delete it. Their Events rows then no longer link to a name.

## Before students use it
The form no longer has an agreement tick box or a skip button. It still carries a short line saying what the details are used for. Students are mostly minors in Singapore, so please check with your school whoever handles PDPA that this is enough (notification of purpose, retention, who sees the data), and set `contact` so students know who to ask.

# Switching on passes (payments)

Until the Payment Links are pasted into `assets/config.js`, nothing changes for users: everything stays free after sign-in. Synapse Tamil uses the same script and the same steps.

## How it works
- After sign-in, each lab section is free until its first round is finished. Exam papers need a pass, and in Econs only the first Data case is free. The free count is kept in the browser.
- The pay screen offers two one-off passes through Stripe Payment Links (PayNow or card). Tamil also shows "Ask a parent to pay" with a WhatsApp link that sends the pay link to a parent.
- After paying, Stripe sends the buyer back to the site with the checkout id. The site asks this script, the script asks Stripe whether it was paid, writes a row to `Payments`, and the device unlocks. If a parent pays on their own phone, the pass goes to the child's device, which unlocks the next time it opens the site.
- Every 10 minutes the script also collects paid checkouts from Stripe, in case someone closed the tab before coming back.
- On another device, "Unlock this one" emails a 6-digit code (from your Gmail) to the email used at checkout. Each pass works on up to 3 devices; see the `Devices` tab.

## One-time setup (about 30 minutes plus Stripe's identity check)
1. **Stripe account.** Sign up at stripe.com as a Singapore business (sole proprietor is fine). Under **Settings → Payment methods**, turn on **PayNow** and cards.
2. **Products and links.** Create four Payment Links, one per pass, in SGD:
   | App | Pass | Price | After payment, redirect to |
   | --- | --- | --- | --- |
   | Synapse Tamil | Exam-year pass (to 31 Dec 2027) | 49.00 | `https://synapse-tamil.vercel.app/?paid={CHECKOUT_SESSION_ID}` |
   | Synapse Tamil | 30-day pass | 12.00 | same as above |
   | Synapse Econs | Exam-year pass (to 31 Dec 2027) | 69.00 | `https://synapse-econs.vercel.app/?paid={CHECKOUT_SESSION_ID}` |
   | Synapse Econs | 30-day pass | 15.00 | same as above |

   For each link: **After payment → Don't show confirmation page → Redirect** to the address above, typed exactly, including `{CHECKOUT_SESSION_ID}`. Leave quantity fixed at 1 and promotion codes off. The script tells the passes apart by price, so every price must be different.
3. **Key for the script.** In Stripe, **Developers → API keys → Create restricted key**. Give it **Read** on **Checkout Sessions** and nothing else. In the Apps Script editor open **Project Settings → Script Properties**, add `STRIPE_KEY` with that key. Never put it in the website.
4. **Update the script.** Paste the new `apps-script.gs` and **Deploy → Manage deployments → edit → New version** (same URL). Then select `installSync` in the editor's function menu and click **Run**. Approve the new permissions (Stripe access, sending email, timed runs).
5. **Paste the links.** Put each Payment Link (`https://buy.stripe.com/...`) into `link` in each site's `assets/config.js`, then deploy.
6. **Test with real money.** Buy a 30-day pass with PayNow, check that the site unlocks and a row appears in `Payments`, then refund it in Stripe and set that row's status to `refunded`.

## Running it
- **Refunds:** refund in the Stripe dashboard, then type `refunded` in the row's `status` cell in `Payments`. The pass stops on its devices within a day.
- **More devices for one family:** add a row to `Devices` with the same `session` and the new device's id, or ask me to raise `MAX_DEVICES`.
- **Changing prices or the end date:** change the Payment Link in Stripe, `PASSES` at the top of the pass section in `apps-script.gs`, and `price` / `until` in `assets/config.js`, all together.
- Email codes come from your Gmail; Google allows about 100 a day on a personal account.
