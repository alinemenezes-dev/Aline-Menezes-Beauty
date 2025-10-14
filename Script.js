console.log('🚀 VERSÃO 220 - SISTEMA COMPLETO CARREGADO!');

// Estado da aplicação
let isAdminMode = false;
let currentFilter = 'all';
let currentClient = null;

// Sistema de clientes (simulando banco de dados)
const clientsDatabase = {
  // Exemplo de clientes cadastrados
  'maria-silva-49999999999': {
    name: 'Maria Silva',
    phone: '(49) 99999-9999',
    email: 'maria@email.com',
    birthdate: '1990-05-15',
    registrationDate: '2024-01-15',
    isNewClient: false,
    appointments: [
      { date: '2024-01-20', service: 'Volume Brasileiro', status: 'concluído' },
    ],
  },
  'ana-costa-49888888888': {
    name: 'Ana Costa',
    phone: '(49) 88888-8888',
    email: 'ana@email.com',
    birthdate: '1985-08-22',
    registrationDate: '2024-02-10',
    isNewClient: false,
    appointments: [
      {
        date: '2024-02-15',
        service: 'Design de Sobrancelhas',
        status: 'concluído',
      },
    ],
  },
};

// Mostrar popup de boas-vindas
function showWelcomePopup() {
  console.log('🎯 Mostrando popup de boas-vindas');
  const popup = document.getElementById('welcomePopup');
  if (popup) {
    popup.classList.add('active');
    console.log('✅ Popup ativado');
  }
}

function closeWelcomePopup() {
  console.log('❌ Fechando popup');
  const popup = document.getElementById('welcomePopup');
  if (popup) {
    popup.classList.remove('active');
    console.log('✅ Popup fechado');
  }
}

