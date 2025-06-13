function obterImagem(event) {
  event.preventDefault();

  if (event.target.matches("img"))
    salvarImagem(event.target);
  else
  {
    // Instagram é chato assim mesmo
    if (event.target.parentNode.firstChild.firstChild.matches("img"))
      salvarImagem(event.target.parentNode.firstChild.firstChild);
    else
      console.log("Nenhuma imagem obtida!");
  }

  document.removeEventListener("click", obterImagem);
}

async function salvarImagem(target) {
  target.style.border = '1px solid red';
  setTimeout(() => {
    target.style.border = '';
  }, 1000);

  await browser.storage.local.set({ imagemFakeNews: target.src });
  // Para funcionar no chrome, precisaria usar o objeto "chrome" ao invés de "browser"

  mostrarResultado(await verificarImagem(target));
}

function mostrarResultado(objData) {
  console.log(objData);
  let args = objData.candidates[0].content.parts[0].functionCall.args;
  let prVeracidade = args.pr_veracidade;
  let dsMotivo = args.motivo;
  // let dsFontes = args.fonte.join("\n");
  // alert(`Veracidade: ${prVeracidade}%\nMotivo: ${dsMotivo}\nFonte(s):\n${dsFontes}`);
  alert(`Veracidade: ${prVeracidade}%\nMotivo: ${dsMotivo}\n`);
}

async function verificarImagem(imgElement) {
  var imageBase64 = baixarImagem(imgElement);

  // Essa parte deveria ser executada num servidor separado, já que ela
  // incluirá chamadas para a API do Gemini, que precisa de uma chave
  // privada
  // Por questões de exemplificação, irei deixar a chama aqui sem a chave
  // e com retornos de exemplo
  const API_KEY = '';

  //gemini-pro
  //gemini-1.5-flash
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  const aiTools = {
    function_declarations: [{
      name: "respostaFakeNews",
      description: "Resposta formatada para validação de fake news",
      parameters: {
        type: "object",
        properties: {
          motivo: {
            type: "string",
            description: "Descrição simples da imagem ser possivelmente fake."
          },
          pr_veracidade: {
            type: "number",
            description: "Percentual de veracidade da imagem, 0 à 100."
          },
          fonte: {
            type: "array",
            items: { type: "STRING" },
            description: "URLs para noticias que provem que a imagem é falsa (se existirem)"
          }
        },
        required: ["motivo", "pr_veracidade"]
      }
    }]
  };

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Validar se a imagem a seguir é uma Fake News. Retorne uma descrição breve caso " +
                "seja fake, um percentual de veracidade e as fontes que provam sua defnição. Seja " +
                "exigente, se um ponto da notícia for manipulador ou falso, não deve ser 100% " +
                "verdadeiro."
            },
            { 
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }],
        tools: aiTools,
        generationConfig: {
          maxOutputTokens: 4000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
  
    return data;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

function baixarImagem(imgElement) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
  }
  catch (error) {
    console.error('Erro!', error);
  }

  return false;
}

document.addEventListener("click", obterImagem);