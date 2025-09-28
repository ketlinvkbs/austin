// --- CONFIGURAÇÕES GLOBAIS ---
// Guarda a URL da API e os elementos HTML para usar no código.
const API_URL = '/api';
let accessToken = localStorage.getItem('accessToken');
let currentManagingClientId = null;
const clientTableBody = document.getElementById('clientTableBody');
const clientForm = document.getElementById('clientForm');
const loginForm = document.getElementById('loginForm');
const addressForm = document.getElementById('addressForm');
const phoneForm = document.getElementById('phoneForm');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const clientModal = new bootstrap.Modal(document.getElementById('clienteModal'));
const manageModal = new bootstrap.Modal(document.getElementById('manageModal'));
const addressModal = new bootstrap.Modal(document.getElementById('addressModal'));
const phoneModal = new bootstrap.Modal(document.getElementById('phoneModal'));

// --- FUNÇÕES ---
// Função para fazer logout, limpando o token e recarregando a página.
function handleLogout() {
    localStorage.removeItem('accessToken');
    accessToken = null;
    location.reload();

}

// Função central para fazer todos os pedidos à API (já com o token).
async function apiRequest(endpoint, method = 'GET', data = null) {
    const config = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : null,
    };
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        if (response.status === 401) {
            window.location.href = '/login/';
            throw new Error('Não autorizado. Faça login novamente.');
        }
        if (!response.ok) {
            throw new Error('Erro na requisição à API');
        }
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Erro em apiRequest:', error);
        throw error;
    }
}

// Busca os clientes na API e desenha a tabela na tela.
async function fetchAndRenderClients() {
    loadingIndicator.style.display = 'block';
    clientTableBody.innerHTML = '';
    const searchTerm = searchInput.value;
    const filterValue = filterSelect.value;
    let url = `/clientes/?search=${searchTerm}`;
    if (filterValue) {
        url += `&status=${filterValue}`;
    }
    try {
        const clients = await apiRequest(url, 'GET');
        if (clients.length === 0) {
            clientTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Nenhum cliente encontrado.</td></tr>`;
        } else {
            clients.forEach(client => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td>${client.nome}</td>
                <td>${client.email}</td>
                <td>
                    <button class="btn btn-sm ${client.status === 'ATIVO' ? 'btn-success' :'btn-secondary'}" onclick="handleChangeStatus(${client.id})">
                    ${client.status}
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-light me-2" onclick="handleEdit(${client.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-info me-2" onclick="handleManage(${client.id})"><i class="bi bi-gear"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="handleDelete(${client.id})"><i class="bi bi-trash"></i></button>
                </td>
                `;
                clientTableBody.appendChild(tr);
            });
        }
    } catch (error) {
        clientTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
        console.error('Erro ao buscar clientes:', error);
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Salva um cliente (novo ou editado).
async function handleFormSubmit(event) {
    event.preventDefault();
    const clientData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        observacoes: document.getElementById('observacoes').value,
        enderecos: [],
        telefones: [],
    };
    const logadouro = document.getElementById('logadouro').value;
    if (logadouro) {
        const endereco = {
            logadouro: logadouro,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value,
        };
        clientData.enderecos.push(endereco);
    }
    const telefoneNumero = document.getElementById('telefone_numero').value;
    if (telefoneNumero) {
        const telefone = {
            telefone: {
                numero: telefoneNumero,
            },
            tipo: document.getElementById('telefone_tipo').value,
        };
        clientData.telefones.push(telefone);
    }
    const clientId = document.getElementById('clientId').value;
    const method = clientId ? 'PUT' : 'POST';
    const endpoint = clientId ? `/clientes/${clientId}/` : '/clientes/';
    try {
        await apiRequest(endpoint, method, clientData);
        clientModal.hide();
        fetchAndRenderClients();
    } catch (error) {
        alert('Não foi possível salvar o cliente.');
    }
}

// Altera o status de um cliente entre ATIVO, INATIVO e ARQUIVO.
async function handleChangeStatus(clientId) {
    try {
        await apiRequest(`/clientes/${clientId}/change_status/`, 'POST');

        fetchAndRenderClients()
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        alert('Não foi possivel alterar o status do cliente.');
    }
}

