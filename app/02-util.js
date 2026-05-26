(function () {
  EB.escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  };
  EB.escapeAttr = function (s) {
    return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
  };
  EB.initials = function (name) {
    return String(name || '').split(' ').filter(Boolean).map(function (s) { return s[0]; }).slice(0, 2).join('');
  };
})();
