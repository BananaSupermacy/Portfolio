document.addEventListener('astro:page-load', () => {
    const portfolio = document.getElementById('portfolio');
    if (!portfolio) return;

    // reset lines
    document.querySelectorAll('.intro-line').forEach(el => {
        el.classList.remove('visible');
    });

    // if console already minimized (navigating back), show intro directly
    if (sessionStorage.getItem('consoleMinimized') === 'true') {
        portfolio.style.display = 'block';
        portfolio.style.opacity = '1';
        portfolio.classList.add('visible');
        setTimeout(animateIntro, 100);
        return;
    }

    const observer = new MutationObserver(() => {
        if (portfolio.style.display === 'block') {
            portfolio.classList.add('visible');
            observer.disconnect();
            setTimeout(animateIntro, 800);
        }
    });

    observer.observe(portfolio, { attributes: true, attributeFilter: ['style'] });
});

function animateIntro() {
    const lines = document.querySelectorAll('.intro-line');
    lines.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, i * 150);
    });
}