const API_URL = "http://localhost:3000/jogos";

let listaGlobalJogos = [];

const inputPesquisa = document.getElementById("input-pesquisa");
const filtroStatus = document.getElementById("filtro-status");
const listaJogosElement = document.getElementById("lista-jogos");
const gameForm = document.getElementById("game-form");
const gameIdInput = document.getElementById("game-id");
const tituloInput = document.getElementById("titulo");
const generoInput = document.getElementById("genero");
const plataformaInput = document.getElementById("plataforma");
const notaInput = document.getElementById("nota");
const statusInput = document.getElementById("status");
const btnCancelar = document.getElementById("btn-cancelar");
const mensagemErro = document.getElementById("mensagem-erro");
const erroConexao = document.getElementById("erro-conexao");
const formTitulo = document.getElementById("form-titulo");

const totalJogosEl = document.getElementById("total-jogos");
const totalJogandoEl = document.getElementById("total-jogando");
const totalFinalizadosEl = document.getElementById("total-finalizados");

function carregarJogos() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error("Erro na rede");
            return response.json();
        })
        .then(dados => {
            listaGlobalJogos = dados;
            erroConexao.style.display = "none";
            aplicarFiltrosEEexibir();
        })
        .catch(erro => {
            console.error("Erro:", erro);
            erroConexao.style.display = "block";
            listaGlobalJogos = [];
            aplicarFiltrosEEexibir();
        });
}

function renderizarJogos(jogos) {
    listaJogosElement.innerHTML = "";

    if (jogos.length === 0) {
        listaJogosElement.innerHTML = "<p>Nenhum jogo encontrado.</p>";
        atualizarDashboard([]);
        return;
    }

    jogos.forEach(jogo => {
        const card = document.createElement("div");
        card.classList.add("jogo");
        card.innerHTML = `
            <h3>${jogo.titulo}</h3>
            <p><strong>Gênero:</strong> ${jogo.genero}</p>
            <p><strong>Plataforma:</strong> ${jogo.plataforma}</p>
            <p><strong>Nota:</strong> ${jogo.nota}</p>
            <p><strong>Status:</strong> ${jogo.status}</p>
            <div class="card-acoes" style="margin-top: 15px; display: flex; gap: 8px;">
                <button class="btn-editar" onclick="prepararEdicao('${jogo.id}')" style="flex:1;">EDITAR</button>
                <button class="btn-excluir" onclick="excluirJogo('${jogo.id}')" style="flex:1;">EXCLUIR</button>
            </div>
        `;
        listaJogosElement.appendChild(card);
    });

    atualizarDashboard(jogos);
}

function atualizarDashboard(jogosAtuais) {
    totalJogosEl.textContent = listaGlobalJogos.length;
    const jogando = listaGlobalJogos.filter(j => j.status === "Jogando").length;
    const finalizados = listaGlobalJogos.filter(j => j.status === "Finalizado").length;
    
    totalJogandoEl.textContent = jogando;
    totalFinalizadosEl.textContent = finalizados;
}

gameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    mensagemErro.textContent = "";

    const notaVal = parseFloat(notaInput.value);
    if (notaVal < 0 || notaVal > 10) {
        mensagemErro.textContent = "A nota precisa estar entre 0 e 10.";
        return;
    }

    const jogoData = {
        titulo: tituloInput.value.trim(),
        genero: generoInput.value.trim(),
        plataforma: plataformaInput.value.trim(),
        nota: notaVal,
        status: statusInput.value
    };

    const id = gameIdInput.value;

    if (id) {
        fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jogoData)
        })
        .then(res => res.json())
        .then(() => {
            limparFormulario();
            carregarJogos();
        })
        .catch(erro => alert("Erro ao atualizar o jogo."));
    } else {
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jogoData)
        })
        .then(res => res.json())
        .then(() => {
            limparFormulario();
            carregarJogos();
        })
        .catch(erro => alert("Erro ao cadastrar o jogo."));
    }
});

function excluirJogo(id) {
    if (confirm("Tens a certeza de que desejas excluir este jogo?")) {
        fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        })
        .then(() => {
            carregarJogos();
        })
        .catch(erro => alert("Erro ao excluir o jogo."));
    }
}

function prepararEdicao(id) {
    const jogo = listaGlobalJogos.find(j => j.id === id);
    if (jogo) {
        gameIdInput.value = jogo.id;
        tituloInput.value = jogo.titulo;
        generoInput.value = jogo.genero;
        plataformaInput.value = jogo.plataforma;
        notaInput.value = jogo.nota;
        statusInput.value = jogo.status;

        formTitulo.textContent = "Editar Jogo";
        btnCancelar.style.display = "inline-block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

btnCancelar.addEventListener("click", limparFormulario);

function limparFormulario() {
    gameIdInput.value = "";
    gameForm.reset();
    formTitulo.textContent = "Cadastrar Novo Jogo";
    btnCancelar.style.display = "none";
    mensagemErro.textContent = "";
}

function aplicarFiltrosEEexibir() {
    const termoPesquisa = inputPesquisa.value.toLowerCase();
    const statusSelecionado = filtroStatus.value;

    const jogosFiltrados = listaGlobalJogos.filter(jogo => {
        const correspondeTitulo = jogo.titulo.toLowerCase().includes(termoPesquisa);
        const correspondeStatus = statusSelecionado === "Todos" || jogo.status === statusSelecionado;
        return correspondeTitulo && correspondeStatus;
    });

    renderizarJogos(jogosFiltrados);
}

inputPesquisa.addEventListener("input", aplicarFiltrosEEexibir);
filtroStatus.value = "Todos";
filtroStatus.addEventListener("change", aplicarFiltrosEEexibir);

carregarJogos();