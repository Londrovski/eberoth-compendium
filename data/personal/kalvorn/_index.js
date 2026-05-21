// Kalvorn's personal compendium and notes self-register here.
// Each leaf file pushes into KALVORN_COMPENDIUM or KALVORN_NOTES.
// This file then assembles them into KALVORN_PERSONAL.

window.KALVORN_COMPENDIUM = window.KALVORN_COMPENDIUM || [];
window.KALVORN_NOTES = window.KALVORN_NOTES || [];

(window.PERSONAL_NOTES = window.PERSONAL_NOTES || []).push({
  playerId: 'kalvorn',
  passphrase: 'MAREN',
  compendium: window.KALVORN_COMPENDIUM,
  notes: window.KALVORN_NOTES
});
