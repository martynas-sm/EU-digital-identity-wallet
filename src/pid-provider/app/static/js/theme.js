function applyTheme(theme) {
    document.documentElement.setAttribute('theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('theme');
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

(function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('theme', savedTheme);
    } else {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('theme', systemDark ? 'dark' : 'light');
    }
})();