// Salva um endereço (novo ou editado).
async function handleAddressSubmit(event) {
    event.preventDefault();

    const addressData = {
        logadouro: document.getElementById('formLogadouro').value,
        numero: document.getElementById('formNumero').value,
        complemento: document.getElementById('formComplemento').value,
        bairro: document.getElementById('formBairro').value,
        cidade: document.getElementById('formCidade').value,
        estado: document.getElementById('formEstado').value,
        cep: document.getElementById('formCep').value,
        cliente_id: document.getElementById('addressClienteId').value,
    };

    const addressId = document.getElementById('addressIdToEdit').value;
    const method = addressId ? 'PUT' : 'POST';
    const endpoint = addressId ? `/enderecos/${addressId}/` : '/enderecos/';

    try {
        await apiRequest(endpoint, method, addressData);
        addressModal.hide();
        handleManage(currentManagingClientId);
    } catch (error) {
        console.error('Erro ao salvar endereço:', error);
        alert('Não foi possível salvar o endereço.');
    }

}

// Apaga um endereço após confirmação.
async function handleDeleteAddress(addressId) {
    if (confirm('tem certeza que deseja excluir este endereço?')) {
        try {
            await apiRequest(`/enderecos/${addressId}/`, 'DELETE');
            handleManage(currentManagingClientId);

        } catch (error) {
            console.error('Erro ao excluir endereço:', error);
            alert('Não foi possível excluir o endereço. ' + error.message);
        }
    }
}

// prepara o formulario para edição de um endereço.
async function handleEditAddress(addressId) {
    try {
        const address = await apiRequest(`/enderecos/${addressId}/`, 'GET');

        document.getElementById('addressIdToEdit').value = address.id;
        document.getElementById('formLogadouro').value = address.logadouro;
        document.getElementById('formNumero').value = address.numero;
        document.getElementById('formComplemento').value = address.complemento;
        document.getElementById('formBairro').value = address.bairro;
        document.getElementById('formCidade').value = address.cidade;
        document.getElementById('formEstado').value = address.estado;
        document.getElementById('formCep').value = address.cep;
        document.getElementById('addressClienteId').value = currentManagingClientId;
        document.querySelector('#addressModal .modal-title').textContent = 'Editar Endereço';
        addressModal.show();
    } catch (error) {
        alert('não foi possivel carregar os dados do endereço.');
    }
}

// Salva um telefone (novo ou editado).
async function handlePhoneSubmit(event) {
    event.preventDefault();

    const phoneData = {
        numero: document.getElementById('formTelefoneNumero').value,
        tipo: document.getElementById('formTelefoneTipo').value,
        cliente: document.getElementById('phoneClienteId').value,
    };

    const phoneRelationId = document.getElementById('phoneRelationIdToEdit').value;
    const method = phoneRelationId ? 'PUT' : 'POST';
    const endpoint = phoneRelationId ? `/cliente-telefones/${phoneRelationId}/` : '/cliente-telefones/';
    try {
        await apiRequest(endpoint, method, phoneData);
        phoneModal.hide();
        handleManage(currentManagingClientId);
    } catch (error) {
        console.error('Erro ao salvar telefone: ', error);
        alert('Não foi possível salvar o telefone. ' + error.message);
    }
}

// Apaga um telefone após confirmação.
async function handleDeletePhone(phoneRelationId) {
    if (confirm('Tem certeza que deseja apagar esse telefone?')) {
        try {
            await apiRequest(`/cliente-telefones/${phoneRelationId}/`, 'DELETE');
            handleManage(currentManagingClientId);
        } catch (error) {
            console.error('Erro ao apagar telefone:', error);
            alert('Não foi possível apagar o Telefone.');
        }
    }
}

//Prepara o formulário para edição de um telefone.
async function handleEditPhone(phoneRelationId) {
    try {
        const phoneRelation = await apiRequest(`/cliente-telefones/${phoneRelationId}/`, 'GET');
        document.getElementById('phoneRelationIdToEdit').value = phoneRelation.id;
        document.getElementById('formTelefoneNumero').value = phoneRelation.telefone.numero;
        document.getElementById('formTelefoneTipo').value = phoneRelation.tipo;

        document.querySelector('#phoneModal .modal-title').textContent = 'Editar Telefone';
        phoneModal.show();
    } catch (error) {
        alert('Não foi possivel carregar os dados do telefone para edição.');
    }
}

