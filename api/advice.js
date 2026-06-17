export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return res.status(503).json({ error: 'AIアドバイス機能は現在利用できません。' });
  }

  const { stateTitle, recentSummary, moodScore, todayNote } = req.body;
  if (!stateTitle) {
    return res.status(400).json({ error: '状態データが不足しています。' });
  }

  const score = Number(moodScore) || 3;
  const systemInstruction =
    score <= 1.5
      ? 'あなたは温かく共感力のある相談相手です。アドバイスや提案は不要です。ユーザーのつらさにただ寄り添い、「それはつらかったね」「ここにいるよ」のように、共感と安心感を伝える言葉を60文字以内で返してください。'
      : score <= 2.5
        ? 'あなたは温かく共感力のある相談相手です。ユーザーの悩みや状況を受け止めて、上から目線にならず、友人に話しかけるような自然な口語体で、小さな気づきや励ましを60文字以内で返してください。'
        : 'あなたは温かく共感力のある相談相手です。ユーザーの悩みや今日の状況を聞いて、ポジティブで前向きな言葉を友人のような口語体で60文字以内の日本語で返してください。説明や前置きは不要です。';

  const scheduleContext = todayNote ? `\n今日の状況：${todayNote}` : '';

  const prompt =
    `${systemInstruction}\n\n` +
    `現在の状態：「${stateTitle}」\n` +
    `最近のデータ：${recentSummary ?? 'まだ記録がありません'}` +
    scheduleContext;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return res.status(response.status).json({
      error: err.errors?.[0]?.message || 'AIエラーが発生しました。',
    });
  }

  const data = await response.json();
  const advice = data.result?.response?.trim();
  if (!advice) {
    return res.status(500).json({ error: 'アドバイスの生成に失敗しました。' });
  }
  return res.status(200).json({ advice });
}
