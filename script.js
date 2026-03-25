const listaAnimais = [
    " 🦩 Avestruz", " 🦅 Águia", " 🫏 Burro", " 🦋 Borboleta", " 🐕 Cachorro",
    " 🐐 Cabra", " 🐑 Carneiro", " 🐪 Camelo", " 🐍 Cobra", " 🐇 Coelho",
    " 🐘 Elefante", " 🐓 Galo", " 🐈 Gato", " 🐊 Jacaré", " 🦁 Leão",
    " 🐒 Macaco", " 🐖 Porco", " 🦚 Pavão", " 🐅 Tigre", " 🐻 Urso",
    " 🦌 Veado", " 🐂 Touro", " 🦬 Búfalo", " 🦓 Zebra", " 🐄 Vaca"
];

// 1. TABELA DE MULTIPLICADORES (MELHORIA ADICIONADA)
const MULTIPLICADORES = {
    "milhar": 4000,
    "centena": 600,
    "dezena": 60,
    "grupo_simples": 18,
    "duque_grupo": 18.5,
    "terno_grupo": 130,
    "quadra_grupo": 1000,
    "quina_grupo": 5000,
    "duque_dezena": 300,
    "terno_dezena": 3000,
    "mc": 1000,
    "cercado_5": 800, // Milhar cercada do 1 ao 5 (4000 / 5)
    "cercado_7": 570,
    "passe_vai": 80,
    "passe_vem": 40,
    "inlay": 2000
};

let selecoesAtuais = [];
let apostaAtiva = null;

function ajustarInterface() {
    const tipo = document.getElementById("tipo").value;
    const campos = document.getElementById("campos_especificos");
    const subtitulo = document.getElementById("subtitulo_selecao");
    
    campos.innerHTML = "";
    selecoesAtuais = [];
    document.querySelectorAll(".animal").forEach(a => a.classList.remove("selecionado"));

    const modalidadesNumericas = ["dezena", "centena", "milhar", "duque_dezena", "terno_dezena", "mc", "cercado_5", "cercado_7", "inlay"];
    
    if (modalidadesNumericas.includes(tipo)) {
        let qtdCampos = (tipo === "duque_dezena") ? 2 : (tipo === "terno_dezena") ? 3 : 1;
        let htmlInputs = "";
        
        for(let i=0; i < qtdCampos; i++) {
            let placeholder = "Digite o número";
            if (tipo.includes("dezena")) placeholder = "Dezena (Ex: 15)";
            if (tipo.includes("centena")) placeholder = "Centena (Ex: 415)";
            if (tipo.includes("milhar") || tipo === "mc" || tipo.startsWith("cercado")) placeholder = "Milhar (Ex: 8415)";
            
            htmlInputs += `<input type="number" class="num_digitado" placeholder="${placeholder}" style="margin-bottom:5px;">`;
        }
        campos.innerHTML = htmlInputs;
        subtitulo.innerText = "Digite os números acima";
    } else {
        const limites = { "grupo_simples": 1, "duque_grupo": 2, "terno_grupo": 3, "quadra_grupo": 4, "quina_grupo": 5, "passe_vai": 2, "passe_vem": 2 };
        subtitulo.innerText = `Selecione ${limites[tipo] || 1} animal(is) no grid abaixo`;
    }
}

const container = document.getElementById("animais");
listaAnimais.forEach((nome, index) => {
    const div = document.createElement("div");
    div.className = "animal";
    div.innerHTML = `<small>${index + 1}</small><br>${nome}`;
    div.onclick = () => gerenciarSelecao(div, { nome, grupo: index + 1 });
    container.appendChild(div);
});

function gerenciarSelecao(elemento, animal) {
    const tipo = document.getElementById("tipo").value;
    if (document.querySelector(".num_digitado")) return;

    const max = { "grupo_simples": 1, "duque_grupo": 2, "terno_grupo": 3, "quadra_grupo": 4, "quina_grupo": 5, "passe_vai": 2, "passe_vem": 2 }[tipo] || 1;

    if (elemento.classList.contains("selecionado")) {
        elemento.classList.remove("selecionado");
        selecoesAtuais = selecoesAtuais.filter(a => a.grupo !== animal.grupo);
    } else if (selecoesAtuais.length < max) {
        elemento.classList.add("selecionado");
        selecoesAtuais.push(animal);
    }
}

function apostar() {
    const valor = document.getElementById("valor").value;
    const tipo = document.getElementById("tipo").value;
    const inputsNum = document.querySelectorAll(".num_digitado");
    let numerosApostados = Array.from(inputsNum).map(i => i.value).filter(v => v !== "");

    if (numerosApostados.length === 0 && selecoesAtuais.length === 0) {
        alert("Escolha os animais ou digite os números!");
        return;
    }

    apostaAtiva = {
        tipo: tipo,
        valor: parseFloat(valor),
        animais: [...selecoesAtuais],
        numeros: numerosApostados,
        multiplicador: MULTIPLICADORES[tipo] || 18
    };

    const info = numerosApostados.length > 0 ? numerosApostados.join(", ") : apostaAtiva.animais.map(a => a.nome).join(", ");
    const li = document.createElement("li");
    li.innerHTML = `✅ <strong>${tipo.toUpperCase()}:</strong> R$${apostaAtiva.valor.toFixed(2)} | [${info}]`;
    document.getElementById("historico").prepend(li);
    alert("Aposta confirmada!");
}

function sortear() {
    if (!apostaAtiva) return alert("Nenhuma aposta ativa!");

    let resultados = Array.from({length: 5}, () => Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.style.display = "block";
    
    let html = "<h3>Sorteio Oficial</h3>";
    let gruposSorteados = [];

    resultados.forEach((res, i) => {
        const dezena = res.slice(-2);
        const grupo = parseInt(dezena) === 0 ? 25 : Math.ceil(parseInt(dezena) / 4);
        gruposSorteados.push(grupo);
        html += `<p>${i+1}º Prêmio: <strong>${res}</strong> (${listaAnimais[grupo-1]})</p>`;
    });

    // 2. LÓGICA DE CONFERÊNCIA MELHORADA
    let ganhou = false;
    const tipo = apostaAtiva.tipo;

    if (tipo === "milhar") {
        if (apostaAtiva.numeros.includes(resultados[0])) ganhou = true;
    } else if (tipo === "centena") {
        if (apostaAtiva.numeros.some(n => resultados[0].endsWith(n))) ganhou = true;
    } else if (tipo === "dezena") {
        if (apostaAtiva.numeros.some(n => resultados[0].endsWith(n))) ganhou = true;
    } else if (tipo === "cercado_5") {
        if (apostaAtiva.numeros.some(n => resultados.includes(n))) ganhou = true;
    } else if (tipo === "grupo_simples") {
        if (apostaAtiva.animais.some(a => a.grupo === gruposSorteados[0])) ganhou = true;
    } else if (tipo === "duque_grupo") {
        const acertos = apostaAtiva.animais.filter(a => gruposSorteados.includes(a.grupo));
        if (acertos.length >= 2) ganhou = true;
    } else if (tipo === "terno_grupo") {
        const acertos = apostaAtiva.animais.filter(a => gruposSorteados.includes(a.grupo));
        if (acertos.length >= 3) ganhou = true;
    }

    if (ganhou) {
        const premioTotal = apostaAtiva.valor * apostaAtiva.multiplicador;
        html += `<span class="ganhou">💰 GANHOU R$ ${premioTotal.toFixed(2)}!</span>`;
    } else {
        html += `<span class="perdeu">❌ Tente novamente</span>`;
    }

    resultadoDiv.innerHTML = html;
}