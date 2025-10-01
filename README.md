# Projeto-da-infinity
Um projeto pessoal de finalização do meu curso de full stack
Abaixo sera apresentado os requerimentos:

# Sistema de Controle de Acesso - Wayne Industries

Este projeto é um sistema simples de controle de acesso para recursos internos, com autenticação, autorização, dashboard visual e gestão de usuários e recursos.

## Requisitos

- Python 3.10+
- SQLite3
- Navegador web moderno

## Instalação

1. Clone o repositório ou copie os arquivos para uma pasta local.
2. Instale as dependências Python:
   ```bash
   pip install bcrypt
   ```

## Como rodar o backend

1. Na pasta `backend`, execute:
   ```bash
   python3 app.py
   ```
2. O servidor será iniciado em `http://localhost:8000`.

## Como rodar o frontend

1. Abra o arquivo `frontend/index.html` ou `frontend/dashboard.html` em seu navegador.
2. Recomenda-se usar uma extensão de servidor local (ex: Live Server no VS Code) para evitar problemas de CORS.

## Fluxo de uso

- Faça login como admin (usuário padrão: `admin`, senha: `admin`).
- Cadastre usuários e recursos.
- Gerencie recursos e usuários pelo dashboard.
- Apenas administradores podem cadastrar e listar usuários.
- Recursos podem ser editados/deletados pelo admin.

## Solução de problemas

- Se o backend não iniciar, verifique se a porta 8000 está livre:
  ```bash
  fuser -k 8000/tcp
  ```
- Se "aguarde..." não sai do login, verifique se o backend está rodando.
- Se não conseguir deletar/editar recursos, confira se está logado como admin.

## Estrutura

- `backend/app.py`: Servidor Python + SQLite
- `frontend/`: HTML, CSS, JS do sistema

## Observações

- O banco de dados é criado automaticamente no primeiro uso.
- Senhas de admin podem ser redefinidas diretamente no banco via SQLite.

---

Wayne Enterprises - Segurança em primeiro lugar!
