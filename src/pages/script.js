window.moveSlide = function(direction) {
    const slider = document.querySelector('.menu-wrapper');
    const scrollAmount = 320;
    if (slider) {
        if (direction === 1) {
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
            slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    } else {
        console.error("Elemen slider tidak ditemukan! Pastikan class menu-wrapper sudah benar.");
    }
}

window.openRating = function(menuName) {
    document.getElementById('menuTitle').innerText = `Nilai ${menuName}!`;
    document.getElementById('ratingModal').classList.add('show');
}

window.closeRating = function() {
    document.getElementById('ratingModal').classList.remove('show');
}

window.initStars = function() {
    const stars = document.querySelectorAll('.star-select span');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = star.getAttribute('data-rate');
            stars.forEach(s => {
                if (s.getAttribute('data-rate') <= val) {
                    s.classList.add('active');
                    s.innerText = '★';
                } else {
                    s.classList.remove('active');
                    s.innerText = '☆';
                }
            });
        });
    });
}

window.toggleChat = function() {
    const chat = document.getElementById('chatPopup');
    chat.classList.toggle('show');
}

window.onclick = function(event) {
    const modal = document.getElementById('ratingModal');
    if (event.target == modal) {
        window.closeRating();
    }
}

