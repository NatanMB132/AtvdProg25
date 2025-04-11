// Importa o módulo 'express' para criar o servidor HTTP
const express = require('express');
// Inicializa o aplicativo Express
const app = express();

// Importa o módulo 'cors' para permitir requisições de diferentes origens (Cross-Origin Resource Sharing)
const cors = require('cors');

// Ativa o uso de CORS em todas as rotas
app.use(cors());

// Define a pasta 'public' como diretório de arquivos estáticos (para servir HTML, CSS, JS etc.)
app.use(express.static('public'));

// Função que recebe uma string de data e um fuso horário opcional e retorna um objeto com data válida ou erro
function getDateResponse(dateString, timezone) {
  // Tenta criar uma instância de Date com base no parâmetro (timestamp ou string)
  let date = isNaN(dateString) ? new Date(dateString) : new Date(parseInt(dateString));

  // Se o fuso horário for fornecido
  if (timezone) {
    try {
      // Tenta formatar a data usando o fuso horário especificado
      date = new Date(new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(date));
    } catch {
      // Retorna erro se o fuso for inválido
      return { error: "Invalid Timezone" };
    }
  }

  // Verifica se a data é inválida
  if (date.toString() === "Invalid Date") return { error: "Invalid Date" };

  // Retorna a data no formato Unix e UTC
  return {
    unix: date.getTime(),
    utc: date.toUTCString()
  };
}

// Endpoint principal: responde a GET /api/:date? (parâmetro opcional)
app.get('/api/:date?', (req, res) => {
  const dateString = req.params.date;           // Captura o parâmetro de data da URL
  const timezone = req.query.timezone;          // Captura o fuso horário da query string (?timezone=... )

  // Se nenhuma data for enviada, retorna a data e hora atuais
  if (!dateString) {
    const now = new Date();
    return res.json({ unix: now.getTime(), utc: now.toUTCString() });
  }

  // Retorna a data convertida (ou erro) usando a função definida
  res.json(getDateResponse(dateString, timezone));
});

// Endpoint para calcular a diferença entre duas datas
app.get('/api/diff/:date1/:date2', (req, res) => {
  const { date1, date2 } = req.params;        // Captura as duas datas da URL
  const d1 = new Date(date1);                 // Converte a primeira data
  const d2 = new Date(date2);                 // Converte a segunda data

  // Verifica se alguma das datas é inválida
  if (d1.toString() === "Invalid Date" || d2.toString() === "Invalid Date") {
    return res.json({ error: "Invalid Date" });
  }

  // Calcula a diferença em milissegundos entre as datas
  const diffMs = Math.abs(d2 - d1);
  const seconds = Math.floor(diffMs / 1000);             // Segundos totais
  const minutes = Math.floor(seconds / 60);              // Minutos totais
  const hours = Math.floor(minutes / 60);                // Horas totais
  const days = Math.floor(hours / 24);                   // Dias totais

  // Retorna a diferença entre as datas formatada
  res.json({
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60
  });
});

// Define a porta que o servidor irá escutar (padrão 3000 ou ambiente)
const PORT = process.env.PORT || 3000;

// Inicia o servidor e exibe uma mensagem no console
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
