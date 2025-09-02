// Exibe botões de admin dinamicamente
window.addEventListener("DOMContentLoaded", () => {
  const tipo = localStorage.getItem("tipo");
  if (tipo === "admin") {
    const btnCadastrar = document.createElement("button");
    btnCadastrar.className = "wayne-btn";
    btnCadastrar.innerText = "Cadastrar Usuário";
    btnCadastrar.onclick = () => (window.location = "cadastrar_usuario.html");
    document.getElementById("botoesDashboard").prepend(btnCadastrar);

    const btnListar = document.createElement("button");
    btnListar.className = "wayne-btn";
    btnListar.innerText = "Listar Usuários";
    btnListar.onclick = () => (window.location = "listar_usuarios.html");
    document.getElementById("botoesDashboard").prepend(btnListar);
  }
});
window.onload = async function () {
  const tipo = localStorage.getItem("tipo");
  const nome = localStorage.getItem("nome") || "Usuário";
  if (!tipo) {
    window.location = "index.html";
    return;
  }
  document.getElementById(
    "userInfo"
  ).innerHTML = `<span style=\"color:#ffe600;font-weight:bold;\">${nome}</span> <span style=\"color:#7ecbff;\">(${tipo})</span>`;

  // Áreas restritas por tipo
  const areas = [
    {
      nome: "Área Geral",
      tipos: ["funcionario", "gerente", "admin"],
      cor: "#7ecbff",
    },
    { nome: "Área Gerencial", tipos: ["gerente", "admin"], cor: "#ffe600" },
    { nome: "Área de Segurança", tipos: ["admin"], cor: "#ff3c00" },
  ];
  let areaHtml = "";
  const areaPages = {
    "Área Geral": "area_geral.html",
    "Área Gerencial": "area_gerencial.html",
    "Área de Segurança": "area_seguranca.html",
  };
  for (const area of areas) {
    if (area.tipos.includes(tipo)) {
      areaHtml += `<button class='wayne-btn' style='background:linear-gradient(90deg, #232526 60%, ${
        area.cor
      } 100%);color:#fff;' onclick=\"window.location='${
        areaPages[area.nome]
      }'\">${area.nome}</button>`;
    } else {
      areaHtml += `<button class='wayne-btn' style='background:#222;color:#888;cursor:not-allowed;' disabled>${area.nome} (Acesso negado)</button>`;
    }
  }
  document.getElementById("areasRestritas").innerHTML = areaHtml;

  // Carregar recursos
  const res = await fetch("http://localhost:8000/recursos");
  const recursos = await res.json();
  let html = "";
  if (recursos.length === 0) {
    html = '<li style="color:#7ecbff;">Nenhum recurso cadastrado ainda.</li>';
  } else {
    for (const r of recursos) {
      html += `<li><b>${r.nome}</b><span style='color:#7ecbff;'> [${
        r.categoria
      }]</span><span style='font-size:0.98em;color:#e0e6f0;'> ${
        r.descricao ? "— " + r.descricao : ""
      }</span></li>`;
    }
  }
  document.getElementById("recursos").innerHTML = html;
};
