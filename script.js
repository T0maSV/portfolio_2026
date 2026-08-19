document.addEventListener('DOMContentLoaded', () => {

    // --- Gestion du Smooth Scroll pour la navigation ---
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector(link.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Gestion de la modale de projet ---
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.querySelector('.modal-close');
    const projectTiles = document.querySelectorAll('.project-tile');

    // Fonction pour ouvrir la modale
    const openModal = (tile) => {
        const title = tile.querySelector('h3').innerText;
        const detailsHTML = tile.querySelector('.project-full-details').innerHTML;

        modalTitle.innerText = title;
        modalBody.innerHTML = detailsHTML;

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10); // Pour l'animation
    };

    // Fonction pour fermer la modale
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300); // Attend la fin de l'animation
    };

    // Ajoute les écouteurs d'événements
    projectTiles.forEach(tile => {
        tile.addEventListener('click', () => openModal(tile));
        tile.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                openModal(tile);
            }
        });
    });

    closeModalBtn.addEventListener('click', closeModal);

    // Ferme la modale si on clique sur l'overlay (le fond)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Ferme la modale avec la touche "Echap"
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

});


// --- Gestion de la modale du CV ---
const cvModal = document.getElementById('cv-modal');
const cvLink = document.getElementById('cv-link');
const cvCloseBtn = cvModal.querySelector('.modal-close');
const cvIframe = cvModal.querySelector('iframe');

if (cvLink) { // On vérifie que le lien existe
    cvLink.addEventListener('click', (e) => {
        e.preventDefault(); // Empêche le lien d'ouvrir une nouvelle page

        const pdfPath = cvLink.getAttribute('href');
        cvIframe.setAttribute('src', pdfPath);

        cvModal.style.display = 'flex';
        setTimeout(() => cvModal.classList.add('active'), 10);
    });
}

const closeCvModal = () => {
    cvModal.classList.remove('active');
    setTimeout(() => {
        cvModal.style.display = 'none';
        cvIframe.setAttribute('src', ''); // Vide l'iframe pour stopper le chargement
    }, 300);
};

cvCloseBtn.addEventListener('click', closeCvModal);

cvModal.addEventListener('click', (e) => {
    if (e.target === cvModal) {
        closeCvModal();
    }
});
