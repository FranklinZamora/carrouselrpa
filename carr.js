const apiUrl = 'https://172.30.4.145:3000/slider-notificaciones/getnotificaciones';
const addApiUrl = 'https://172.30.4.145:3000/slider-notificaciones/addnotificaciones';
const updateApiUrl = 'https://172.30.4.145:3000/slider-notificaciones/updatenotificaciones';
const deleteApiUrl = 'https://172.30.4.145:3000/slider-notificaciones/deletenotificaciones';
let currentIndex = 0;
let selectedCount = 0;

async function fetchNotifications() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        updateCarousel(data);
        updateItemList(data); // Update the item list in the modal
        countSelectedItems(data); // Count selected items
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function updateCarousel(notifications) {
    const carouselInner = document.querySelector('.carousel-inner');
    const carouselIndicators = document.querySelector('.carousel-indicators');
    carouselInner.innerHTML = ''; // Clear existing items
    carouselIndicators.innerHTML = ''; // Clear existing indicators

    let visibleCount = 0;

    notifications.forEach((notification, index) => {
        if (notification.RASN_FLAG === 1 && visibleCount < 4) {
            const newItem = document.createElement('div');
            newItem.classList.add('carousel-item');
            newItem.innerHTML = `
                <div class="carousel-content">
                    <i class="${notification.RASN_ICON} carousel-icon"></i>
                    <h3 class="carousel-title">${notification.RASN_TITULO}</h3>
                    <p class="carousel-description">${notification.RASN_DESCRIPCION}</p>
                </div>
            `;
            carouselInner.appendChild(newItem);

            const newIndicator = document.createElement('div');
            newIndicator.classList.add('carousel-indicator');
            newIndicator.addEventListener('click', () => showSlide(index));
            carouselIndicators.appendChild(newIndicator);

            visibleCount++;
        }
    });

    // Set the first item and indicator as active
    if (carouselInner.children.length > 0) {
        carouselInner.firstElementChild.classList.add('active');
        carouselIndicators.firstElementChild.classList.add('active');
    }

    logCarouselItems(); // Log the items in the carousel
}

function updateItemList(notifications) {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = ''; // Clear existing items

    notifications.forEach(notification => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <input type="checkbox" ${notification.RASN_FLAG === 1 ? 'checked' : ''} data-id="${notification.RASN_ID}">
            <strong>${notification.RASN_TITULO}</strong>
            <button class="delete-btn" data-id="${notification.RASN_ID}">
                <i class="fa-solid fa-delete-left"></i>
            </button>
        `;
        itemList.appendChild(listItem);
    });

    // Add event listeners to checkboxes
    document.querySelectorAll('#itemList input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', toggleVisibility);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteItem);
    });
}

function countSelectedItems(notifications) {
    selectedCount = notifications.filter(notification => notification.RASN_FLAG === 1).length;
    console.log(`Número de ítems seleccionados: ${selectedCount}`);
}

function showNotification(message) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">×</button>
    `;
    notificationContainer.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function toggleVisibility(event) {
    const checkbox = event.target;
    const id = checkbox.getAttribute('data-id');
    const RASN_FLAG = checkbox.checked ? 1 : 0;

    // Check the number of selected items
    if (RASN_FLAG === 1 && selectedCount >= 4) {
        showNotification('Solo puedes seleccionar hasta 4 avisos.');
        checkbox.checked = false;
        return;
    }

    if (RASN_FLAG === 1) {
        selectedCount++;
    } else {
        selectedCount--;
    }

    // Get the notification details
    const notificationElement = checkbox.closest('li').querySelector('strong');
    const notificationTitle = notificationElement.textContent;

    const updateData = {
        RASN_TITULO: notificationTitle,
        RASN_FLAG: RASN_FLAG
    };

    // Log the URL and JSON data being sent
    console.log('Sending update to URL:', `${updateApiUrl}/${id}`);
    console.log('Sending update data:', updateData);

    // Update the visibility status of the notification
    fetch(`${updateApiUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Visibility updated:', data);
        fetchNotifications(); // Refresh the carousel and item list
    })
    .catch(error => {
        console.error('Error updating visibility:', error);
    });
}

function deleteItem(event) {
    const button = event.target.closest('button');
    const id = button.getAttribute('data-id');

    // Log the URL being used for deletion
    console.log('Sending delete request to URL:', `${deleteApiUrl}/${id}`);

    // Delete the notification
    fetch(`${deleteApiUrl}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Item deleted:', data);
        fetchNotifications(); // Refresh the carousel and item list
    })
    .catch(error => {
        console.error('Error deleting item:', error);
    });
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
        RASN_DESCRIPCION: description,
        RASN_FLAG: 0 // New items are not visible by default
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

function selectIcon(event) {
    const selectedIcon = event.currentTarget.getAttribute('data-icon');
    document.getElementById('icon').value = selectedIcon;

    // Remove selected class from all icons
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Add selected class to the clicked icon
    event.currentTarget.classList.add('selected');
}

function logCarouselItems() {
    const items = document.querySelectorAll('.carousel-item');
    console.log('Carousel items:');
    items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, item.innerHTML);
    });
}

function updateCharCount() {
    const description = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    charCount.textContent = `${description.value.length}/512`;
}

function limitSelection(event) {
    const selectedIcons = document.querySelectorAll('.icon-option.active');
    if (selectedIcons.length >= 4 && !event.currentTarget.classList.contains('active')) {
        showNotification('Solo puedes seleccionar hasta 4 ítems.');
        event.preventDefault();
    } else {
        event.currentTarget.classList.toggle('active');
    }
}

function toggleCarouselVisibility(event) {
    const carousel = document.getElementById('carousel');
    if (event.target.checked) {
        carousel.style.display = 'block';
    } else {
        carousel.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchNotifications(); // Fetch notifications on page load

    document.getElementById('addItemForm').addEventListener('submit', addItem);

    // Add click event listener to all icon options
    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', selectIcon);
    });

    // Add input event listener to the description textarea
    document.getElementById('description').addEventListener('input', updateCharCount);

    // Add event listener to limit the selection of items
    document.querySelectorAll('#itemList input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', toggleVisibility);
    });

    // Add event listener to toggle carousel visibility
    document.getElementById('toggleCarousel').addEventListener('change', toggleCarouselVisibility);
});