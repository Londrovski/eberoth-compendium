// Renders <img> if image is provided, with inline onerror that swaps
// in initials. Same trick used for faction sigils. Keeps the renderer
// synchronous — no async/await dance for images.
(function () {
  EB.portraitHTML = function (entity, fallbackGlyph) {
    var fallback = fallbackGlyph != null ? fallbackGlyph : EB.initials(entity.name);
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
      return '<img src="' + src + '" alt="' + alt + '" onerror="this.parentElement.innerHTML=\'' + EB.escapeAttr(faction.name) + '\'">';
    }
    return faction.name;
  };
})();