// Modal de seleção de acesso
function showAccessModal() {
  console.log('🔑 Mostrando modal de acesso');
  const modal = document.getElementById('accessModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeAccessModal() {
  const modal = document.getElementById('accessModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Funções do sistema de login de clientes
function showClientLoginModal() {
  console.log('👤 Mostrando modal de login do cliente');
  const modal = document.getElementById('clientLoginModal');
  if (modal) {
    modal.classList.add('active');
    showLoginForm(); // Mostrar formulário de login por padrão
  }
}

function closeClientLoginModal() {
  const modal = document.getElementById('clientLoginModal');
  if (modal) {
    modal.classList.remove('active');
  }
  // Limpar formulários
  clearLoginForms();
}

function showLoginForm() {
  console.log('🔓 Mostrando formulário de login');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
}

function showRegisterForm() {
  console.log('📝 Mostrando formulário de cadastro');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
}

function clearLoginForms() {
  // Limpar formulário de login
  document.getElementById('loginName').value = '';
  document.getElementById('loginPhone').value = '';

  // Limpar formulário de cadastro
  document.getElementById('registerName').value = '';
  document.getElementById('registerPhone').value = '';
  document.getElementById('registerEmail').value = '';
  document.getElementById('registerBirthdate').value = '';
  document.getElementById('acceptTerms').checked = false;
}

function generateClientKey(name, phone) {
  // Gerar chave única baseada no nome e telefone
  const cleanName = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const cleanPhone = phone.replace(/\D/g, '');
  return `${cleanName}-${cleanPhone}`;
}

function submitClientLogin(event) {
  event.preventDefault();
  console.log('🔓 Processando login do cliente');

  const name = document.getElementById('loginName').value.trim();
  const phone = document.getElementById('loginPhone').value.trim();

  if (!name || !phone) {
    showNotification(
      'Por favor, preencha todos os campos obrigatórios.',
      'error',
    );
    return;
  }

  // Gerar chave do cliente
  const clientKey = generateClientKey(name, phone);

  // Verificar se cliente existe
  const client = clientsDatabase[clientKey];

  if (client) {
    // Cliente encontrado - fazer login
    currentClient = client;
    closeClientLoginModal();
    loginAsClient(client);
    showNotification(`Bem-vinda de volta, ${client.name}! 🎉`, 'success');
  } else {
    // Cliente não encontrado
    showNotification(
      'Cliente não encontrado. Verifique seus dados ou cadastre-se.',
      'error',
    );

    // Sugerir cadastro
    setTimeout(() => {
      if (confirm('Cliente não encontrado. Deseja se cadastrar agora?')) {
        showRegisterForm();
        // Pré-preencher dados
        document.getElementById('registerName').value = name;
        document.getElementById('registerPhone').value = phone;
      }
    }, 1000);
  }
}

function submitClientRegister(event) {
  event.preventDefault();
  console.log('📝 Processando cadastro do cliente');

  const name = document.getElementById('registerName').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const birthdate = document.getElementById('registerBirthdate').value;
  const acceptTerms = document.getElementById('acceptTerms').checked;

  if (!name || !phone) {
    showNotification('Nome e telefone são obrigatórios.', 'error');
    return;
  }

  if (!acceptTerms) {
    showNotification('Você deve aceitar os termos para se cadastrar.', 'error');
    return;
  }

  // Gerar chave do cliente
  const clientKey = generateClientKey(name, phone);

  // Verificar se cliente já existe
  if (clientsDatabase[clientKey]) {
    showNotification('Cliente já cadastrado! Tente fazer login.', 'error');
    showLoginForm();
    // Pré-preencher dados de login
    document.getElementById('loginName').value = name;
    document.getElementById('loginPhone').value = phone;
    return;
  }

  // Criar novo cliente
  const newClient = {
    name: name,
    phone: phone,
    email: email || null,
    birthdate: birthdate || null,
    registrationDate: new Date().toISOString().split('T')[0],
    isNewClient: true,
    appointments: [],
  };

  // Salvar no "banco de dados"
  clientsDatabase[clientKey] = newClient;
  currentClient = newClient;

  // Salvar no localStorage para persistência
  try {
    localStorage.setItem(
      'aline_beauty_clients',
      JSON.stringify(clientsDatabase),
    );
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
  }

  closeClientLoginModal();
  loginAsClient(newClient);

  showNotification(
    `Cadastro realizado com sucesso! Bem-vinda, ${newClient.name}! 🎉`,
    'success',
  );

  // Mostrar oferta especial para novos clientes
  setTimeout(() => {
    showNotification(
      '🎁 Lembre-se: você tem 10% de desconto no primeiro agendamento!',
      'info',
    );
  }, 2000);
}

function loginAsClient(client) {
  console.log('✅ Cliente logado:', client.name);

  isAdminMode = false;
  currentClient = client;

  const publicCatalog = document.getElementById('publicCatalog');
  const adminPanel = document.getElementById('adminPanel');
  const accessBtn = document.getElementById('accessBtn');
  const accessBtnDesktop = document.getElementById('accessBtnDesktop');

  publicCatalog.style.display = 'block';
  adminPanel.classList.remove('active');

  // Atualizar botões de acesso
  if (accessBtn) {
    accessBtn.textContent = 'SAIR';
    accessBtn.classList.remove('animate-pulse');
    accessBtn.onclick = function () {
      logoutClient();
    };
  }
  if (accessBtnDesktop) {
    accessBtnDesktop.textContent = 'SAIR';
    accessBtnDesktop.classList.remove('animate-pulse');
    accessBtnDesktop.onclick = function () {
      logoutClient();
    };
  }

  // Personalizar experiência baseada no cliente
  personalizeClientExperience(client);
}

function logoutClient() {
  console.log('🚪 Cliente fazendo logout');

  currentClient = null;

  const accessBtn = document.getElementById('accessBtn');
  const accessBtnDesktop = document.getElementById('accessBtnDesktop');

  if (accessBtn) {
    accessBtn.textContent = 'ENTRAR';
    accessBtn.classList.add('animate-pulse');
    accessBtn.onclick = showAccessModal;
  }
  if (accessBtnDesktop) {
    accessBtnDesktop.textContent = 'ENTRAR';
    accessBtnDesktop.classList.add('animate-pulse');
    accessBtnDesktop.onclick = showAccessModal;
  }

  showNotification('Logout realizado com sucesso. Até logo! 👋', 'info');
}

function personalizeClientExperience(client) {
  console.log('🎨 Personalizando experiência para:', client.name);

  // Adicionar saudação personalizada (se houver espaço no header)
  // Pré-preencher dados nos formulários de agendamento
  // Mostrar histórico de agendamentos se necessário

  // Exemplo: pré-preencher nome e telefone no modal de agendamento
  const bookingModal = document.getElementById('bookingModal');
  if (bookingModal) {
    const nameInput = bookingModal.querySelector(
      'input[placeholder="Seu nome completo"]',
    );
    const phoneInput = bookingModal.querySelector(
      'input[placeholder="(49) 99999-9999"]',
    );

    if (nameInput) nameInput.value = client.name;
    if (phoneInput) phoneInput.value = client.phone;
  }
}

// Acesso como cliente
function accessAsClient() {
  console.log('👤 Acessando como cliente');
  closeAccessModal();
  showClientLoginModal();
}

// Acesso como admin
function accessAsAdmin() {
  console.log('🔑 Acessando como admin');
  closeAccessModal();
  isAdminMode = true;

  const publicCatalog = document.getElementById('publicCatalog');
  const adminPanel = document.getElementById('adminPanel');
  const accessBtn = document.getElementById('accessBtn');
  const accessBtnDesktop = document.getElementById('accessBtnDesktop');

  publicCatalog.style.display = 'none';
  adminPanel.classList.add('active');

  if (accessBtn) {
    accessBtn.textContent = 'SAIR';
    accessBtn.classList.remove('animate-pulse');
    accessBtn.onclick = function () {
      isAdminMode = false;
      publicCatalog.style.display = 'block';
      adminPanel.classList.remove('active');
      accessBtn.textContent = 'ENTRAR';
      accessBtn.classList.add('animate-pulse');
      accessBtn.onclick = showAccessModal;
      showNotification('Voltando ao catálogo público', 'info');
    };
  }
  if (accessBtnDesktop) {
    accessBtnDesktop.textContent = 'SAIR';
    accessBtnDesktop.classList.remove('animate-pulse');
    accessBtnDesktop.onclick = function () {
      isAdminMode = false;
      publicCatalog.style.display = 'block';
      adminPanel.classList.remove('active');
      accessBtnDesktop.textContent = 'ENTRAR';
      accessBtnDesktop.classList.add('animate-pulse');
      accessBtnDesktop.onclick = showAccessModal;
      showNotification('Voltando ao catálogo público', 'info');
    };
  }

  showNotification('Modo administrativo ativado!', 'success');
}

// Modal de localização
function showLocationModal() {
  console.log('📍 Mostrando modal de localização');
  const modal = document.getElementById('locationModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeLocationModal() {
  const modal = document.getElementById('locationModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Modal de agendamento
function showBookingModal() {
  console.log('📅 Mostrando modal de agendamento');
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Submeter agendamento
function submitBooking(event) {
  event.preventDefault();
  console.log('📝 Processando agendamento');

  // Simular processamento
  showNotification(
    'Agendamento enviado! Entraremos em contato em breve.',
    'success',
  );
  closeBookingModal();

  // Aqui você pode adicionar lógica para enviar os dados
}

// Filtrar serviços
function filterServices(category) {
  console.log('🔍 Filtrando serviços:', category);
  currentFilter = category;

  const allServices = document.querySelectorAll('.service-card');

  // Esconder todos os serviços primeiro
  allServices.forEach((card) => {
    card.style.display = 'none';
    card.style.animation = 'fadeOut 0.3s ease-out';
  });

  // Mostrar apenas os serviços da categoria selecionada
  setTimeout(() => {
    allServices.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');

      if (
        category === 'all' ||
        cardCategory === category ||
        cardCategory.includes(category)
      ) {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.5s ease-out';
      }
    });
  }, 300);

  // Atualizar botões de filtro
  updateFilterButtons(category);

  const categoryNames = {
    cilios: 'Cílios',
    sobrancelha: 'Sobrancelhas',
    'micropigmentacao-sobrancelhas': 'Micropigmentação - Sobrancelhas',
    'micropigmentacao-olhos': 'Micropigmentação - Olhos',
    'micropigmentacao-labios': 'Micropigmentação - Lábios',
  };

  showNotification(`Mostrando: ${categoryNames[category] || category}`, 'info');
}

function updateFilterButtons(activeCategory) {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((btn) => {
    btn.classList.remove('bg-pink-500', 'bg-purple-500');
    btn.classList.add('bg-black/50');
  });

  // Destacar botão ativo
  const activeBtn = document.querySelector(`[onclick*="${activeCategory}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-black/50');
    activeBtn.classList.add('bg-pink-500');
  }
}

// Alternar micropigmentação
function toggleMicropigmentacao() {
  console.log('💉 Alternando micropigmentação');
  const subcategories = document.getElementById(
    'micropigmentacaoSubcategories',
  );
  const btn = document.getElementById('micropigmentacaoBtn');

  if (subcategories && btn) {
    if (subcategories.classList.contains('hidden')) {
      subcategories.classList.remove('hidden');
      btn.querySelector('span:last-child').textContent = '▲';
    } else {
      subcategories.classList.add('hidden');
      btn.querySelector('span:last-child').textContent = '▼';
    }
  }
}

// Compartilhar no WhatsApp
function shareWhatsApp() {
  console.log('📱 Compartilhando no WhatsApp');
  const text = encodeURIComponent(
    'Confira o catálogo da Aline Menezes Beauty! Serviços de beleza com qualidade e profissionalismo.',
  );
  const url = `https://wa.me/?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Sistema de notificações
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Mostrar notificação
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Remover notificação
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 400);
  }, 3000);
}

// Fechar modais ao clicar fora
document.addEventListener('click', function (event) {
  const modals = document.querySelectorAll('.modal.active');
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.classList.remove('active');
    }
  });
});

// Admin Functions
let currentAdminSection = 'services';

