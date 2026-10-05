/* Synapse Econs tracking settings.
   endpoint: the Google Apps Script web app URL (ends in /exec). Leave empty to
             switch sign-up and tracking off completely.
   contact:  optional email shown in the sign-up form for questions or deletion. */
window.SYNAPSE_TRACK = {
  endpoint: 'https://script.google.com/macros/s/AKfycbz1Aqae1AKvq8H6Aqer6UNB8m8zMmyaYU5Ns7arloVjIZdnj80jDha6nz1e6mpHLWKhKw/exec',
  contact: 'sage.synapse@gmail.com'
};

/* Synapse passes (assets/pay.js). Paste each Stripe Payment Link (https://buy.stripe.com/...)
   into `link`. While both links are empty, everything stays free after sign-in.
   The prices here are only what the pay screen shows: the amount charged is set in
   Stripe, and must match PASSES in docs/tracking/apps-script.gs. */
window.SYNAPSE_PAY = {
  app: 'synapse-econs',
  year: { link: '', price: 'S$69', until: '31 Dec 2027' },
  month: { link: '', price: 'S$15' },
  covers: 'every round and every Data case in all five labs',
  short: 'Every lab and Data case',
  parent: false
};