// Apaga um cliente após confirmação.
async function handleDelete(clientId) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        try {
            await apiRequest(`/clientes/${clientId}/`, 'DELETE');
            fetchAndRenderClients();
        } catch (error) {
            alert('Não foi possível excluir o cliente.');
        }
    }
}

// Prepara o formulário para edição de um cliente.
async function handleEdit(clientId) {
    try {
        const client = await apiRequest(`/clientes/${clientId}/`, 'GET');
        document.getElementById('clientId').value = client.id;
        document.getElementById('nome').value = client.nome;
        document.getElementById('email').value = client.email;
        document.getElementById('observacoes').value = client.observacoes;
        clientForm.querySelector('#logadouro').value = '';
        clientForm.querySelector('#numero').value = '';
        clientForm.querySelector('#complemento').value = '';
        clientForm.querySelector('#bairro').value = '';
        clientForm.querySelector('#cidade').value = '';
        clientForm.querySelector('#estado').value = '';
        if (client.enderecos.length > 0) {
            const endereco = client.enderecos[0];
            clientForm.querySelector('#logadouro').value = endereco.logadouro;
            clientForm.querySelector('#numero').value = endereco.numero;
            clientForm.querySelector('#complemento').value = endereco.complemento;
            clientForm.querySelector('#bairro').value = endereco.bairro;
            clientForm.querySelector('#cidade').value = endereco.cidade;
            clientForm.querySelector('#estado').value = endereco.estado;
        }
        clientForm.querySelector('#telefone_numero').value = '';
        clientForm.querySelector('#telefone_tipo').value = 'CELULAR';

        if (client.telefones.length > 0) {
            const telefoneInfo = client.telefones[0];
            clientForm.querySelector('#telefone_numero').value = telefoneInfo.telefone.numero;
            clientForm.querySelector('#telefone_tipo').value = telefoneInfo.tipo;
        }
        document.getElementById('clientModalLabel').textContent = 'Editar Cliente';
        clientModal.show();
    } catch (error) {
        alert('Não foi possível carregar os dados para edição.');
    }
}

// Prepara e mostra o painel de gestão de um cliente.
async function handleManage(clientId) {
    currentManagingClientId = clientId;
    try {
        const client = await apiRequest(`/clientes/${clientId}/`, 'GET');
        document.getElementById('manageModalClientName').textContent = client.nome;
        document.getElementById('manageEmail').textContent = client.email;
        document.getElementById('manageStatus').textContent = client.status;
        document.getElementById('manageObservacoes').textContent = client.observacoes;

        const addressList = document.getElementById('addressList');
        addressList.innerHTML = '';
        if (client.enderecos.length > 0) {
            client.enderecos.forEach(addr => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `
                    <span>${addr.logadouro}, ${addr.numero} - ${addr.bairro}</span>
                    <div class="float-end">
                    <button class="btn btn-sm btn-outline-light py-0 px-1 me-1" data-action="edit" data-address-id="${addr.id}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger py-0 px-1" data-action="delete" data-address-id="${addr.id}"><i class="bi bi-trash"></i></button>
                    </div>
                `;
                addressList.appendChild(li);
            });
        } else {
            addressList.innerHTML = '<li class="list-group-item">Nenhum endereço cadastrado.</li>';
        }

        const phoneList = document.getElementById('phoneList');
        phoneList.innerHTML = '';
        if (client.telefones.length > 0) {
            client.telefones.forEach(phone => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${phone.telefone.numero} (${phone.tipo})</span>
                        <div>
                            <button class="btn btn-sm btn-outline-light py-0 px-1 me-1" data-action="edit-phone" data-phone-id="${phone.id}"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-outline-danger py-0 px-1" data-action="delete-phone" data-phone-id="${phone.id}"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                `;

                phoneList.appendChild(li);
            });
        } else {
            phoneList.innerHTML = '<li class="list-group-item">Nenhum telefone cadastrado.</li>';
        }

        manageModal.show();

    } catch (error) {
        alert('Não foi possível carregar os dados do cliente.');
        console.error('Erro em handleManage:', error);
    }
}

