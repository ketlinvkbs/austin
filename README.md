# Austin CRM - Sistema de Gestão de Clientes

**Projeto Full-Stack de CRM (API REST + SPA) com foco em segurança e arquitetura multi-usuário.**

---

## 🚀 Aplicação em Funcionamento!

Pode testar este projeto ao vivo no seguinte link. Crie um novo utilizador e comece a adicionar clientes!

**Deploy:** **[https://austin-co4l.onrender.com](https://austin-co4l.onrender.com)**

*(Nota: O servidor gratuito do Render pode demorar alguns segundos a "acordar" no primeiro acesso.)*

---

## 1. Visão do Produto (O Problema)

Como profissional ou freelancer, gerir clientes é um desafio. Muitas ferramentas são complexas ou caras demais para um controlo simples de contactos, endereços e telefones.

O Austin foi desenhado como um *sistema de gestão pessoal* (PSR), uma ferramenta leve, segura e eficiente. Ele permite que cada utilizador se registe e gira a sua própria carteira de clientes, com a garantia de que os seus dados são privados e acessíveis apenas por ele.

## 2. Funcionalidades Principais

O "Austin" é composto por uma API RESTful robusta (Back-End) e uma aplicação de página única (SPA) (Front-End).

### Funcionalidades do Back-End (API)
* **Autenticação Segura:** Registo de novos utilizadores e login via **Token JWT** (JSON Web Token).
* **Segurança Multi-Usuário (Multi-Tenant):** A API garante que um utilizador só pode ver e gerir os clientes que ele próprio criou.
* **CRUD Completo de Clientes:** Operações de Criar, Ler, Atualizar e Apagar clientes.
* **Gestão de Endereços e Telefones:** Serializers aninhados permitem adicionar múltiplos endereços e telefones a um único cliente.
* **Lógica de Negócio Customizada:** Um endpoint de API personalizado (`/change_status/`) para alterar o estado do cliente (ATIVO, INATIVO, ARQUIVADO).
* **Pesquisa e Filtros:** A API permite pesquisar clientes por nome/email e filtrar por status.

### Funcionalidades do Front-End (SPA)
* **Interface Reativa:** Construído com JavaScript puro, o front-end consome a API do Austin.
* **Gestão Completa:** O utilizador pode realizar todas as operações da API (criar, editar, apagar) através de uma interface gráfica com pop-ups (modais).
* **Gestão de Perfil:** O utilizador pode visualizar e atualizar os seus próprios dados de perfil.
* **Filtragem e Pesquisa:** Interface para filtrar e pesquisar clientes em tempo real.

## 3. Stack de Tecnologias

Este projeto foi construído utilizando tecnologias modernas e prontas para produção.

| Área | Tecnologia | Motivo |
| :--- | :--- | :--- |
| **Back-End** | Python 3 | Linguagem principal. |
| **Back-End** | Django | Framework web principal. |
| **Back-End** | Django REST Framework (DRF) | Para a construção da API RESTful. |
| **Segurança** | Django REST Framework (Simple JWT) | Para autenticação baseada em Token JWT. |
| **Back-End** | Django Filters | Para facilitar a filtragem de queries na API. |
| **Banco de Dados** | PostgreSQL / SQLite | Utiliza `dj_database_url` para flexibilidade entre produção e desenvolvimento. |
| **Front-End** | JavaScript (Vanilla JS) | Para a lógica do SPA e consumo da API. |
| **Front-End** | Bootstrap 5 | Para a interface de utilizador e design responsivo. |
| **Front-End** | HTML5 / CSS3 | Estrutura e estilização. |
| **Deploy** | Gunicorn | Servidor WSGI para produção. |
| **Deploy** | Whitenoise | Para servir ficheiros estáticos em produção. |
| **Deploy** | Render | Plataforma de PaaS para o deploy do projeto. |

## 4. Como Executar o Projeto Localmente

Para executar este projeto na sua máquina, siga os passos:

1.  **Clone o repositório:**
    ```bash
    git clone 
    cd Austin
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # No Windows: .\venv\Scripts\activate
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Execute as migrações do banco de dados:**
    ```bash
    python manage.py migrate
    ```

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    python manage.py runserver
    ```

6.  **Acesse a aplicação:**
    * O site estará em: `http://127.0.0.1:8000/`
    * A API estará em: `http://127.0.0.1:8000/api/`

## 5. Endpoints da API (Documentação)

| Método | Endpoint | Descrição | Autenticação |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register/` | Regista um novo utilizador. | Não Requerida |
| `POST` | `/api/token/` | Obtém um Token JWT (Login). | Não Requerida |
| `POST` | `/api/token/refresh/` | Atualiza um Token JWT. | Requerida |
| `GET` | `/api/user/` | Obtém os dados do utilizador logado. | Requerida |
| `PATCH` | `/api/user/` | Atualiza os dados do utilizador logado. | Requerida |
| `GET` `POST` | `/api/clientes/` | Lista os clientes do utilizador ou cria um novo cliente. | Requerida |
| `GET` `PUT` `DELETE` | `/api/clientes/<id>/` | Obtém, atualiza ou apaga um cliente específico. | Requerida |
| `POST` | `/api/clientes/<id>/change_status/` | Altera o status de um cliente. | Requerida |
| `POST` | `/api/enderecos/` | Cria um novo endereço (associado a um cliente). | Requerida |
| `PUT` `DELETE` | `/api/enderecos/<id>/` | Atualiza ou apaga um endereço. | Requerida |
| `POST` | `/api/cliente-telefones/` | Cria uma nova relação de telefone (associada a um cliente). | Requerida |
| `PUT` `DELETE` | `/api/cliente-telefones/<id>/` | Atualiza ou apaga uma relação de telefone. | Requerida |