function showAdminSection(section) {
  console.log('🔧 Mostrando seção admin:', section);

  // Esconder todas as seções
  const sections = ['services', 'photos', 'bookings', 'settings'];
  sections.forEach((s) => {
    const element = document.getElementById(
      `admin${s.charAt(0).toUpperCase() + s.slice(1)}Section`,
    );
    const btn = document.getElementById(
      `admin${s.charAt(0).toUpperCase() + s.slice(1)}Btn`,
    );

    if (element) element.classList.add('hidden');
    if (btn) btn.classList.remove('active');
  });

  // Mostrar seção selecionada
  const targetSection = document.getElementById(
    `admin${section.charAt(0).toUpperCase() + section.slice(1)}Section`,
  );
  const targetBtn = document.getElementById(
    `admin${section.charAt(0).toUpperCase() + section.slice(1)}Btn`,
  );

  if (targetSection) targetSection.classList.remove('hidden');
  if (targetBtn) targetBtn.classList.add('active');

  currentAdminSection = section;
}

function showAddServiceModal() {
  console.log('➕ Mostrando modal de adicionar serviço');
  const modal = document.getElementById('addServiceModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeAddServiceModal() {
  const modal = document.getElementById('addServiceModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function addNewService(event) {
  event.preventDefault();
  console.log('✅ Adicionando novo serviço');

  const formData = new FormData(event.target);
  const serviceData = {
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    duration: formData.get('duration'),
    category: formData.get('category'),
    icon: formData.get('icon') || '⭐',
  };

  // Aqui você adicionaria a lógica para salvar o serviço
  showNotification('Serviço adicionado com sucesso!', 'success');
  closeAddServiceModal();

  // Limpar formulário
  event.target.reset();
}

// Renderizar lista de serviços no admin
function renderServicesList() {
  const servicesList = document.getElementById('servicesList');
  if (!servicesList) return;

  servicesList.innerHTML = '';

  Object.entries(servicesData).forEach(([id, service]) => {
    const serviceItem = document.createElement('div');
    serviceItem.className =
      'border rounded-lg p-4 flex justify-between items-center';
    serviceItem.innerHTML = `
                    <div>
                        <h4 class="font-bold">${service.images[0]} ${service.name}</h4>
                        <p class="text-gray-600">${service.description.substring(0, 80)}... - R$ ${service.applicationPrice.toFixed(2).replace('.', ',')}</p>
                        <span class="text-sm text-gray-500">Categoria: ${service.category}</span>
                        <div class="text-xs text-gray-400 mt-1">
                            Manutenção 15d: R$ ${service.maintenance15Price.toFixed(2).replace('.', ',')} | 
                            Manutenção 20d: R$ ${service.maintenance20Price.toFixed(2).replace('.', ',')}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editService(${id})" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-all">
                            ✏️ EDITAR
                        </button>
                        <button onclick="deleteService(${id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-all">
                            🗑️ EXCLUIR
                        </button>
                    </div>
                `;
    servicesList.appendChild(serviceItem);
  });
}

function editService(serviceId) {
  console.log('✏️ Editando serviço:', serviceId);

  const service = servicesData[serviceId];
  if (!service) {
    showNotification('Serviço não encontrado', 'error');
    return;
  }

  // Preencher formulário de edição
  document.getElementById('editServiceId').value = serviceId;
  document.getElementById('editServiceName').value = service.name;
  document.getElementById('editServiceDescription').value = service.description;
  document.getElementById('editServiceApplicationPrice').value =
    service.applicationPrice;
  document.getElementById('editServiceMaintenance15Price').value =
    service.maintenance15Price;
  document.getElementById('editServiceMaintenance20Price').value =
    service.maintenance20Price;
  document.getElementById('editServiceDuration').value = service.duration;
  document.getElementById('editServiceCategory').value =
    service.category.toLowerCase();
  document.getElementById('editServiceIcon').value = service.images[0];

  // Mostrar imagens atuais
  const currentImagesContainer = document.getElementById(
    'currentServiceImages',
  );
  currentImagesContainer.innerHTML = '';

  service.images.forEach((image, index) => {
    const imageDiv = document.createElement('div');
    imageDiv.className =
      'w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center text-2xl';
    imageDiv.textContent = image;
    currentImagesContainer.appendChild(imageDiv);
  });

  // Mostrar modal
  const modal = document.getElementById('editServiceModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeEditServiceModal() {
  const modal = document.getElementById('editServiceModal');
  if (modal) {
    modal.classList.remove('active');
  }

  // Limpar preview de novas imagens
  document.getElementById('editSelectedImagesPreview').innerHTML = '';
  document.getElementById('editServiceImages').value = '';
}

function updateService(event) {
  event.preventDefault();
  console.log('💾 Atualizando serviço');

  const formData = new FormData(event.target);
  const serviceId = formData.get('serviceId');

  if (!servicesData[serviceId]) {
    showNotification('Serviço não encontrado', 'error');
    return;
  }

  // Atualizar dados do serviço
  servicesData[serviceId] = {
    ...servicesData[serviceId],
    name: formData.get('name'),
    description: formData.get('description'),
    applicationPrice: parseFloat(formData.get('applicationPrice')),
    maintenance15Price: parseFloat(formData.get('maintenance15Price')),
    maintenance20Price: parseFloat(formData.get('maintenance20Price')),
    duration: parseInt(formData.get('duration')),
    category:
      formData.get('category').charAt(0).toUpperCase() +
      formData.get('category').slice(1),
    images: [
      formData.get('icon') || servicesData[serviceId].images[0],
      servicesData[serviceId].images[1],
    ],
  };

  // Atualizar interface
  updateServiceInCatalog(serviceId);
  renderServicesList();
  closeEditServiceModal();

  showNotification('Serviço atualizado com sucesso!', 'success');
  showAutoSaveIndicator();
}

function updateServiceInCatalog(serviceId) {
  const serviceCard = document.querySelector(
    `[data-service-id="${serviceId}"]`,
  );
  if (!serviceCard) return;

  const service = servicesData[serviceId];

  // Atualizar título
  const title = serviceCard.querySelector('h3');
  if (title) title.textContent = service.name;

  // Atualizar descrição
  const description = serviceCard.querySelector('p');
  if (description)
    description.textContent = service.description.substring(0, 60) + '...';

  // Atualizar preços
  const applicationPrice = serviceCard.querySelector(
    '.detail-item:nth-child(1) span:last-child',
  );
  if (applicationPrice)
    applicationPrice.textContent = `R$ ${service.applicationPrice.toFixed(2).replace('.', ',')}`;

  const maintenance15Price = serviceCard.querySelector(
    '.detail-item:nth-child(2) span:last-child',
  );
  if (maintenance15Price)
    maintenance15Price.textContent = `R$ ${service.maintenance15Price.toFixed(2).replace('.', ',')}`;

  const maintenance20Price = serviceCard.querySelector(
    '.detail-item:nth-child(3) span:last-child',
  );
  if (maintenance20Price)
    maintenance20Price.textContent = `R$ ${service.maintenance20Price.toFixed(2).replace('.', ',')}`;

  // Atualizar ícone na galeria
  const gallerySlides = serviceCard.querySelectorAll('.gallery-slide div');
  if (gallerySlides[0]) gallerySlides[0].textContent = service.images[0];
}

function deleteService(serviceId) {
  console.log('🗑️ Excluindo serviço:', serviceId);

  const service = servicesData[serviceId];
  if (!service) {
    showNotification('Serviço não encontrado', 'error');
    return;
  }

  if (
    confirm(
      `Tem certeza que deseja excluir o serviço "${service.name}"? Esta ação não pode ser desfeita.`,
    )
  ) {
    // Remover do catálogo visual
    const serviceCard = document.querySelector(
      `[data-service-id="${serviceId}"]`,
    );
    if (serviceCard) {
      serviceCard.style.animation = 'fadeOut 0.5s ease-out';
      setTimeout(() => {
        serviceCard.remove();
      }, 500);
    }

    // Remover dos dados
    delete servicesData[serviceId];

    // Atualizar lista admin
    renderServicesList();

    showNotification('Serviço excluído com sucesso!', 'success');
    showAutoSaveIndicator();
  }
}

// Upload de imagens para edição
let editSelectedServiceImages = [];

function handleEditServiceImagesUpload(event) {
  console.log('📸 Processando upload de novas imagens para edição');
  const files = Array.from(event.target.files);

  if (files.length > 2) {
    showNotification('Máximo 2 imagens permitidas por serviço', 'error');
    return;
  }

  editSelectedServiceImages = [];
  const preview = document.getElementById('editSelectedImagesPreview');
  preview.innerHTML = '';

  files.forEach((file, index) => {
    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        `Imagem ${index + 1} muito grande! Máximo 5MB permitido.`,
        'error',
      );
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotification(
        `Arquivo ${index + 1} não é uma imagem válida.`,
        'error',
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      editSelectedServiceImages.push(e.target.result);

      // Criar preview
      const previewImg = document.createElement('div');
      previewImg.className =
        'w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative';
      previewImg.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" class="w-full h-full object-cover rounded-lg">
                        <button onclick="removeEditServiceImage(${editSelectedServiceImages.length - 1})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                    `;
      preview.appendChild(previewImg);
    };
    reader.readAsDataURL(file);
  });

  if (files.length > 0) {
    showNotification(
      `${files.length} nova(s) imagem(ns) selecionada(s)`,
      'success',
    );
  }
}

function removeEditServiceImage(index) {
  editSelectedServiceImages.splice(index, 1);

  // Atualizar preview
  const preview = document.getElementById('editSelectedImagesPreview');
  preview.innerHTML = '';

  editSelectedServiceImages.forEach((image, i) => {
    const previewImg = document.createElement('div');
    previewImg.className =
      'w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative';
    previewImg.innerHTML = `
                    <img src="${image}" alt="Preview" class="w-full h-full object-cover rounded-lg">
                    <button onclick="removeEditServiceImage(${i})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                `;
    preview.appendChild(previewImg);
  });
}

function handlePhotoUpload(event) {
  console.log('📸 Processando upload de fotos');
  const files = event.target.files;

  if (files.length > 0) {
    showNotification(
      `${files.length} foto(s) selecionada(s). Processando upload...`,
      'info',
    );

    // Simular upload
    setTimeout(() => {
      showNotification('Fotos enviadas com sucesso!', 'success');
    }, 2000);
  }
}

function exitAdminMode() {
  console.log('🚪 Saindo do modo admin');
  isAdminMode = false;

  const publicCatalog = document.getElementById('publicCatalog');
  const adminPanel = document.getElementById('adminPanel');
  const accessBtn = document.getElementById('accessBtn');
  const accessBtnDesktop = document.getElementById('accessBtnDesktop');

  publicCatalog.style.display = 'block';
  adminPanel.classList.remove('active');

  if (accessBtn) {
    accessBtn.textContent = 'ENTRAR';
    accessBtn.classList.add('animate-pulse');
    accessBtn.onclick = showAccessModal;
  }
  if (accessBtnDesktop) {
    accessBtnDesktop.textContent = 'ENTRAR';
    accessBtnDesktop.classList.add('animate-pulse');
    accessBtnDesktop.onclick = showAccessModal;
  }

  showNotification('Voltando ao catálogo público', 'info');
}

// Gerenciamento de imagem de fundo
let currentBackgroundImage = null;

// Sistema de armazenamento local
const STORAGE_KEYS = {
  BACKGROUND_IMAGE: 'aline_beauty_background',
  STUDIO_INFO: 'aline_beauty_studio_info',
  WORKING_HOURS: 'aline_beauty_hours',
};

function handleBackgroundUpload(event) {
  console.log('🖼️ Processando upload de imagem de fundo');
  const file = event.target.files[0];

  if (!file) return;

  // Validar tamanho do arquivo (máx. 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showNotification('Arquivo muito grande! Máximo 10MB permitido.', 'error');
    return;
  }

  // Validar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    showNotification(
      'Por favor, selecione apenas arquivos de imagem.',
      'error',
    );
    return;
  }

  showNotification('Processando imagem de fundo...', 'info');

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageData = e.target.result;
    currentBackgroundImage = imageData;

    // Aplicar imagem de fundo
    applyBackgroundImage(imageData);

    // Atualizar status
    updateBackgroundStatus(file.name);

    // Salvar automaticamente
    saveBackgroundImage();
    showAutoSaveIndicator();

    showNotification(
      'Imagem de fundo aplicada e salva com sucesso!',
      'success',
    );
  };

  reader.readAsDataURL(file);
}

