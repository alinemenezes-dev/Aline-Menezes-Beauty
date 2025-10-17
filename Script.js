// Global variables
        let currentUser = null;
        let selectedDate = null;
        let selectedTime = null;
        let selectedService = null;
        let clients = JSON.parse(localStorage.getItem('clients') || '[]');
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

        // Modal functions
        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function backToHome() {
            document.getElementById('landingPage').style.display = 'flex';
            document.getElementById('clientPanel').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'none';
            currentUser = null;
            selectedDate = null;
            selectedTime = null;
            selectedService = null;
        }

        // Show/Hide forms
        function showRegisterForm() {
            document.getElementById('clientLoginForm').style.display = 'none';
            document.getElementById('clientRegisterForm').style.display = 'block';
            document.getElementById('clientMsg').style.display = 'none';
        }

        function showLoginForm() {
            document.getElementById('clientRegisterForm').style.display = 'none';
            document.getElementById('clientLoginForm').style.display = 'block';
            document.getElementById('clientMsg').style.display = 'none';
        }

        // Client registration
        function registerClient(event) {
            event.preventDefault();
            const name = document.getElementById('registerName').value.trim();
            const birthdate = document.getElementById('registerBirthdate').value;
            const whatsapp = document.getElementById('registerWhatsapp').value.trim();
            
            // Check if client already exists
            const existingClient = clients.find(c => 
                c.name.toLowerCase() === name.toLowerCase() || c.whatsapp === whatsapp
            );
            
            if (existingClient) {
                showMessage('clientMsg', 'Cliente já cadastrado com este nome ou WhatsApp!', 'error');
                return;
            }
            
            // Create new client
            const newClient = {
                id: Date.now(),
                name: name,
                birthdate: birthdate,
                whatsapp: whatsapp,
                created: new Date().toISOString()
            };
            
            clients.push(newClient);
            localStorage.setItem('clients', JSON.stringify(clients));
            
            // Auto login after registration
            currentUser = newClient;
            closeModal('clientModal');
            showClientPanel();
            
            showMessage('bookingSuccess', `Bem-vindo(a), ${name}! Cadastro realizado com sucesso!`, 'success');
        }

        // Client login
        function loginClient(event) {
            event.preventDefault();
            const name = document.getElementById('loginName').value.trim();
            const whatsapp = document.getElementById('loginWhatsapp').value.trim();
            
            const client = clients.find(c => 
                c.name.toLowerCase() === name.toLowerCase() && c.whatsapp === whatsapp
            );
            
            if (client) {
                currentUser = client;
                closeModal('clientModal');
                showClientPanel();
            } else {
                showMessage('clientMsg', 'Nome ou WhatsApp incorretos! Verifique os dados ou faça seu cadastro.', 'error');
            }
        }



        // Admin login
        function adminLogin(event) {
            event.preventDefault();
            const user = document.getElementById('adminUser').value;
            const pass = document.getElementById('adminPassword').value;
            
            if (user === 'aline' && pass === 'aline2924') {
                currentUser = {name: 'Aline', role: 'admin'};
                closeModal('adminModal');
                showAdminPanel();
            } else {
                showMessage('adminMsg', 'Credenciais incorretas!');
            }
        }



        // Show panels
        function showClientPanel() {
            document.getElementById('landingPage').style.display = 'none';
            document.getElementById('clientPanel').style.display = 'block';
            generateCalendar();
            generateTimeSlots();
        }

        function showAdminPanel() {
            document.getElementById('landingPage').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            loadClients();
            loadAppointments();
            updateStats();
            loadSavedConfigurations();
        }

        // Calendar
        function generateCalendar() {
            const calendar = document.getElementById('calendar');
            calendar.innerHTML = '';
            
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            
            // Days of week
            ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.textContent = day;
                dayHeader.style.fontWeight = 'bold';
                dayHeader.style.textAlign = 'center';
                calendar.appendChild(dayHeader);
            });
            
            // First day of month
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Empty cells
            for (let i = 0; i < firstDay; i++) {
                calendar.appendChild(document.createElement('div'));
            }
            
            // Days
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = day;
                
                const dayDate = new Date(year, month, day);
                if (dayDate >= today) {
                    dayElement.onclick = () => selectDate(dayDate, dayElement);
                } else {
                    dayElement.classList.add('disabled');
                }
                
                calendar.appendChild(dayElement);
            }
        }

        function selectDate(date, element) {
            document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');
            selectedDate = date.toISOString().split('T')[0];
            updateSelectionSummary();
            updateConfirmButton();
        }

        // Time slots
        function generateTimeSlots() {
            const timeSlots = document.getElementById('timeSlots');
            timeSlots.innerHTML = '';
            
            const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
            
            times.forEach(time => {
                const slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.textContent = time;
                slot.onclick = () => selectTime(time, slot);
                timeSlots.appendChild(slot);
            });
        }

        function selectTime(time, element) {
            document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');
            selectedTime = time;
            updateSelectionSummary();
            updateConfirmButton();
        }

        // Service selection from dropdown
        function selectServiceFromDropdown(selectElement) {
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            
            if (selectedOption.value === '') {
                selectedService = null;
                document.getElementById('serviceDetails').style.display = 'none';
            } else {
                const price = parseFloat(selectedOption.dataset.price);
                const duration = parseInt(selectedOption.dataset.duration);
                
                selectedService = {
                    id: selectedOption.value.toLowerCase().replace(/\s+/g, '_'),
                    name: selectedOption.value,
                    price: `R$ ${price.toFixed(2).replace('.', ',')}`
                };
                
                // Update service details display
                document.getElementById('selectedServiceName').textContent = selectedOption.value;
                document.getElementById('selectedServicePrice').textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
                document.getElementById('selectedServiceDuration').textContent = `⏱️ ${duration} min`;
                document.getElementById('serviceDetails').style.display = 'block';
            }
            
            updateSelectionSummary();
            updateConfirmButton();
        }

        function updateConfirmButton() {
            const btn = document.getElementById('confirmBtn');
            btn.disabled = !(selectedDate && selectedTime && selectedService);
        }

        function updateSelectionSummary() {
            const summary = document.getElementById('selectionSummary');
            
            if (selectedService || selectedDate || selectedTime) {
                summary.style.display = 'block';
                
                document.getElementById('summaryService').textContent = selectedService ? selectedService.name : '-';
                document.getElementById('summaryPrice').textContent = selectedService ? selectedService.price : '-';
                document.getElementById('summaryDate').textContent = selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : '-';
                document.getElementById('summaryTime').textContent = selectedTime || '-';
            } else {
                summary.style.display = 'none';
            }
        }
