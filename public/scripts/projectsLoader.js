async function init() {
    const dropdownsParent = document.getElementById("filterDropdowns");
    const projectCardsParent = document.getElementById("projectsGrid");

    if (!dropdownsParent) return;

    const filters = await fetch('/filters.json').then(r => r.json());
    const index = await fetch('/pointer.json').then(r => r.json());
    const projects = await Promise.all(
        index.map(file => fetch(`/projects/${file}`).then(r => r.json()))
    );

    dropdownsParent.innerHTML = '';
    projectCardsParent.innerHTML = '';

    let current_filters = {};

    function createDroplist(title) {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';

        const header = document.createElement('div');
        header.className = 'dropdown-header';
        header.innerHTML = `<span class="label">${title}</span><span class="arrow">&gt;</span>`;

        const list = document.createElement('div');
        list.className = 'dropdown-list';

        dropdown.appendChild(header);
        dropdown.appendChild(list);
        dropdownsParent.appendChild(dropdown);

        header.addEventListener('click', () => {
            dropdown.classList.toggle('open');
        });

        return [dropdown, header, list];
    }

    function createBox(targetParent, title) {
        const box = document.createElement('div');
        box.className = 'filterBox';
        box.id = title;
        box.innerHTML = `<span>${title}</span>`;

        targetParent.appendChild(box);

        return box;
    }

    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.id = project.name;
        if (project.featured) card.classList.add('featured');

        card.innerHTML = `
            <div class="project-header">
                <span class="project-name">${project.name}</span>
                <span class="project-date">${project.date}</span>
            </div>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="project-description">${project.description}</div>
            <div class="project-footer">
                <span class="project-duration">${project.duration ?? ''}</span>
                <div class="project-links">
                    ${project.links.map(l => `<a href="${l.link}" class="project-link" target="_blank" rel="noopener noreferrer">${l.name} ↗</a>`).join('')}
                </div>
            </div>
        `;

        card.style.opacity = '0';
        card.style.transform = 'translateY(4px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        projectCardsParent.appendChild(card);

        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });

        projectCardsParent.appendChild(card);
        return card;
    }

    function removeCard(card) {
        card.style.maxHeight = card.scrollHeight + 'px';
        card.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease, max-height 0.4s ease, margin-bottom 0.4s ease, padding 0.4s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(-4px)';
                card.style.maxHeight = '0';
                card.style.marginBottom = '0';
                card.style.paddingTop = '0';
                card.style.paddingBottom = '0';
            });
        });

        setTimeout(() => card.remove(), 400);
    }

    function showEmptyMessage() {
        if (document.getElementById('no-projects')) return;
        const msg = document.createElement('div');
        msg.id = 'no-projects';
        msg.style.cssText = `
        color: #3d444d;
        font-size: 13px;
        text-align: center;
        margin-top: 40px;
        width: 100%;
    `;
        msg.textContent = "can't find such projects ):";
        projectCardsParent.appendChild(msg);
    }

    function hideEmptyMessage() {
        const msg = document.getElementById('no-projects');
        if (msg) msg.remove();
    }

    function updateProjects() {
        for (const project of projects) {
            const anyFilterActive = Object.values(current_filters).some(v => v === true);
            const fits_in = !anyFilterActive || project.tags.some(tag => current_filters[tag] === true);
            const cardExists = document.getElementById(project.name);

            if (fits_in && !cardExists) {
                hideEmptyMessage();
                createProjectCard(project);
            } else if (!fits_in && cardExists) {
                removeCard(cardExists);
            }
        }

        // check after animations settle
        setTimeout(() => {
            const hasCards = projects.some(p => document.getElementById(p.name));
            if (!hasCards) showEmptyMessage();
            else hideEmptyMessage();
        }, 420);
    }

    for (const [_, data] of Object.entries(filters)) {
        const title = data.title;
        const content = data.content;

        const [dropdown, header, list] = createDroplist(title);

        for (const item of content) {
            current_filters[item] = false;

            const box = createBox(list, item);

            box.addEventListener('click', (e) => {
                e.stopPropagation();
                box.classList.toggle('active');
                current_filters[item] = !current_filters[item];
                updateProjects();
            });
        }
    }

    for (const project of projects) {
        createProjectCard(project);
    }
}

document.addEventListener('astro:page-load', init);