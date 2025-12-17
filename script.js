const campoNomeTarefa = document.getElementById('nomeTarefa');
const campoHoraTarefa = document.getElementById('horaTarefa');
const btnAdicionar = document.getElementById('btnAdicionarTarefa');
const elementoLista = document.getElementById('listaDeTarefas');
const audioAlarme = document.getElementById('somAlarme');

let listaDeTarefas = [];
let idTarefaTocandoNoMomento = null;

function carregarTarefas() {
    const salvas = localStorage.getItem('minhasTarefasHoje');
    if (salvas) {
        listaDeTarefas = JSON.parse(salvas);
        desenharLista();
    }
}

function salvarTarefas() {
    localStorage.setItem('minhasTarefasHoje', JSON.stringify(listaDeTarefas));
}

function desenharLista() {
    elementoLista.innerHTML = '';
    listaDeTarefas.forEach((tarefa, indice) => {
        const item = document.createElement('li');
        if (tarefa.id === idTarefaTocandoNoMomento) item.classList.add('alarme-tocando');

        const dataObj = new Date(tarefa.dataHora);
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <div class="detalhes-tarefa">
                <strong>${tarefa.nome}</strong>
                <small>Hoje às ${horaFormatada}</small>
            </div>
            <button class="btn-remover" onclick="removerTarefa(${indice})">Remover</button>
        `;
        elementoLista.appendChild(item);
    });
}

function adicionarTarefa() {
    const nome = campoNomeTarefa.value.trim();
    const hora = campoHoraTarefa.value;

    if (!nome || !hora) {
        alert('Preencha o nome e a hora!');
        return;
    }

    const hoje = new Date().toISOString().split('T')[0];
    const dataHoraTarefa = new Date(`${hoje}T${hora}`);

    if (dataHoraTarefa < new Date()) {
        alert('Esta hora já passou! Escolha um horário futuro para hoje.');
        return;
    }

    const novaTarefa = {
        id: Date.now(),
        nome: nome,
        dataHora: dataHoraTarefa.toISOString(),
        jaTocou: false
    };

    listaDeTarefas.push(novaTarefa);
    salvarTarefas();
    desenharLista();
    
    campoNomeTarefa.value = '';
    campoHoraTarefa.value = '';
    
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

function removerTarefa(indice) {
    if (listaDeTarefas[indice].id === idTarefaTocandoNoMomento) pararAlarme();
    listaDeTarefas.splice(indice, 1);
    salvarTarefas();
    desenharLista();
}

function verificarAlarme() {
    const agora = new Date();
    listaDeTarefas.forEach(tarefa => {
        const horario = new Date(tarefa.dataHora);
        if (!tarefa.jaTocou && agora >= horario) {
            dispararAlarme(tarefa);
        }
    });
}

function dispararAlarme(tarefa) {
    tarefa.jaTocou = true;
    salvarTarefas();
    idTarefaTocandoNoMomento = tarefa.id;

    if (audioAlarme) {
        audioAlarme.play().catch(() => console.log("Som aguardando interação."));
    }

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("⏰ Alarme!", { body: tarefa.nome });
    }
    desenharLista();
}

function pararAlarme() {
    if (audioAlarme) {
        audioAlarme.pause();
        audioAlarme.currentTime = 0;
    }
    idTarefaTocandoNoMomento = null;
    desenharLista();
}

btnAdicionar.addEventListener('click', adicionarTarefa);
document.addEventListener('DOMContentLoaded', () => {
    carregarTarefas();
    setInterval(verificarAlarme, 1000);
});