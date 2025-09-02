// Permite acesso a todos os tipos
window.onload = function () {
  const tipo = localStorage.getItem("tipo");
  const nome = localStorage.getItem("nome") || "Usuário";
  document.getElementById(
    "userInfo"
  ).innerHTML = `<span style='color:#ffe600;font-weight:bold;'>${nome}</span> <span style='color:#7ecbff;'>(${tipo})</span>`;
  if (!["funcionario", "gerente", "admin"].includes(tipo)) {
    document.getElementById("acessoMsg").innerHTML =
      '<span style="color:#e53935;font-weight:bold;">Acesso negado!</span>';
  } else {
    document.getElementById("acessoMsg").innerHTML =
      '<span style="color:#7ecbff;">Acesso concedido à Área Geral.</span>';
  }
};
