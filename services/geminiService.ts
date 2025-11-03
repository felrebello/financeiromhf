import { GoogleGenAI, Type } from "@google/genai";
import { AnalyzedExpense, ParsedTransaction, TransactionType, User } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeReceipt = async (file: File, existingCategories: string[]): Promise<AnalyzedExpense | null> => {
  if (!process.env.API_KEY) {
    throw new Error("A chave da API do Gemini não foi configurada. Verifique as variáveis de ambiente.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(file);

  const prompt = `
    Analise a imagem deste recibo ou nota fiscal de uma despesa. Extraia as seguintes informações e retorne-as ESTRITAMENTE no formato JSON:
    1.  "amount": O valor total da despesa como um número (ex: 123.45). Se não encontrar, retorne 0.
    2.  "category": Uma categoria sugerida para a despesa. Use uma das categorias existentes se apropriado, ou sugira uma nova. Lista de categorias existentes: [${existingCategories.map(c => `"${c}"`).join(', ')}]. Se não se encaixar, use "Outros".
    3.  "description": Uma descrição curta, como o nome do estabelecimento. Se não encontrar, use "Despesa de Recibo".
    4.  "tags": Um array de strings com 3 a 5 tags relevantes (ex: ["supermercado", "compras", "comida"]). Se não encontrar, retorne um array vazio.

    O seu retorno DEVE ser apenas o objeto JSON, sem nenhuma formatação adicional, texto explicativo ou markdown.

    Exemplo de retorno VÁLIDO:
    {
      "amount": 75.50,
      "category": "Alimentação",
      "description": "Supermercado Pão de Açúcar",
      "tags": ["supermercado", "compras", "mercearia"]
    }
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Image model is not needed for this prompt according to the new guidelines
      contents: { parts: [imagePart, { text: prompt }] },
    });

    let textResponse = response.text.trim();
    
    // Clean up potential markdown code blocks
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.substring(7, textResponse.length - 3).trim();
    } else if (textResponse.startsWith('```')) {
       textResponse = textResponse.substring(3, textResponse.length - 3).trim();
    }
    
    const parsedJson: AnalyzedExpense = JSON.parse(textResponse);

    if (typeof parsedJson.amount !== 'number' || typeof parsedJson.category !== 'string' || typeof parsedJson.description !== 'string' || !Array.isArray(parsedJson.tags)) {
        throw new Error("O formato do JSON retornado pela IA é inválido.");
    }

    return parsedJson;

  } catch (error) {
    console.error("Erro ao chamar a API Gemini ou ao processar a resposta: ", error);
    if (error instanceof SyntaxError) {
        throw new Error("A IA retornou uma resposta em um formato JSON inválido. Tente novamente.");
    }
    throw new Error("Falha ao analisar a nota fiscal. Verifique sua conexão e a imagem.");
  }
};


export const analyzeStatement = async (file: File, existingCategories: string[], currentUser: User): Promise<Omit<ParsedTransaction, 'tempId' | 'user'>[]> => {
    if (!process.env.API_KEY) {
        throw new Error("A chave da API do Gemini não foi configurada.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(file);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: "Analise a imagem da fatura e extraia todas as transações de despesa." }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            amount: {
                                type: Type.NUMBER,
                                description: 'O valor da despesa.',
                            },
                            category: {
                                type: Type.STRING,
                                description: `Sugira uma categoria. Categorias existentes: ${existingCategories.join(', ')}.`,
                            },
                            description: {
                                type: Type.STRING,
                                description: 'A descrição do item ou nome do estabelecimento.',
                            },
                            date: {
                                type: Type.STRING,
                                description: 'A data da transação no formato YYYY-MM-DD. Se o ano não for claro, use o ano atual.',
                            },
                        },
                        required: ["amount", "description", "date", "category"],
                    },
                },
            },
        });
        
        let jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);

        if (!Array.isArray(parsedData)) {
            throw new Error("A IA não retornou um array de transações.");
        }

        return parsedData.map((item: any) => ({
            amount: item.amount || 0,
            category: item.category || 'Outros',
            description: item.description || 'Lançamento da fatura',
            date: item.date || new Date().toISOString().split('T')[0],
            tags: [],
            type: TransactionType.EXPENSE
        }));

    } catch (error) {
        console.error("Erro ao analisar a fatura: ", error);
        throw new Error("Não foi possível processar a fatura. A IA pode ter retornado um formato inesperado. Tente uma imagem mais nítida.");
    }
};
