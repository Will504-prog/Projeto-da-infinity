// Permite acesso só a admin
window.onload = function () {
  const tipo = localStorage.getItem("tipo");
  const nome = localStorage.getItem("nome") || "Usuário";
  document.getElementById(
    "userInfo"
  ).innerHTML = `<span style='color:#ffe600;font-weight:bold;'>${nome}</span> <span style='color:#7ecbff;'>(${tipo})</span>`;
  if (tipo !== "admin") {
    document.getElementById("acessoMsg").innerHTML =
      '<span style="color:#e53935;font-weight:bold;">Acesso negado!</span>';
  } else {
    document.getElementById("acessoMsg").innerHTML =
      '<span style="color:#ff3c00;">Acesso concedido à Área de Segurança.</span>';
  }
};
