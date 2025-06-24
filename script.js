const estadoSelect = document.getElementById("estado");
const cidadeSelect = document.getElementById("cidade");
const paragrafoInformativo = document.getElementById("paragrafo-informativo");
const tabela = document.querySelector("#tabela-previsao tbody");
const periodo = document.getElementById("periodo");
const API_KEY = "d23c3d74c508423eb0605602252306";

periodo.innerText = "Período de coleta: " + new Date().toLocaleDateString("pt-BR");

async function salvarPDF(elemento, filename){
    const options = {
        margin: [10, 10, 10, 10],
        filename: filename + ".pdf",
        image: { type: 'png', quality: 1 },
        html2canvas: { scale: 2 }, 
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait', 
        }
    };
    html2pdf().set(options).from(elemento).save();
}

async function carregarEstados() {
  const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
  const estados = await res.json();
  estados.forEach(estado => {
    const option = document.createElement("option");
    option.value = estado.id;
    option.textContent = estado.nome;
    estadoSelect.appendChild(option);
  });
}

estadoSelect.addEventListener("change", async () => {
  cidadeSelect.innerHTML = "";
  const estadoId = estadoSelect.value;
  const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`);
  const cidades = await res.json();
  cidades.forEach(cidade => {
    const option = document.createElement("option");
    option.value = cidade.nome;
    option.textContent = cidade.nome;
    cidadeSelect.appendChild(option);
  });
});

cidadeSelect.addEventListener("change", async () => {
  const cidade = cidadeSelect.value;
  const dataAtual = new Date();
  const horaFormatada = dataAtual.toLocaleTimeString("pt-BR");
  paragrafoInformativo.innerText = `Dados obtidos em ${cidade}, às ${horaFormatada}, no dia ${dataAtual.toLocaleDateString("pt-BR")}`;

  const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cidade}&lang=pt&days=1`);
  const data = await response.json();

  tabela.innerHTML = "";

  data.forecast.forecastday[0].hour.forEach(hora => {
    // Determina qual porcentagem exibir
    let chanceFinal;

    if (hora.chance_of_rain !== undefined && hora.chance_of_rain !== null) {
      chanceFinal = `${hora.chance_of_rain}%`;
    } else {
      // Cálculo manual com base na precipitação
      if (hora.precip_mm >= 5) chanceFinal = "80%";
      else if (hora.precip_mm >= 2) chanceFinal = "60%";
      else if (hora.precip_mm >= 0.5) chanceFinal = "30%";
      else if (hora.precip_mm > 0) chanceFinal = "10%";
      else chanceFinal = "0%";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${hora.time.split(" ")[1]}</td>
      <td>${hora.condition.text}</td>
      <td>${chanceFinal}</td>
      <td>${hora.temp_c}</td>
      <td>${hora.feelslike_c}</td>
      <td>${hora.humidity}</td>
      <td>${hora.wind_kph}</td>
    `;
    tabela.appendChild(row);
  });
});

carregarEstados();

