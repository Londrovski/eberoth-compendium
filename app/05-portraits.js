// Renders <img> if image is provided, with inline onerror that swaps
// in a fallback glyph. Same trick used for faction sigils. Keeps the
// renderer synchronous — no async/await dance for images.
//
// Default fallback for entities without an image is a bold golden '?'
// (rendered as a span so CSS can style it). Pass a custom fallbackGlyph
// to override (e.g. '◈' for lore, faction name text for sigils).
(function () {
  var MISSING = '<span class="portrait-missing">?</span>';

  EB.portraitHTML = function (entity, fallbackGlyph) {
    var fallback = fallbackGlyph != null ? fallbackGlyph : MISSING;
    if (entity.image) {
      var src = EB.escapeAttr(entity.image);
      var alt = EB.escapeAttr(entity.name);
      return '<img src="' + src + '" alt="' + alt + '" onerror="this.parentElement.innerHTML=\'' + EB.escapeAttr(fallback) + '\'">';
    }
    return fallback;
  };

  EB.factionSigilHTML = function (faction) {
    if (faction.sigil) {
      var src = EB.escapeAttr(faction.sigil);
      var alt = EB.escapeAttr(faction.name);
      return '<img src="' + src + '" alt="' + alt + '" onerror="this.parentElement.innerHTML=\'' + EB.escapeAttr(MISSING) + '\'">';
    }
    return MISSING;
  };
})();