// Carrega os dados do perfil do usuário logado.
async function loadProfileData() {
    try {
        const userData = await apiRequest('/user/', 'GET');

        document.getElementById('profileUsername').value = userData.username;
        document.getElementById('profileFirstName').value = userData.first_name;
        document.getElementById('profileLastName').value = userData.last_name
        document.getElementById('profileEmail').value = userData.email;
    } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        alert('Não foi possível carregar os dados do perfil.');
    }

}

// Atualiza os dados do perfil do usuário.
async function handleProfileUpdate(event) {
    event.preventDefault();

    const updatedData = {
        first_name: document.getElementById('profileFirstName').value,
        last_name: document.getElementById('profileLastName').value,
        email: document.getElementById('profileEmail').value,
    };
    try {
        await apiRequest('/user/', 'PATCH', updatedData);
        alert('Perfil atualizado com sucesso!');

        const offcanvasElement = document.getElementById('offcanvasPerfil');
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
        offcanvas.hide();
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert('Não foi possível atualizar o perfil.');
    }
}

// --- OUVINTES DE EVENTOS ---
// Liga as funções às ações do utilizador na página.

// Quando o botão de logout é clicado, chama a função de logout.
logoutBtn.addEventListener('click', handleLogout);

// Quando o formulário de cliente é enviado, chama a função para salvar.
clientForm.addEventListener('submit', handleFormSubmit);

// Quando o formulário de telefone é enviado, chama a função para salvar.
phoneForm.addEventListener('submit', handlePhoneSubmit);

// Abre a aba de visualizar o perfil do usuario
document.getElementById('offcanvasPerfil').addEventListener('show.bs.offcanvas', loadProfileData);

// Atualiza os dados do perfil quando o formulário é enviado.
const profileForm = document.getElementById('perfilForm');
profileForm.addEventListener('submit', handleProfileUpdate);

// Limpa o formulário quando o popup de cliente é aberto para um novo registo.
clientModal._element.addEventListener('show.bs.modal', (event) => {
    if (event.relatedTarget && event.relatedTarget.matches('[data-bs-target="#clienteModal"]')) {
        clientForm.reset();
        document.getElementById('clientId').value = '';
        document.getElementById('clientModalLabel').textContent = 'Adicionar Cliente';
    }
});


document.getElementById('addAddressBtn').addEventListener('click', () => {
    document.querySelector('#addressModal .modal-title').textContent = 'Adicionar Novo Endereço';
    document.getElementById('addressForm').reset();
    document.getElementById('addressIdToEdit').value = '';
    document.getElementById('addressClienteId').value = currentManagingClientId;
    addressModal.show();
});

// Delegação de eventos para a lista de endereços.
document.getElementById('addressList').addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    const action = target.dataset.action;
    const addressId = target.dataset.addressId;

    if (action === 'edit') {
        handleEditAddress(addressId);
    } else if (action === 'delete') {
        handleDeleteAddress(addressId);
    }
})

// Delegação de eventos para a lista de telefones.

document.getElementById('phoneList').addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    const action = target.dataset.action;
    const phoneId = target.dataset.phoneId;

    if (action === 'edit-phone') {
        handleEditPhone(phoneId);
    } else if (action === 'delete-phone') {
        handleDeletePhone(phoneId);
    }
});

document.getElementById('addPhoneBtn').addEventListener('click', () => {
    document.querySelector('#phoneModal .modal-title').textContent = 'Adicionar Novo Telefone';
    document.getElementById('phoneForm').reset();
    document.getElementById('phoneRelationIdToEdit').value = '';
    document.getElementById('phoneClienteId').value = currentManagingClientId;
    phoneModal.show();
});

// Atualiza a lista 300ms após o utilizador digitar na busca.
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchAndRenderClients, 300);
});


//quando o formulario de endereço for enviado cham a função handleAddressSubmit
addressForm.addEventListener('submit', handleAddressSubmit);

// Atualiza a lista quando o filtro é alterado.
filterSelect.addEventListener('change', fetchAndRenderClients);

// --- INICIALIZAÇÃO ---
// Código que é executado quando a página carrega.

// Se já existir um token, busca os clientes. Senão, mostra a janela de login.
if (accessToken) {
    fetchAndRenderClients();
} else {
    window.location.href = '/login/';
}