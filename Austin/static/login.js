document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api';
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const registerForm = document.getElementById('registerForm');
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

    async function handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch(`${API_URL}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                loginError.classList.remove('d-none');
            } else {
                const data = await response.json();
                localStorage.setItem('accessToken', data.access);
                window.location.href = '/app/';
            }
        } catch (error) {
            console.error('Erro de rede no login', error);
            loginError.classList.remove('d-none');
        }
    }

    async function handleRegisterSubmit(event) {
        event.preventDefault();
        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const errorDiv = document.getElementById('registerError');

        if (password !== passwordConfirm) {
            errorDiv.textContent = 'As senhas não coincidem.';
            errorDiv.classList.remove('d-none');
            return;
        }
        const userData = {
            username,
            email,
            password,
            first_name: firstName,
            last_name: lastName,
        };
        try {
            const response = await fetch(`${API_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                errorDiv.textContent = Object.values(errorData).flat().join(' ');
                errorDiv.classList.remove('d-none');
            } else {
                registerModal.hide();
                alert('Conta criada com sucesso! Por favor, faça login.');
            }
        } catch (error) {
            errorDiv.textContent = 'Ocorreu um erro de rede. Tente novamente.';
            errorDiv.classList.remove('d-none');
            console.error('Erro no registro', error);
        }
    }

    loginForm.addEventListener('submit', handleLogin);
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
});