function applyBackgroundImage(imageData) {
  console.log('🎨 Aplicando imagem de fundo');
  const body = document.body;

  // Adicionar classe para indicar que há imagem personalizada
  body.classList.add('has-custom-bg');

  // Aplicar imagem de fundo
  body.style.background = `
                linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
                url('${imageData}')
            `;
  body.style.backgroundSize = 'cover';
  body.style.backgroundPosition = 'center';
  body.style.backgroundAttachment = 'fixed';
  body.style.backgroundRepeat = 'no-repeat';
}

function updateBackgroundStatus(fileName) {
  const statusElement = document.getElementById('backgroundStatus');
  if (statusElement) {
    statusElement.textContent = `Imagem personalizada: ${fileName}`;
  }
}

function previewBackground() {
  console.log('👁️ Visualizando fundo atual');
  if (currentBackgroundImage) {
    // Criar modal de preview
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
                    <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-bold text-gray-800">🖼️ Preview da Imagem de Fundo</h3>
                            <button onclick="this.closest('.modal').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        <div class="text-center">
                            <img src="${currentBackgroundImage}" alt="Preview" class="max-w-full max-h-96 rounded-lg shadow-lg mx-auto">
                            <p class="text-gray-600 mt-4">Esta é a imagem que está sendo usada como fundo do catálogo</p>
                        </div>
                        <div class="text-center mt-6">
                            <button onclick="this.closest('.modal').remove()" class="btn-primary px-6 py-2 rounded-lg">
                                FECHAR PREVIEW
                            </button>
                        </div>
                    </div>
                `;
    document.body.appendChild(modal);
  } else {
    showNotification(
      'Nenhuma imagem personalizada definida. Usando gradiente padrão.',
      'info',
    );
  }
}

function removeBackground() {
  console.log('🗑️ Removendo imagem de fundo');

  if (!currentBackgroundImage) {
    showNotification('Nenhuma imagem personalizada para remover.', 'info');
    return;
  }

  if (
    confirm('Tem certeza que deseja remover a imagem de fundo personalizada?')
  ) {
    const body = document.body;

    // Remover classe de fundo personalizado
    body.classList.remove('has-custom-bg');

    // Restaurar gradiente padrão
    body.style.background = '';
    body.style.backgroundSize = '';
    body.style.backgroundPosition = '';
    body.style.backgroundAttachment = '';
    body.style.backgroundRepeat = '';

    // Limpar variável
    currentBackgroundImage = null;

    // Atualizar status
    const statusElement = document.getElementById('backgroundStatus');
    if (statusElement) {
      statusElement.textContent = 'Gradiente padrão (sem imagem personalizada)';
    }

    // Limpar input
    const uploadInput = document.getElementById('backgroundUpload');
    if (uploadInput) {
      uploadInput.value = '';
    }

    showNotification(
      'Imagem de fundo removida. Voltando ao gradiente padrão.',
      'success',
    );
  }
}

// Funções de auto-salvamento
function autoSaveStudioInfo() {
  console.log('💾 Auto-salvando informações do estúdio');

  const studioInfo = {
    name:
      document.getElementById('studioName')?.value || 'Aline Menezes Beauty',
    phone: document.getElementById('studioPhone')?.value || '(49) 99820-0000',
    address:
      document.getElementById('studioAddress')?.value ||
      'Rua Manoel Ferraz de Campos Salles, n461, Sl 06 - São Cristóvão, Chapecó - SC, 89804-092',
    instagram:
      document.getElementById('studioInstagram')?.value ||
      '@alinemenezes.beauty',
    whatsapp:
      document.getElementById('studioWhatsApp')?.value || '5549998200000',
  };

  try {
    localStorage.setItem(STORAGE_KEYS.STUDIO_INFO, JSON.stringify(studioInfo));
    showAutoSaveIndicator();
    console.log('✅ Informações do estúdio salvas automaticamente');

    // Atualizar links dinâmicos no header se necessário
    updateHeaderLinks();
  } catch (error) {
    console.error('❌ Erro ao salvar informações do estúdio:', error);
    showNotification('Erro ao salvar informações do estúdio', 'error');
  }
}

function autoSaveWorkingHours() {
  console.log('💾 Auto-salvando horários de funcionamento');

  const workingHours = {
    weekdays: document.getElementById('weekdaysHours')?.value || '9h às 18h',
    saturday: document.getElementById('saturdayHours')?.value || '9h às 16h',
    sunday: document.getElementById('sundayHours')?.value || 'Fechado',
    notes:
      document.getElementById('hoursNotes')?.value ||
      'Atendimento mediante agendamento',
  };

  try {
    localStorage.setItem(
      STORAGE_KEYS.WORKING_HOURS,
      JSON.stringify(workingHours),
    );
    showAutoSaveIndicator();
    console.log('✅ Horários de funcionamento salvos automaticamente');
  } catch (error) {
    console.error('❌ Erro ao salvar horários:', error);
    showNotification('Erro ao salvar horários de funcionamento', 'error');
  }
}

function updateHeaderLinks() {
  console.log('🔗 Atualizando links do header');

  try {
    const savedStudioInfo = localStorage.getItem(STORAGE_KEYS.STUDIO_INFO);
    if (savedStudioInfo) {
      const studioInfo = JSON.parse(savedStudioInfo);

      // Atualizar links do WhatsApp
      const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
      whatsappLinks.forEach((link) => {
        if (studioInfo.whatsapp) {
          const message = encodeURIComponent(
            'Olá! Vim através do catálogo online e gostaria de mais informações sobre os serviços.',
          );
          link.href = `https://wa.me/${studioInfo.whatsapp}?text=${message}`;
        }
      });

      // Atualizar links do Instagram
      const instagramLinks = document.querySelectorAll(
        'a[href*="instagram.com"]',
      );
      instagramLinks.forEach((link) => {
        if (studioInfo.instagram) {
          const instagramHandle = studioInfo.instagram.replace('@', '');
          link.href = `https://instagram.com/${instagramHandle}`;
        }
      });

      // Atualizar textos do telefone
      const phoneTexts = document.querySelectorAll(
        'a[href*="wa.me"] span, a[href*="wa.me"]',
      );
      phoneTexts.forEach((element) => {
        if (element.textContent.includes('99820-0000') && studioInfo.phone) {
          element.textContent = element.textContent.replace(
            '(49) 99820-0000',
            studioInfo.phone,
          );
        }
      });

      console.log('✅ Links do header atualizados');
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar links:', error);
  }
}

