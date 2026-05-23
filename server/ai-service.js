export async function handleAiSummary(body) {
  const profile = String(body?.profile || '').trim().slice(0, 1200);

  if (profile.length < 40) {
    return {
      status: 400,
      body: {
        ok: false,
        message: 'Добавьте больше информации для краткого описания.'
      }
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      status: 200,
      body: {
        ok: true,
        source: 'local-fallback',
        summary: buildFallbackSummary(profile)
      }
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        instructions:
          'Ты помогаешь junior frontend разработчику коротко и честно описать свой опыт для лендинга. Пиши по-русски, без обещаний уровня senior.',
        input: `Сделай краткое описание в 2 предложениях на основе текста:\n\n${profile}`,
        max_output_tokens: 180
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API responded with ${response.status}`);
    }

    const payload = await response.json();
    const summary = extractOpenAiText(payload);

    return {
      status: 200,
      body: {
        ok: true,
        source: 'openai',
        summary: summary || buildFallbackSummary(profile)
      }
    };
  } catch (error) {
    console.error('AI summary error:', error);

    return {
      status: 200,
      body: {
        ok: true,
        source: 'local-fallback',
        summary: buildFallbackSummary(profile)
      }
    };
  }
}

function extractOpenAiText(payload) {
  if (typeof payload.output_text === 'string') {
    return payload.output_text.trim();
  }

  const content = payload.output
    ?.flatMap((item) => item.content || [])
    ?.find((item) => item.type === 'output_text');

  return typeof content?.text === 'string' ? content.text.trim() : '';
}

function buildFallbackSummary(profile) {
  const clearText = profile.replace(/\s+/g, ' ');
  const firstSentence = clearText.split(/[.!?]/)[0]?.trim();

  return `${firstSentence || 'Я начинающий frontend разработчик'}, который делает адаптивные интерфейсы, подключает формы к API и внимательно проверяет пользовательские состояния. В работе использую AI как помощника для разбора новой темы и поиска ошибок, но финальные решения проверяю вручную.`;
}
