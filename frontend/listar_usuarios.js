window.onload = async function () {
  const adminNome = localStorage.getItem("nome");
  const adminSenha = localStorage.getItem("senha");
  const tipo = localStorage.getItem("tipo");
  if (tipo !== "admin") {
    alert("Acesso restrito!");
    window.location = "dashboard.html";
    return;
  }
  const res = await fetch("http://localhost:8000/usuarios", {
    headers: {
      "X-Admin-Nome": adminNome,
      "X-Admin-Senha": adminSenha,
    },
  });
  let data = [];
  try {
    data = await res.json();
  } catch (e) {
    document.getElementById(
      "usuariosList"
    ).innerHTML += `<li style='color:#e53935;'>Erro ao buscar usuários</li>`;
    return;
  }
  if (Array.isArray(data)) {
    let html = "";
    for (const u of data) {
      html += `<li><b>${u.nome}</b> <span style='color:#7ecbff;'>[${u.tipo}]</span></li>`;
    }
    document.getElementById("usuariosList").innerHTML += html;
  } else {
    document.getElementById(
      "usuariosList"
    ).innerHTML += `<li style='color:#e53935;'>${
      data.erro || "Erro ao buscar usuários"
    }</li>`;
  }
};
