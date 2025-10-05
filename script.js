document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://127.0.0.1:5000';

    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const logoutBtn = document.getElementById('logout-btn');
    const eventList = document.getElementById('event-list');
    const welcomeUser = document.getElementById('welcome-user');
    const eventModal = document.getElementById('eventModal');
    const closeModalBtn = document.getElementById('closeEventModal');
    const applyBtn = document.getElementById('applyBtn');

    let currentUser = '';

    
    async function displayEvents() {
        try {
            const response = await fetch(`${API_URL}/api/events`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allEvents = await response.json();
            
            eventList.innerHTML = '';
            allEvents.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card';
                eventCard.innerHTML = `
                    <div class="card-content">
                        <h3>${event.name}</h3>
                        <p><i class="fas fa-calendar-alt"></i> ${new Date(event.date).toDateString()}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                    </div>
                `;

                eventCard.addEventListener('click', () => openEventModal(event));
                eventList.appendChild(eventCard);
            });
        } catch (error) {
            console.error('Error fetching events:', error);
            eventList.innerHTML = '<p style="color: red; text-align: center;">Could not load events. Please ensure the Python backend server is running.</p>';
        }
    }

    /**
     * Opens the details modal and populates it with data for a specific event.
     * @param {object} event - The event object containing details like name, date, etc.
     */
    function openEventModal(event) {
        document.getElementById('modalTitle').textContent = event.name;
        document.getElementById('modalDate').innerHTML = `<b>Date:</b> ${new Date(event.date).toDateString()}`;
        document.getElementById('modalLocation').innerHTML = `<b>Location:</b> ${event.location}`;
        document.getElementById('modalDescription').textContent = event.description;
        applyBtn.dataset.eventId = event.id; 
        eventModal.style.display = 'block';
    }


    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            currentUser = username;
            loginContainer.style.display = 'none';
            appContainer.style.display = 'block';
            welcomeUser.textContent = `Welcome, ${currentUser}!`;
            displayEvents(); 
        }
    });

    
    logoutBtn.addEventListener('click', () => {
        currentUser = '';
        appContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        usernameInput.value = ''; 
    });
    
    closeModalBtn.addEventListener('click', () => eventModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == eventModal) {
            eventModal.style.display = 'none';
        }
    });
    
    applyBtn.addEventListener('click', async () => {
        const eventId = applyBtn.dataset.eventId;
        if (!currentUser || !eventId) {
            alert('Something went wrong. Please log in again.');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser, event_id: eventId }),
            });
            const result = await response.json();
            alert(result.message); 
            
            if (response.ok) {
               eventModal.style.display = 'none'; 
            }
        } catch (error) {
            console.error('Error registering for event:', error);
            alert('Registration failed. Please try again later.');
        }
    });
});

