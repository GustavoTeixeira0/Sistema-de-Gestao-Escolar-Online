const API_URL = "https://special-giggle-5g567p9g45vrc7pv7-3000.app.github.dev";
console.log("API_URL =", API_URL);

// CADASTRO
async function cadastrar() {
    console.log("Enviando para:", `${API_URL}/cadastrar`);
    const cpf = document.getElementById("cadCpf").value.trim();
    const senha = document.getElementById("cadSenha").value.trim();
    const escola = document.getElementById("cadEscola").value.trim();
    const tipo = document.getElementById("cadTipo").value;

    const msg = document.getElementById("msgCadastro");

    if (!cpf || !senha || !escola || !tipo) {
        msg.innerHTML = "Preencha todos os campos.";
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/cadastrar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cpf,
                senha,
                escola,
                tipo
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            msg.innerHTML = dados.mensagem;

            document.getElementById("cadCpf").value = "";
            document.getElementById("cadSenha").value = "";
            document.getElementById("cadEscola").value = "";
            document.getElementById("cadTipo").value = "";
        } else {
            msg.innerHTML = dados.erro;
        }

    } catch (erro) {
        console.error(erro);
        msg.innerHTML = "Não foi possível conectar ao servidor.";
    }
}

// LOGIN
async function fazerLogin() {
    const cpf = document.getElementById("loginCpf").value.trim();
    const senha = document.getElementById("loginSenha").value.trim();
    const escola = document.getElementById("loginEscola").value.trim();

    const msg = document.getElementById("msgLogin");

    if (!cpf || !senha || !escola) {
        msg.innerHTML = "Preencha todos os campos.";
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cpf,
                senha,
                escola
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            msg.innerHTML = dados.mensagem;

            console.log("Usuário logado:", dados.usuario);

            // Exemplo:
            // window.location.href = "dashboard.html";
        } else {
            msg.innerHTML = dados.erro;
        }

    } catch (erro) {
        console.error(erro);
        msg.innerHTML = "Não foi possível conectar ao servidor.";
    }
}