import sqlite3
import json
import bcrypt
from http.server import BaseHTTPRequestHandler, HTTPServer

# Caminho do banco de dados SQLite
DB_PATH = "banco.db"


# Inicializa o banco de dados e cria tabelas se não existirem
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Cria tabelas antes de qualquer SELECT
    c.execute(
        """CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo TEXT NOT NULL
    )"""
    )
    c.execute(
        """CREATE TABLE IF NOT EXISTS recursos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        categoria TEXT NOT NULL,
        descricao TEXT
    )"""
    )
    # Garante que existe pelo menos um admin padrão
    c.execute("SELECT COUNT(*) FROM usuarios WHERE tipo='admin'")
    if c.fetchone()[0] == 0:
        senha_hash = bcrypt.hashpw("admin".encode(), bcrypt.gensalt()).decode()
        c.execute(
            "INSERT INTO usuarios (nome, senha, tipo) VALUES (?, ?, ?)",
            ("admin", senha_hash, "admin"),
        )
    conn.commit()
    conn.close()


# Sistema de Gerenciamento de Segurança - Backend Simples
# Python puro + SQLite
class SimpleHandler(BaseHTTPRequestHandler):
    def do_PUT(self):
        if self.path.startswith("/recursos/"):
            recurso_id = self.path.split("/")[-1]
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length)) if length > 0 else {}
            nome = data.get("nome")
            categoria = data.get("categoria")
            descricao = data.get("descricao")
            admin_nome = self.headers.get("X-Admin-Nome")
            admin_senha = self.headers.get("X-Admin-Senha")
            if not (nome and categoria):
                self._set_headers(400)
                self.wfile.write(
                    json.dumps({"erro": "Nome e categoria obrigatórios."}).encode()
                )
                return
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT senha, tipo FROM usuarios WHERE nome=?", (admin_nome,))
            admin_row = c.fetchone()
            if (
                not admin_row
                or not bcrypt.checkpw(admin_senha.encode(), admin_row[0].encode())
                or admin_row[1] != "admin"
            ):
                conn.close()
                self._set_headers(403)
                self.wfile.write(
                    json.dumps(
                        {"erro": "Apenas administradores podem editar recursos."}
                    ).encode()
                )
                return
            c.execute(
                "UPDATE recursos SET nome=?, categoria=?, descricao=? WHERE id=?",
                (nome, categoria, descricao, recurso_id),
            )
            conn.commit()
            conn.close()
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "Recurso atualizado"}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"erro": "Rota não encontrada"}).encode())

    def do_DELETE(self):
        if self.path.startswith("/recursos/"):
            recurso_id = self.path.split("/")[-1]
            admin_nome = self.headers.get("X-Admin-Nome")
            admin_senha = self.headers.get("X-Admin-Senha")
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT senha, tipo FROM usuarios WHERE nome=?", (admin_nome,))
            admin_row = c.fetchone()
            if (
                not admin_row
                or admin_row[1] != "admin"
                or not (
                    admin_row[0] == admin_senha
                    or bcrypt.checkpw(admin_senha.encode(), admin_row[0].encode())
                )
            ):
                conn.close()
                self._set_headers(403)
                self.wfile.write(
                    json.dumps(
                        {"erro": "Apenas administradores podem deletar recursos."}
                    ).encode()
                )
                return
            c.execute("DELETE FROM recursos WHERE id=?", (recurso_id,))
            conn.commit()
            conn.close()
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "Recurso deletado"}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"erro": "Rota não encontrada"}).encode())
            if (
                not admin_row
                or admin_row[1] != "admin"
                or not (
                    admin_row[0] == admin_senha
                    or bcrypt.checkpw(admin_senha.encode(), admin_row[0].encode())
                )
            ):
                conn.close()
                self._set_headers(403)
                self.wfile.write(
                    json.dumps(
                        {"erro": "Apenas administradores podem editar recursos."}
                    ).encode()
                )
                return

    def do_OPTIONS(self):
        self._set_headers()
        self.wfile.write(b"")

    def do_GET(self):
        if self.path == "/recursos":
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT * FROM recursos")
            recursos = [
                dict(id=row[0], nome=row[1], categoria=row[2], descricao=row[3])
                for row in c.fetchall()
            ]
            conn.close()
            self._set_headers()
            self.wfile.write(json.dumps(recursos).encode())
        elif self.path == "/usuarios":
            admin_nome = self.headers.get("X-Admin-Nome")
            admin_senha = self.headers.get("X-Admin-Senha")
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT senha, tipo FROM usuarios WHERE nome=?", (admin_nome,))
            row = c.fetchone()
            if not row or row[1] != "admin":
                conn.close()
                self._set_headers(403)
                self.wfile.write(
                    json.dumps(
                        {"erro": "Apenas administradores podem ver usuários"}
                    ).encode()
                )
                return
            senha_hash = row[0]
            if not (
                admin_senha == senha_hash
                or bcrypt.checkpw(admin_senha.encode(), senha_hash.encode())
            ):
                conn.close()
                self._set_headers(403)
                self.wfile.write(
                    json.dumps(
                        {"erro": "Apenas administradores podem ver usuários"}
                    ).encode()
                )
                return
            c.execute("SELECT id, nome, tipo FROM usuarios")
            usuarios = [
                dict(id=row[0], nome=row[1], tipo=row[2]) for row in c.fetchall()
            ]
            conn.close()
            self._set_headers()
            self.wfile.write(json.dumps(usuarios).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"erro": "Rota não encontrada"}).encode())

    def do_POST(self):
        if self.path == "/login":
            length = int(self.headers["Content-Length"])
            data = json.loads(self.rfile.read(length))
            nome = data.get("nome")
            senha = data.get("senha")
            if not nome or not senha:
                self._set_headers(400)
                self.wfile.write(
                    json.dumps({"erro": "Nome e senha são obrigatórios."}).encode()
                )
                return
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT senha, tipo FROM usuarios WHERE nome=?", (nome,))
            row = c.fetchone()
            conn.close()
            if row and (
                senha == row[0] or bcrypt.checkpw(senha.encode(), row[0].encode())
            ):
                self._set_headers()
                self.wfile.write(json.dumps({"status": "ok", "tipo": row[1]}).encode())
            else:
                self._set_headers(401)
                self.wfile.write(
                    json.dumps({"erro": "Usuário ou senha inválidos"}).encode()
                )
        elif self.path == "/recursos":
            length = int(self.headers["Content-Length"])
            data = json.loads(self.rfile.read(length))
            nome = data.get("nome")
            categoria = data.get("categoria")
            area_acesso = data.get("areaAcesso")
            descricao = data.get("descricao")
            if not nome or not categoria or not area_acesso:
                self._set_headers(400)
                self.wfile.write(
                    json.dumps(
                        {"erro": "Todos os campos obrigatórios devem ser preenchidos."}
                    ).encode()
                )
                return
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute(
                "INSERT INTO recursos (nome, categoria, area_acesso, descricao) VALUES (?, ?, ?, ?)",
                (nome, categoria, area_acesso, descricao),
            )
            conn.commit()
            conn.close()
            self._set_headers(201)
            self.wfile.write(json.dumps({"status": "recurso adicionado"}).encode())
        elif self.path == "/usuarios":
            length = int(self.headers["Content-Length"])
            data = json.loads(self.rfile.read(length))
            nome = data.get("nome")
            senha = data.get("senha")
            tipo = data.get("tipo")
            if not nome or not senha or not tipo:
                self._set_headers(400)
                self.wfile.write(
                    json.dumps({"erro": "Todos os campos são obrigatórios."}).encode()
                )
                return
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM usuarios WHERE nome=?", (nome,))
            if c.fetchone()[0] > 0:
                conn.close()
                self._set_headers(400)
                self.wfile.write(json.dumps({"erro": "Usuário já existe"}).encode())
                return
            admin_nome = self.headers.get("X-Admin-Nome")
            admin_senha = self.headers.get("X-Admin-Senha")
            c.execute("SELECT senha, tipo FROM usuarios WHERE nome=?", (admin_nome,))
            admin_row = c.fetchone()
            if (
                not admin_row
                or not bcrypt.checkpw(admin_senha.encode(), admin_row[0].encode())
                or admin_row[1] != "admin"
            ):
                conn.close()
                self._set_headers(403)
                self.wfile.write(
                    json.dumps(
                        {"erro": "Apenas administradores podem cadastrar usuários"}
                    ).encode()
                )
                return
            senha_hash = bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()
            c.execute(
                "INSERT INTO usuarios (nome, senha, tipo) VALUES (?, ?, ?)",
                (nome, senha_hash, tipo),
            )
            conn.commit()
            conn.close()
            self._set_headers(201)
            self.wfile.write(json.dumps({"status": "Usuário cadastrado"}).encode())
        elif self.path.startswith("/area_"):
            length = int(self.headers.get("Content-Length", 0))
            if length > 0:
                data = json.loads(self.rfile.read(length))
                nome = data.get("nome")
                senha = data.get("senha")
            else:
                nome = senha = None
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute(
                "SELECT tipo FROM usuarios WHERE nome=? AND senha=?", (nome, senha)
            )
            user = c.fetchone()
            tipo = user[0] if user else None
            area = self.path.replace("/area_", "")
            permitido = False
            if area == "geral":
                permitido = tipo in ["funcionario", "gerente", "admin"]
            elif area == "gerencial":
                permitido = tipo in ["gerente", "admin"]
            elif area == "seguranca":
                permitido = tipo == "admin"
            if permitido:
                self._set_headers()
                self.wfile.write(
                    json.dumps(
                        {"acesso": "concedido", "area": area, "tipo": tipo}
                    ).encode()
                )
            else:
                self._set_headers(403)
                self.wfile.write(json.dumps({"erro": "Acesso negado"}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"erro": "Rota não encontrada"}).encode())

    def _parse_auth(self):
        length = int(self.headers.get("Content-Length", 0))
        if length > 0:
            data = json.loads(self.rfile.read(length))
            nome = data.get("nome")
            senha = data.get("senha")
        else:
            nome = senha = None
        return nome, senha

    def _check_user(self, nome, senha):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT tipo FROM usuarios WHERE nome=? AND senha=?", (nome, senha))
        user = c.fetchone()
        conn.close()
        return user[0] if user else None

    # Definição duplicada de do_POST removida. Apenas a versão completa (acima) permanece.

    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"
        )
        self.send_header(
            "Access-Control-Allow-Headers", "Content-Type, X-Admin-Nome, X-Admin-Senha"
        )
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()
        self.wfile.write(b"")

    # As definições duplicadas de do_GET e do_POST foram removidas. Apenas a versão completa, que inclui /usuarios, foi mantida acima.


if __name__ == "__main__":
    init_db()
    server = HTTPServer(("localhost", 8000), SimpleHandler)
    print("Servidor rodando em http://localhost:8000")
    server.serve_forever()
