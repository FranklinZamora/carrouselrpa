const apiUrl = 'https://172.30.4.145:3000/slider-notificaciones/getnotificaciones';
const addApiUrl = 'https://172.30.4.145:3000/slider-notificaciones/addnotificaciones';
const deleteApiUrl = 'https://172.30.4.145:3000/slider-notificaciones/deletenotificaciones';
let currentIndex = 0;

async function fetchNotifications() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        updateCarousel(data);
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function updateCarousel(notifications) {
    const carouselInner = document.querySelector('.carousel-inner');
    const carouselIndicators = document.querySelector('.carousel-indicators');
    carouselInner.innerHTML = ''; // Clear existing items
    carouselIndicators.innerHTML = ''; // Clear existing indicators

    notifications.forEach((notification, index) => {
        const newItem = document.createElement('div');
        newItem.classList.add('carousel-item');
        newItem.innerHTML = `
            <div class="carousel-content">
                <i class="${notification.RASN_ICON} carousel-icon"></i>
                <h3 class="carousel-title">${notification.RASN_TITULO}</h3>
                <p class="carousel-description">${notification.RASN_DESCRIPCION}</p>
                <button class="delete-btn" onclick="deleteItem(${notification.RASN_ID})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        carouselInner.appendChild(newItem);

        const newIndicator = document.createElement('div');
        newIndicator.classList.add('carousel-indicator');
        newIndicator.addEventListener('click', () => showSlide(index));
        carouselIndicators.appendChild(newIndicator);
    });

    // Set the first item and indicator as active
    if (notifications.length > 0) {
        carouselInner.firstElementChild.classList.add('active');
        carouselIndicators.firstElementChild.classList.add('active');
    }

    logCarouselItems(); // Log the items in the carousel
}

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const totalSlides = slides.length;

    currentIndex = (index + totalSlides) % totalSlides;

    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentIndex) {
            slide.classList.add('active');
        }
    });

    indicators.forEach((indicator, i) => {
        indicator.classList.remove('active');
        if (i === currentIndex) {
            indicator.classList.add('active');
        }
    });
}

function nextSlide() {
    showSlide(currentIndex + 1);
}

function prevSlide() {
    showSlide(currentIndex - 1);
}

function openModal() {
    document.getElementById('addItemModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('addItemModal').style.display = 'none';
}

async function addItem(event) {
    event.preventDefault();
    const icon = document.getElementById('icon').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    const newItem = {
        RASN_ICON: icon,
        RASN_TITULO: title,
        RASN_DESCRIPCION: description
    };

    try {
        const response = await fetch(addApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            const addedItem = await response.json();
            console.log('Item added:', addedItem);

            // Optionally, update the carousel with the new item
            fetchNotifications();
        } else {
            console.error('Error adding item:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding item:', error);
    }

    closeModal();
}

async function deleteItem(id) {
    try {
        const response = await fetch(`${deleteApiUrl}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('Item deleted:', id);

            // Optionally, update the carousel after deletion
            fetchNotifications();
        } else {
            console.error('Error deleting item:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

function selectIcon(event) {
    const selectedIcon = event.currentTarget.getAttribute('data-icon');
    document.getElementById('icon').value = selectedIcon;

    // Remove active class from all icons
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.remove('active');
    });

    // Add active class to the selected icon
    event.currentTarget.classList.add('active');
}

function logCarouselItems() {
    const items = document.querySelectorAll('.carousel-item');
    console.log('Carousel items:');
    items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, item.innerHTML);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchNotifications(); // Fetch notifications on page load

    document.getElementById('addItemForm').addEventListener('submit', addItem);

    // Add click event listener to all icon options
    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', selectIcon);
    });
});