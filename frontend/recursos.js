const adminNome = localStorage.getItem("nome");
const adminSenha = localStorage.getItem("senha");
const tipo = localStorage.getItem("tipo");

document.getElementById("recursoForm").onsubmit = async function (e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const categoria = document.getElementById("categoria").value;
  const descricao = document.getElementById("descricao").value;
  const res = await fetch("http://localhost:8000/recursos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, categoria, descricao }),
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById("msg").innerText = "Recurso adicionado!";
    document.getElementById("recursoForm").reset();
    carregarRecursos();
  } else {
    document.getElementById("msg").innerText =
      data.erro || "Erro ao adicionar.";
  }
};

async function carregarRecursos() {
  const res = await fetch("http://localhost:8000/recursos");
  const recursos = await res.json();
  const porCategoria = {};
  for (const r of recursos) {
    if (!porCategoria[r.categoria]) porCategoria[r.categoria] = [];
    porCategoria[r.categoria].push(r);
  }
  let html = "";
  for (const cat in porCategoria) {
    html += `<h4>${cat}</h4><ul class='wayne-list'>`;
    for (const r of porCategoria[cat]) {
      html += `<li><b>${r.nome}</b> <span style='color:#7ecbff;'>[${
        r.categoria
      }]</span> <span style='font-size:0.98em;color:#e0e6f0;'>${
        r.descricao ? "— " + r.descricao : ""
      }</span>`;
      if (tipo === "admin") {
        html += ` <button onclick="editarRecurso(${r.id}, '${r.nome.replace(
          /'/g,
          "&#39;"
        )}', '${r.categoria.replace(/'/g, "&#39;")}', '${(
          r.descricao || ""
        ).replace(
          /'/g,
          "&#39;"
        )}' )" class='wayne-btn' style='font-size:0.9em;padding:4px 10px;margin-left:8px;'>Editar</button>`;
        html += ` <button onclick="deletarRecurso(${r.id})" class='wayne-btn' style='background:#e53935;color:#fff;font-size:0.9em;padding:4px 10px;margin-left:4px;'>Deletar</button>`;
      }
      html += `</li>`;
    }
    html += `</ul>`;
  }
  document.getElementById("recursosPorCategoria").innerHTML = html;
}

carregarRecursos();

window.deletarRecurso = async function (id) {
  if (!confirm("Tem certeza que deseja deletar este recurso?")) return;
  try {
    const res = await fetch(`http://localhost:8000/recursos/${id}`, {
      method: "DELETE",
      headers: {
        "X-Admin-Nome": adminNome,
        "X-Admin-Senha": adminSenha,
      },
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {}
    if (res.ok) {
      carregarRecursos();
      document.getElementById("msg").innerText = "Recurso deletado.";
    } else {
      alert("Erro ao deletar: " + (data.erro || res.status));
      document.getElementById("msg").innerText =
        data.erro || "Erro ao deletar.";
    }
  } catch (err) {
    alert("Erro de rede ao deletar recurso.");
    console.error(err);
  }
};

window.editarRecurso = function (id, nome, categoria, descricao) {
  document.getElementById("editarBox").style.display = "block";
  document.getElementById("editarBox").innerHTML = `
    <form id='formEditarRecurso'>
      <input type='text' id='editNome' value='${nome}' required><br>
      <select id='editCategoria' required>
        <option value='Equipamento' ${
          categoria === "Equipamento" ? "selected" : ""
        }>Equipamento</option>
        <option value='Veículo' ${
          categoria === "Veículo" ? "selected" : ""
        }>Veículo</option>
        <option value='Dispositivo de Segurança' ${
          categoria === "Dispositivo de Segurança" ? "selected" : ""
        }>Dispositivo de Segurança</option>
      </select><br>
      <select id='editAreaAcesso' required>
        <option value='geral'>Área Geral</option>
        <option value='gerencial'>Área Gerencial</option>
        <option value='seguranca'>Área de Segurança</option>
      </select><br>
      <input type='text' id='editDescricao' value='${descricao || ""}'><br>
      <button type='submit'>Salvar</button>
      <button type='button' onclick='document.getElementById("editarBox").style.display="none"'>Cancelar</button>
    </form>
  `;
  document.getElementById("formEditarRecurso").onsubmit = async function (e) {
    e.preventDefault();
    const novoNome = document.getElementById("editNome").value;
    const novaCategoria = document.getElementById("editCategoria").value;
    const novaAreaAcesso = document.getElementById("editAreaAcesso").value;
    const novaDescricao = document.getElementById("editDescricao").value;
    try {
      const res = await fetch(`http://localhost:8000/recursos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Nome": adminNome,
          "X-Admin-Senha": adminSenha,
        },
        body: JSON.stringify({
          nome: novoNome,
          categoria: novaCategoria,
          areaAcesso: novaAreaAcesso,
          descricao: novaDescricao,
        }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch (e) {}
      if (res.ok) {
        document.getElementById("msg").innerText = "Recurso atualizado!";
        document.getElementById("editarBox").style.display = "none";
        carregarRecursos();
      } else {
        alert("Erro ao editar: " + (data.erro || res.status));
        document.getElementById("msg").innerText =
          data.erro || "Erro ao editar.";
      }
    } catch (err) {
      alert("Erro de rede ao editar recurso.");
      console.error(err);
    }
  };
};
