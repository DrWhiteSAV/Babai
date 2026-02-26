import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSpookyVoice(text: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Произнеси жутким, пугающим голосом: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Charon" },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? `data:audio/mp3;base64,${base64Audio}` : "";
  } catch (e) {
    console.error("TTS Error:", e);
    return "";
  }
}

export async function generateCharacterName(
  gender: string,
  style: string,
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Сгенерируй уникальное, забавное имя для славянского кибернетического духа.
      Пол: ${gender}. Стиль: ${style}. 
      Имя должно состоять из одного или двух слов. Верни только имя, без лишних слов.`,
    });
    return response.text?.trim() || "Безымянный";
  } catch (e) {
    console.error(e);
    return "Бабай " + Math.floor(Math.random() * 1000);
  }
}

export async function generateAvatar(
  gender: string,
  style: string,
  wishes: string[],
): Promise<string> {
  try {
    const prompt = `A portrait of a Slavic cybernetic spirit named ${gender === "Бабай" ? "Babay (old man)" : "Babayka (old woman)"}. 
    They wear pajamas and have a spooky but funny appearance with a long tongue. 
    Style: ${style}. Additional wishes: ${wishes.join(", ")}. 
    High quality, detailed, atmospheric, slightly comical.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return "";
  } catch (e) {
    console.error(e);
    return ""; // Fallback image needed
  }
}

export async function generateScenario(
  stage: number,
  difficulty: string,
  style: string,
): Promise<{ text: string; options: string[]; correctAnswer: number }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ты - ведущий текстовой ролевой игры "Бабай". Игрок - славянский кибер-дух (старик/старуха в пижаме с длинным языком и телекинезом).
      Цель: выгнать жильцов из многоквартирного дома.
      Стиль игры: ${style}. Этап: ${stage}. Сложность: ${difficulty}.
      
      Опиши текущую ситуацию (коротко, 2-3 предложения), где Бабай пугает очередного жильца (или группу).
      Затем предложи 3 варианта действий для игрока. Только один вариант должен быть правильным (успешным) для выселения, остальные ведут к провалу или задержке.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Описание ситуации" },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 варианта действий" },
            correctAnswer: { type: Type.INTEGER, description: "Индекс правильного варианта (0, 1 или 2)" }
          },
          required: ["text", "options", "correctAnswer"]
        }
      },
    });

    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error(e);
    return {
      text: "Жилец заперся в ванной и поет песни. Что будешь делать?",
      options: [
        "Просунуть длинный язык под дверь",
        "Использовать телекинез на кран",
        "Громко завыть",
      ],
      correctAnswer: 1,
    };
  }
}

export async function generateDanilChat(
  message: string,
  style: string,
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ты - ДанИИл, дух-начальник (ИИ), который контролирует Бабаев. 
      Стиль общения: строгий, саркастичный, требует отчетов о выселении жильцов. Учитывай стиль мира: ${style}.
      Игрок пишет тебе: "${message}".
      Ответь коротко (1-2 предложения), оцени работу и дай добро на следующий этап, если игрок убедителен.`,
    });
    return response.text?.trim() || "Продолжай работать.";
  } catch (e) {
    console.error(e);
    return "Связь прервана. Иди пугай дальше.";
  }
}

export async function generateBackgroundImage(
  stage: number,
  style: string,
): Promise<string> {
  try {
    const prompt = `Background image for a text RPG. A mysterious apartment building interior, floor ${stage}. Style: ${style}. Atmospheric, empty hallways or rooms. No characters.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return "";
  } catch (e) {
    console.error(e);
    return "";
  }
}
