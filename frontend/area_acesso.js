
async function validarAcesso(area) {
  const nome = localStorage.getItem("nome");
  const senha = prompt("Confirme sua senha para acessar a área:");
  if (!senha) return false;
  const res = await fetch(`http://localhost:8000/area_${area}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, senha }),
  });
  if (res.ok) {
    return true;
  } else {
    alert("Acesso negado pelo servidor!");
    return false;
  }
}
