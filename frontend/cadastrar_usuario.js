window.onload = function () {
  // Só admin pode acessar
  const tipo = localStorage.getItem("tipo");
  if (tipo !== "admin") {
    alert("Acesso restrito! Apenas administradores podem cadastrar usuários.");
    window.location = "dashboard.html";
    return;
  }
  document.getElementById("formCadastro").onsubmit = async function (e) {
    e.preventDefault();
    const nome = document.getElementById("novoNome").value;
    const senha = document.getElementById("novaSenha").value;
    const tipo = document.getElementById("novoTipo").value;
    if (!nome || !senha || !tipo) {
      document.getElementById("msgCadastro").innerHTML =
        '<span style="color:#e53935;">Preencha todos os campos.</span>';
      return;
    }
    document.getElementById("msgCadastro").innerHTML =
      '<span style="color:#ffe600;">Aguarde...</span>';
    // Pega credenciais do admin logado
    const adminNome = localStorage.getItem("nome");
    const adminSenha = localStorage.getItem("senha");
    const res = await fetch("http://localhost:8000/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Nome": adminNome,
        "X-Admin-Senha": adminSenha,
      },
      body: JSON.stringify({ nome, senha, tipo }),
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("msgCadastro").innerHTML =
        '<span style="color:#00e676;">Usuário cadastrado com sucesso!</span>';
      document.getElementById("formCadastro").reset();
    } else {
      document.getElementById("msgCadastro").innerHTML =
        '<span style="color:#e53935;">' +
        (data.erro || "Erro ao cadastrar usuário.") +
        "</span>";
    }
  };
};
