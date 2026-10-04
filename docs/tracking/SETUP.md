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
- A student who deletes their details from the site has their Signups row removed automatically. Their old Events rows stay but are no longer linked to a name. Withdrawals logs the id and time only.
- To answer an access or deletion request by email, find the row by email in Signups and delete it.

## Before students use it
The form no longer has an agreement tick box or a skip button. It still carries a short line saying what the details are used for. Students are mostly minors in Singapore, so please check with your school whoever handles PDPA that this is enough (notification of purpose, retention, who sees the data), and set `contact` so students know who to ask.