// Funções de salvamento e carregamento
function saveBackgroundImage() {
  console.log('💾 Salvando imagem de fundo no localStorage');

  if (currentBackgroundImage) {
    try {
      localStorage.setItem(
        STORAGE_KEYS.BACKGROUND_IMAGE,
        currentBackgroundImage,
      );
      console.log('✅ Imagem de fundo salva com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar imagem:', error);
      showNotification(
        'Erro ao salvar imagem. Arquivo muito grande para o armazenamento local.',
        'error',
      );
      return false;
    }
  }
  return true;
}

function loadBackgroundImage() {
  console.log('📂 Carregando imagem de fundo do localStorage');

  try {
    const savedImage = localStorage.getItem(STORAGE_KEYS.BACKGROUND_IMAGE);
    if (savedImage) {
      currentBackgroundImage = savedImage;
      applyBackgroundImage(savedImage);
      updateBackgroundStatus('Imagem salva anteriormente');
      console.log('✅ Imagem de fundo carregada com sucesso');
      return true;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar imagem:', error);
  }
  return false;
}

function saveAllSettings() {
  console.log('💾 Salvando todas as configurações');

  // Salvar imagem de fundo
  const backgroundSaved = saveBackgroundImage();

  // Salvar informações do estúdio
  const studioInfo = {
    name:
      document.querySelector('input[value="Aline Menezes Beauty"]')?.value ||
      'Aline Menezes Beauty',
    phone:
      document.querySelector('input[value="(49) 99820-0000"]')?.value ||
      '(49) 99820-0000',
    address:
      document.querySelector('input[value*="Rua Manoel Ferraz"]')?.value ||
      'Rua Manoel Ferraz de Campos Salles, n461, Sl 06 - São Cristóvão, Chapecó - SC, 89804-092',
  };

  try {
    localStorage.setItem(STORAGE_KEYS.STUDIO_INFO, JSON.stringify(studioInfo));
    console.log('✅ Informações do estúdio salvas');
  } catch (error) {
    console.error('❌ Erro ao salvar informações do estúdio:', error);
  }

  // Salvar horários de funcionamento
  const workingHours = {
    weekdays:
      document.querySelector('input[value="9h às 18h"]')?.value || '9h às 18h',
    saturday:
      document.querySelector('input[value="9h às 16h"]')?.value || '9h às 16h',
  };

  try {
    localStorage.setItem(
      STORAGE_KEYS.WORKING_HOURS,
      JSON.stringify(workingHours),
    );
    console.log('✅ Horários de funcionamento salvos');
  } catch (error) {
    console.error('❌ Erro ao salvar horários:', error);
  }

  // Mostrar indicador de salvamento
  showAutoSaveIndicator();

  if (backgroundSaved) {
    showNotification(
      '✅ Todas as configurações foram salvas com sucesso!',
      'success',
    );
  } else {
    showNotification(
      '⚠️ Configurações salvas, mas houve problema com a imagem de fundo.',
      'warning',
    );
  }
}

function restoreDefaultSettings() {
  console.log('🔄 Restaurando configurações padrão');

  if (
    confirm(
      'Tem certeza que deseja restaurar todas as configurações padrão? Esta ação não pode ser desfeita.',
    )
  ) {
    // Limpar localStorage
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    // Remover imagem de fundo
    removeBackground();

    // Restaurar valores padrão nos inputs
    const studioNameInput = document.querySelector(
      'input[value*="Aline Menezes"]',
    );
    if (studioNameInput) studioNameInput.value = 'Aline Menezes Beauty';

    const phoneInput = document.querySelector('input[value*="99820"]');
    if (phoneInput) phoneInput.value = '(49) 99820-0000';

    const addressInput = document.querySelector('input[value*="Rua Manoel"]');
    if (addressInput)
      addressInput.value =
        'Rua Manoel Ferraz de Campos Salles, n461, Sl 06 - São Cristóvão, Chapecó - SC, 89804-092';

    const weekdaysInput = document.querySelector('input[value*="9h às 18h"]');
    if (weekdaysInput) weekdaysInput.value = '9h às 18h';

    const saturdayInput = document.querySelector('input[value*="9h às 16h"]');
    if (saturdayInput) saturdayInput.value = '9h às 16h';

    showNotification('🔄 Configurações restauradas para o padrão!', 'success');
    console.log('✅ Configurações padrão restauradas');
  }
}

function loadAllSettings() {
  console.log('📂 Carregando todas as configurações salvas');

  // Carregar imagem de fundo
  loadBackgroundImage();

  // Carregar informações do estúdio
  try {
    const savedStudioInfo = localStorage.getItem(STORAGE_KEYS.STUDIO_INFO);
    if (savedStudioInfo) {
      const studioInfo = JSON.parse(savedStudioInfo);

      // Usar IDs específicos para carregar os dados
      if (studioInfo.name) {
        const nameInput = document.getElementById('studioName');
        if (nameInput) nameInput.value = studioInfo.name;
      }

      if (studioInfo.phone) {
        const phoneInput = document.getElementById('studioPhone');
        if (phoneInput) phoneInput.value = studioInfo.phone;
      }

      if (studioInfo.address) {
        const addressInput = document.getElementById('studioAddress');
        if (addressInput) addressInput.value = studioInfo.address;
      }

      if (studioInfo.instagram) {
        const instagramInput = document.getElementById('studioInstagram');
        if (instagramInput) instagramInput.value = studioInfo.instagram;
      }

      if (studioInfo.whatsapp) {
        const whatsappInput = document.getElementById('studioWhatsApp');
        if (whatsappInput) whatsappInput.value = studioInfo.whatsapp;
      }

      // Atualizar links do header
      updateHeaderLinks();

      console.log('✅ Informações do estúdio carregadas');
    }
  } catch (error) {
    console.error('❌ Erro ao carregar informações do estúdio:', error);
  }

  // Carregar horários de funcionamento
  try {
    const savedWorkingHours = localStorage.getItem(STORAGE_KEYS.WORKING_HOURS);
    if (savedWorkingHours) {
      const workingHours = JSON.parse(savedWorkingHours);

      if (workingHours.weekdays) {
        const weekdaysInput = document.getElementById('weekdaysHours');
        if (weekdaysInput) weekdaysInput.value = workingHours.weekdays;
      }

      if (workingHours.saturday) {
        const saturdayInput = document.getElementById('saturdayHours');
        if (saturdayInput) saturdayInput.value = workingHours.saturday;
      }

      if (workingHours.sunday) {
        const sundayInput = document.getElementById('sundayHours');
        if (sundayInput) sundayInput.value = workingHours.sunday;
      }

      if (workingHours.notes) {
        const notesInput = document.getElementById('hoursNotes');
        if (notesInput) notesInput.value = workingHours.notes;
      }

      console.log('✅ Horários de funcionamento carregados');
    }
  } catch (error) {
    console.error('❌ Erro ao carregar horários:', error);
  }
}

function showAutoSaveIndicator() {
  const indicator = document.getElementById('autoSaveIndicator');
  if (indicator) {
    indicator.classList.add('show');
    setTimeout(() => {
      indicator.classList.remove('show');
    }, 2000);
  }
}

// Sistema de galeria de imagens
let currentSlides = {};
let currentServiceDetails = null;
let currentSlideLarge = 0;

// Dados dos serviços (simulando banco de dados)
const servicesData = {
  1: {
    name: 'Volume Brasileiro',
    description:
      'Técnica brasileira exclusiva que proporciona volume natural e elegante aos cílios. Utilizamos fios de alta qualidade que se adaptam perfeitamente ao formato dos seus olhos, criando um olhar marcante e sofisticado.',
    applicationPrice: 120.0,
    maintenance15Price: 60.0,
    maintenance20Price: 80.0,
    duration: 90,
    category: 'Cílios',
    images: ['💫', '✨'], // Placeholder - serão substituídas por imagens reais
  },
  2: {
    name: 'Volume Castanho',
    description:
      'Cílios em tom castanho para um look mais suave e natural. Perfeito para quem busca elegância discreta no dia a dia, mantendo a sofisticação sem exageros.',
    applicationPrice: 130.0,
    maintenance15Price: 65.0,
    maintenance20Price: 85.0,
    duration: 90,
    category: 'Cílios',
    images: ['🤎', '🌰'],
  },
  3: {
    name: 'Volume Glamour',
    description:
      'Máximo volume e glamour para ocasiões especiais. Técnica que proporciona densidade e comprimento excepcionais, criando um olhar dramático e impactante.',
    applicationPrice: 150.0,
    maintenance15Price: 75.0,
    maintenance20Price: 95.0,
    duration: 120,
    category: 'Cílios',
    images: ['✨', '💎'],
  },
  4: {
    name: 'Volume Fox',
    description:
      'Efeito fox eyes com alongamento lateral que realça o formato dos olhos. Técnica moderna que cria um olhar felino e sedutor, muito procurada pelas influenciadoras.',
    applicationPrice: 140.0,
    maintenance15Price: 70.0,
    maintenance20Price: 90.0,
    duration: 100,
    category: 'Cílios',
    images: ['🦊', '👁️'],
  },
  5: {
    name: 'Design de Sobrancelhas',
    description:
      'Modelagem perfeita para seu rosto com técnicas avançadas de design. Analisamos o formato do seu rosto para criar sobrancelhas harmoniosas e naturais.',
    applicationPrice: 45.0,
    maintenance15Price: 0.0,
    maintenance20Price: 0.0,
    duration: 45,
    category: 'Sobrancelhas',
    images: ['✨', '🎯'],
  },
  7: {
    name: 'Design com Tintura/Henna',
    description:
      'Design completo de sobrancelhas com coloração natural usando henna ou tintura. Realça a cor natural dos pelos e preenche falhas, proporcionando um resultado mais marcante e duradouro.',
    applicationPrice: 65.0,
    maintenance15Price: 0.0,
    maintenance20Price: 0.0,
    duration: 60,
    category: 'Sobrancelhas',
    images: ['🎨', '🌿'],
  },
  8: {
    name: 'Brow Lamination',
    description:
      'Técnica de laminação que disciplina e alinha os pelos das sobrancelhas, criando um efeito de volume e preenchimento natural. Ideal para sobrancelhas rebeldes ou com falhas.',
    applicationPrice: 85.0,
    maintenance15Price: 0.0,
    maintenance20Price: 0.0,
    duration: 75,
    category: 'Sobrancelhas',
    images: ['🌊', '✨'],
  },
  6: {
    name: 'Micropigmentação',
    description:
      'Técnica de micropigmentação para sobrancelhas, olhos e lábios. Procedimento semi-permanente que realça sua beleza natural com resultados duradouros e aspecto natural.',
    applicationPrice: 350.0,
    maintenance15Price: 150.0,
    maintenance20Price: 200.0,
    duration: 180,
    category: 'Micropigmentação',
    images: ['🎨', '💉'],
  },
  9: {
    name: 'Nanoblading Fio a Fio',
    description:
      'Técnica ultra realista de micropigmentação que desenha cada fio individualmente, criando sobrancelhas com aspecto completamente natural. Ideal para quem busca definição e preenchimento com máximo realismo.',
    applicationPrice: 450.0,
    maintenance15Price: 180.0,
    maintenance20Price: 220.0,
    duration: 150,
    category: 'Micropigmentação - Sobrancelhas',
    images: ['🖋️', '✨'],
  },
  10: {
    name: 'Shadow',
    description:
      'Técnica de micropigmentação que cria um efeito sombreado e esfumado nas sobrancelhas, proporcionando um resultado suave e natural. Perfeita para quem deseja um visual mais preenchido sem perder a naturalidade.',
    applicationPrice: 400.0,
    maintenance15Price: 160.0,
    maintenance20Price: 200.0,
    duration: 120,
    category: 'Micropigmentação - Sobrancelhas',
    images: ['🌫️', '✨'],
  },
  11: {
    name: 'Delineado de Olhos',
    description:
      'Micropigmentação de delineado permanente que realça e define o contorno dos olhos. Técnica precisa que proporciona um olhar mais marcante e expressivo, eliminando a necessidade de delineador diário.',
    applicationPrice: 380.0,
    maintenance15Price: 150.0,
    maintenance20Price: 190.0,
    duration: 120,
    category: 'Micropigmentação - Olhos',
    images: ['👁️', '✨'],
  },
  12: {
    name: 'Efeito Batom',
    description:
      'Micropigmentação labial que simula o efeito de batom natural, proporcionando cor e definição permanente aos lábios. Ideal para quem deseja lábios sempre com cor e contorno perfeito.',
    applicationPrice: 420.0,
    maintenance15Price: 170.0,
    maintenance20Price: 210.0,
    duration: 150,
    category: 'Micropigmentação - Lábios',
    images: ['💋', '✨'],
  },
  13: {
    name: 'Neutralização de Lábios Escuros',
    description:
      'Técnica especializada para correção de lábios escuros ou manchados, devolvendo a cor natural e uniforme. Procedimento que neutraliza pigmentações indesejadas e restaura a beleza natural dos lábios.',
    applicationPrice: 480.0,
    maintenance15Price: 190.0,
    maintenance20Price: 240.0,
    duration: 180,
    category: 'Micropigmentação - Lábios',
    images: ['🌹', '💄'],
  },
  14: {
    name: 'Lash Lifting',
    description:
      'Técnica que realça a curvatura natural dos seus cílios, proporcionando um efeito lifting duradouro sem a necessidade de extensões. Ideal para quem busca um olhar mais aberto e expressivo de forma natural.',
    applicationPrice: 80.0,
    maintenance15Price: 0.0,
    maintenance20Price: 0.0,
    duration: 60,
    category: 'Cílios',
    images: ['🌊', '✨'],
  },
};

// Funções da galeria
function showSlide(serviceId, slideIndex) {
  const gallery = document.getElementById(`gallery-${serviceId}`);
  const indicators = gallery.parentElement.querySelectorAll('.indicator');

  if (gallery) {
    gallery.style.transform = `translateX(-${slideIndex * 100}%)`;
    currentSlides[serviceId] = slideIndex;

    // Atualizar indicadores
    indicators.forEach((indicator, index) => {
      if (index === slideIndex) {
        indicator.classList.add('bg-white/80');
        indicator.classList.remove('bg-white/50');
      } else {
        indicator.classList.add('bg-white/50');
        indicator.classList.remove('bg-white/80');
      }
    });
  }
}

function nextSlide(serviceId) {
  const currentSlide = currentSlides[serviceId] || 0;
  const nextSlide = currentSlide === 1 ? 0 : currentSlide + 1;
  showSlide(serviceId, nextSlide);
}

function prevSlide(serviceId) {
  const currentSlide = currentSlides[serviceId] || 0;
  const prevSlide = currentSlide === 0 ? 1 : currentSlide - 1;
  showSlide(serviceId, prevSlide);
}

// Funções da galeria ampliada (modal de detalhes)
function showSlideLarge(slideIndex) {
  const gallery = document.getElementById('galleryLarge');
  const indicators = document.querySelectorAll(
    '.gallery-indicators-large .indicator',
  );

  if (gallery) {
    gallery.style.transform = `translateX(-${slideIndex * 100}%)`;
    currentSlideLarge = slideIndex;

    // Atualizar indicadores
    indicators.forEach((indicator, index) => {
      if (index === slideIndex) {
        indicator.classList.add('bg-white/80');
        indicator.classList.remove('bg-white/50');
      } else {
        indicator.classList.add('bg-white/50');
        indicator.classList.remove('bg-white/80');
      }
    });
  }
}

function nextSlideLarge() {
  const nextSlide = currentSlideLarge === 1 ? 0 : currentSlideLarge + 1;
  showSlideLarge(nextSlide);
}

function prevSlideLarge() {
  const prevSlide = currentSlideLarge === 0 ? 1 : currentSlideLarge - 1;
  showSlideLarge(prevSlide);
}

// Mostrar detalhes do serviço
function showServiceDetails(serviceId) {
  console.log('📋 Mostrando detalhes do serviço:', serviceId);

  const service = servicesData[serviceId];
  if (!service) {
    showNotification('Serviço não encontrado', 'error');
    return;
  }

  currentServiceDetails = serviceId;

  // Atualizar título
  document.getElementById('serviceDetailsTitle').textContent =
    `📋 ${service.name}`;

  // Atualizar preços
  document.getElementById('detailsApplicationPrice').textContent =
    `R$ ${service.applicationPrice.toFixed(2).replace('.', ',')}`;
  document.getElementById('detailsMaintenance15Price').textContent =
    `R$ ${service.maintenance15Price.toFixed(2).replace('.', ',')}`;
  document.getElementById('detailsMaintenance20Price').textContent =
    `R$ ${service.maintenance20Price.toFixed(2).replace('.', ',')}`;

  // Atualizar descrição
  document.getElementById('detailsDescription').textContent =
    service.description;

  // Atualizar informações adicionais
  document.getElementById('detailsDuration').textContent =
    `${service.duration} minutos`;
  document.getElementById('detailsCategory').textContent = service.category;

  // Configurar galeria ampliada
  const galleryLarge = document.getElementById('galleryLarge');
  const indicatorsLarge = document.querySelector('.gallery-indicators-large');

  // Limpar galeria
  galleryLarge.innerHTML = '';
  indicatorsLarge.innerHTML = '';

  // Adicionar slides
  service.images.forEach((image, index) => {
    const slide = document.createElement('div');
    slide.className =
      'gallery-slide min-w-full h-full flex items-center justify-center';
    slide.innerHTML = `<div class="text-8xl">${image}</div>`;
    galleryLarge.appendChild(slide);

    // Adicionar indicador
    const indicator = document.createElement('button');
    indicator.className = `indicator w-3 h-3 rounded-full ${index === 0 ? 'bg-white/80' : 'bg-white/50'} hover:bg-white/80 transition-all`;
    indicator.onclick = () => showSlideLarge(index);
    indicatorsLarge.appendChild(indicator);
  });

  // Resetar slide atual
  currentSlideLarge = 0;
  showSlideLarge(0);

  // Mostrar modal
  const modal = document.getElementById('serviceDetailsModal');
  if (modal) {
    modal.classList.add('active');
  }
}

function closeServiceDetailsModal() {
  const modal = document.getElementById('serviceDetailsModal');
  if (modal) {
    modal.classList.remove('active');
  }
  currentServiceDetails = null;
}

function shareService() {
  if (currentServiceDetails) {
    const service = servicesData[currentServiceDetails];
    const text = encodeURIComponent(
      `Confira este serviço incrível: ${service.name} - ${service.description.substring(0, 100)}... Agende já na Aline Menezes Beauty!`,
    );
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Upload de imagens para serviços (admin)
let selectedServiceImages = [];

function handleServiceImagesUpload(event) {
  console.log('📸 Processando upload de imagens do serviço');
  const files = Array.from(event.target.files);

  if (files.length > 2) {
    showNotification('Máximo 2 imagens permitidas por serviço', 'error');
    return;
  }

  selectedServiceImages = [];
  const preview = document.getElementById('selectedImagesPreview');
  preview.innerHTML = '';

  files.forEach((file, index) => {
    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        `Imagem ${index + 1} muito grande! Máximo 5MB permitido.`,
        'error',
      );
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotification(
        `Arquivo ${index + 1} não é uma imagem válida.`,
        'error',
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      selectedServiceImages.push(e.target.result);

      // Criar preview
      const previewImg = document.createElement('div');
      previewImg.className =
        'w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative';
      previewImg.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" class="w-full h-full object-cover rounded-lg">
                        <button onclick="removeServiceImage(${selectedServiceImages.length - 1})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                    `;
      preview.appendChild(previewImg);
    };
    reader.readAsDataURL(file);
  });

  if (files.length > 0) {
    showNotification(`${files.length} imagem(ns) selecionada(s)`, 'success');
  }
}

function removeServiceImage(index) {
  selectedServiceImages.splice(index, 1);

  // Atualizar preview
  const preview = document.getElementById('selectedImagesPreview');
  preview.innerHTML = '';

  selectedServiceImages.forEach((image, i) => {
    const previewImg = document.createElement('div');
    previewImg.className =
      'w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center relative';
    previewImg.innerHTML = `
                    <img src="${image}" alt="Preview" class="w-full h-full object-cover rounded-lg">
                    <button onclick="removeServiceImage(${i})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                `;
    preview.appendChild(previewImg);
  });
}

// Auto-rotação das galerias (opcional)
function startAutoRotation() {
  setInterval(() => {
    // Auto-rotacionar apenas se não estiver em modo admin
    if (!isAdminMode) {
      Object.keys(servicesData).forEach((serviceId) => {
        nextSlide(parseInt(serviceId));
      });
    }
  }, 5000); // Trocar a cada 5 segundos
}

// Carregar dados de clientes do localStorage
function loadClientsData() {
  console.log('📂 Carregando dados de clientes');

  try {
    const savedClients = localStorage.getItem('aline_beauty_clients');
    if (savedClients) {
      const parsedClients = JSON.parse(savedClients);
      // Mesclar com dados existentes
      Object.assign(clientsDatabase, parsedClients);
      console.log(
        '✅ Dados de clientes carregados:',
        Object.keys(clientsDatabase).length,
        'clientes',
      );
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados de clientes:', error);
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  console.log('📄 DOM carregado - Inicializando sistema');

  // Carregar dados de clientes
  loadClientsData();

  // Mostrar popup de boas-vindas após 1 segundo
  setTimeout(showWelcomePopup, 1000);

  // Configurar data mínima para agendamento (hoje)
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // Inicializar seção admin padrão
  showAdminSection('services');

  // Renderizar lista de serviços no admin
  renderServicesList();

  // Carregar configurações salvas
  loadAllSettings();

  // Inicializar slides em posição 0
  Object.keys(servicesData).forEach((serviceId) => {
    currentSlides[serviceId] = 0;
    showSlide(parseInt(serviceId), 0);
  });

  // Mostrar serviços de cílios inicialmente
  setTimeout(() => {
    filterServices('cilios');
  }, 500);

  // Iniciar auto-rotação das galerias
  setTimeout(startAutoRotation, 3000);

  console.log('✅ Sistema inicializado com sucesso!');
});

(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement('script');
      d.innerHTML =
        "window.__CF$cv$params={r:'98a1983aa249a429',t:'MTc1OTcxNjMzNS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName('head')[0].appendChild(d);
    }
  }
  if (document.body) {
    var a = document.createElement('iframe');
    a.height = 1;
    a.width = 1;
    a.style.position = 'absolute';
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = 'none';
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    if ('loading' !== document.readyState) c();
    else if (window.addEventListener)
      document.addEventListener('DOMContentLoaded', c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        'loading' !== document.readyState &&
          ((document.onreadystatechange = e), c());
      };
    }
  }
})();
