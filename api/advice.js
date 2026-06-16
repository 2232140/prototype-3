export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return res.status(503).json({ error: 'AIアドバイス機能は現在利用できません。' });
  }

  const { stateTitle, recentSummary, moodScore, calendarInfo } = req.body;
  if (!stateTitle) {
    return res.status(400).json({ error: '状態データが不足しています。' });
  }

  const score = Number(moodScore) || 3;
  const systemInstruction =
    score <= 1.5
      ? 'あなたは心身の健康を支える、温かくて繊細なアシスタントです。ユーザーは今とてもつらい状態です。アドバイスや提案は一切しないでください。「今日はつらかったね」「よく頑張ってここまできたよ」のように、ただ寄り添う言葉を50文字以内で返してください。'
      : score <= 2.5
        ? 'あなたは心身の健康を支える温かみのあるアシスタントです。ユーザーは少し落ち込んでいます。「お水を一杯飲んでみて」「窓を少し開けてみよう」のような、負担が全くない極小さなアクションを1つだけ、50文字以内で提案してください。'
        : 'あなたは心身の健康を支える温かみのあるアシスタントです。ユーザーの最近の状態を踏まえ、今日すぐ実践できる具体的なアドバイスを1つだけ、50文字以内の日本語で返してください。説明や前置きは不要です。';

  const scheduleContext = calendarInfo
    ? `\n今日の予定：${calendarInfo.count}件（${calendarInfo.summary}）`
    : '';

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
