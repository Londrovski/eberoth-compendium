// Left drawer collapse toggle. Drawer content (threads + notes) is
// wired by their own modules.
(function () {
  EB.initDrawer = function () {
    var drawer = document.getElementById('drawer');
    var toggle = document.getElementById('drawerToggle');
    toggle.onclick = function () {
      drawer.classList.toggle('collapsed');
      var collapsed = drawer.classList.contains('collapsed');
      toggle.textContent = collapsed ? '▶' : '◀';
      toggle.style.left = collapsed ? '0px' : '340px';
    };
  };
})();
