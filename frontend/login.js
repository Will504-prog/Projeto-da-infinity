document.getElementById("loginForm").onsubmit = async function (e) {
  e.preventDefault();
  document.getElementById("msg").innerHTML =
    '<span style="color:#ffe600;">Aguarde...</span>';
  const nome = document.getElementById("nome").value;
  const senha = document.getElementById("senha").value;
  let res, data;
  try {
    res = await Promise.race([
      fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha }),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 7000)
      ),
    ]);
    data = await res.json();
  } catch (err) {
    document.getElementById("msg").innerHTML =
      '<span style="color:#e53935;">' +
      (err.message === "timeout"
        ? "Servidor não respondeu. Tente novamente."
        : "Erro de rede ou backend.") +
      "</span>";
    return;
  }
  if (res.ok) {
    localStorage.setItem("tipo", data.tipo);
    localStorage.setItem("nome", nome);
    localStorage.setItem("senha", senha);
    window.location = "dashboard.html";
  } else {
    document.getElementById("msg").innerHTML =
      '<span style="color:#e53935;">' +
      (data.erro || "Erro ao fazer login.") +
      "</span>";
  }
};
