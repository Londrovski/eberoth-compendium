// House tinting based on current node position, not factionId. Drag
// an NPC into another house's grid and they read as that house —
// position becomes a form of in-fiction annotation.
(function () {
  EB.applyHouseTints = function () {
    var L = EB.LAYOUT;
    var houses = ['halvorn', 'gorrund', 'corvath', 'voss'];
    var def = EB.defaultLayout();
    var zones = houses.map(function (hid) {
      var base = def[hid];
      if (!base) return null;
      return {
        hid: hid,
        x0: base.x - L.houseGridGapX / 2 - 60,
        x1: base.x + L.houseGridGapX / 2 + 60,
        y0: L.houseGridY - 80,
        y1: L.houseGridY + 3 * L.houseGridGapY + 80
      };
    }).filter(Boolean);

    Array.prototype.forEach.call(EB.canvas.querySelectorAll('.node-npc'), function (el) {
      houses.forEach(function (h) { el.classList.remove('in-' + h); });
      var x = parseFloat(el.style.left);
      var y = parseFloat(el.style.top);
      var zone = zones.find(function (z) { return x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1; });
      if (zone) el.classList.add('in-' + zone.hid);
    });
  };
})();
