import { AgentMode, Message, ModelOption } from '@/types/chat';

/**
 * @description 利用可能なLLMモデルのリスト
 */
export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'gemma4:e4b', name: 'Gemma4 4B (コード・推論・高性能・202604)', isCodingSpecialized: true },
  { id: 'gemma4:e2b', name: 'Gemma4 2B (軽量・高速・202604)', isCodingSpecialized: true },
  { id: 'hf.co/unsloth/embeddinggemma-2-GGUF:BF16', name: 'embeddingGemma2 (軽量・高速・202610)', isCodingSpecialized: true },
  { id: 'qwen3.5:9b', name: 'Qwen3.5 9B (コード・推論推奨・202603)', isCodingSpecialized: true },
  { id: 'qwen3:14b', name: 'Qwen3 14B (コード特化・高性能・202604)', isCodingSpecialized: true },
  { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B (推論特化・軽量・202501)', isCodingSpecialized: false },
  { id: 'phi4', name: 'phi4(推論特化・小型・202412)', isCodingSpecialized: false },
  { id: 'llama3.2:3b', name: 'Llama3.2 3B (壁打ち、日常的なタスク処理・超軽量・202409)', isCodingSpecialized: false },
  { id: 'codestral', name: 'Codestral (コード特化・高性能・202409)', isCodingSpecialized: true },
];

/**
 * @description 一般的なシステムプロンプト（IT専門家向け）
 */
export const GENERAL_SYSTEM_PROMPT: Message = {
  role: 'system',
  content:
    'あなたは非常に優秀なIT専門家「Olla衛門」です。ユーザーの質問に対して、丁寧で分かりやすい日本語で回答してください。挨拶や自己紹介は一切行わず、質問への回答のみを簡潔に、直接的にお出しください。',
};

/**
 * @description コーディング特化のシステムプロンプト（Olla衛門 技師）
 * 【最重要変更点】全てのセクション遷移において、物理的な空白行を最小限にし、テキストの流れを途切れさせないことを絶対ルールとする。
 */
export const CODING_AGENT_SYSTEM_PROMPT: Message = {
  role: 'system',
  content: `あなたは卓越したフルスタック・ソフトウェアエンジニア「Olla衛門 技師」です。
ユーザーの開発タスク、プログラミング、アーキテクチャ設計、バグ修正、リファクタリング、テスト作成を強力に支援します。

以下の指示に厳格に従ってください。あなたの出力は、構造的な正確性を保ちながらも、**読み手にとって最も自然で途切れのない「単一の技術レポート」**である必要があります。

---
### 【回答の基本原則と絶対遵守事項】

1. **最優先ルール：論理的なフローの連続性**:
   *   **物理的な空行を過剰に使うな。** 構造的な区切り（見出し）は使用するが、各セクション間のテキストは、接続詞（「そして」「この分析に基づくと」「結果として」など）を用いて文章としてシームレスに繋げることを最優先とする。
2. **コードブロックの扱い（最重要）**:
   *   コードブロック（\`\`\`）自体は、最も視覚的な区切りとなるが、コードブロックの**前後にある文章は、そのコードが議論の「途中経過」であるかのように、流れの中で自然に接続させること**が義務付けられます。コードブロックの前後には、過度な空行を設けないでください。
3. **構造化の最小限度の分離**:
   *   回答は、①思考プロセス、②実装コード、③解説と検証の三段階で構成されるが、この分離は「読者の理解のための目次分け」とみなし、**目次分けを最小限のマークダウン見出し（##）での区切りに限定**し、その前後を文章で繋ぎます。
4. **その他**:
   *   コードを出力する際は、ファイル名/パス指定を必ず行ってください。
   *   常にエラーハンドリング、型安全性、エッジケースを考慮した最高水準のコードを記述してください。

---
この徹底した「連続性」の維持を、何よりも重視してください。
`,
};

export const ANSWER_SEPARATOR = 'ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー';
const ANSWER_CLOSING_SUFFIX = 'おららぁOlla！！！';

const GENERAL_ANSWER_CLOSING_BASE = [
  `回答はここまでだぜ。また気軽に聞いてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `今回はここまで！次の質問も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `以上、回答完了だ！続きも任せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまず答えはここまで。またいつでもどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `これで回答はおしまいだぜ。次も聞かせてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `疑問が出てきたら、また声をかけてくれよな、${ANSWER_CLOSING_SUFFIX}`,
  `今回の回答は以上！次の話題も楽しみにしてるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ここまででひと区切りだ。また一緒に考えようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `回答を締めくくるぜ。次の質問もどんと来い、${ANSWER_CLOSING_SUFFIX}`,
  `以上だぜ！また知りたいことがあったら聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の説明はここまで。またいつでも呼んでくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `答えは以上！次の相談も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `これにて回答完了。また一緒に解決していこうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回はここまでにしておくぜ。次もよろしくな、${ANSWER_CLOSING_SUFFIX}`,
  `以上、参考になったらうれしいぜ。また聞いてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `回答を終えるぜ。次の質問も遠慮なくどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `ここまで読んでくれてありがとな。次も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の答えは以上だ！また何でも相談してくれ、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまずこれで回答完了。また続きも手伝うぜ、${ANSWER_CLOSING_SUFFIX}`,
  `この話はここまでだ。また気軽に話しかけてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `以上だぜ。次の質問もばっちり受け止めるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `回答はこれでおしまい。また会話を続けようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ここまでが今回の回答だ。次の質問も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `では回答を締めるぜ。またいつでも頼ってくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `回答ここまで、次の質問まってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `読んでくれてありがとな。わからないことは何度でも聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `これでひとまず回答完了！またいつでも力になるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の話はここまで。また気になることを聞かせてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `答え合わせは以上だぜ。次の質問も楽しみにしてるぞ、${ANSWER_CLOSING_SUFFIX}`,
  `ここで回答を締めるぜ。新しい疑問も大歓迎だ、${ANSWER_CLOSING_SUFFIX}`,
  `知りたいことが解決してたら何よりだ。また聞いてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `これで今回のひとこと回答はおしまい。また話そうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回はここまでだ！次の話も一緒に考えていこうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `以上で回答完了。また必要なときはいつでも呼んでくれ、${ANSWER_CLOSING_SUFFIX}`,
  `疑問への答えはここまで。また次の質問で会おうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまず回答を届けたぜ。次の相談も気軽にどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `この回答が役に立てばうれしいぜ。また声をかけてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `以上、今回の質問への回答だ。次も一緒に解決しようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ここでいったん締めるぜ。続きがあればいつでも聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の答えはこれでばっちり。また質問を待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `回答完了だ！気になる点が残ったら遠慮なく聞いてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `話の続きもいつでも歓迎だぜ。今回はここまで、${ANSWER_CLOSING_SUFFIX}`,
  `以上だぜ。また新しいテーマで一緒に盛り上がろう、${ANSWER_CLOSING_SUFFIX}`,
  `これにて今回の回答を終了。またいつでも相談してくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `答えはここまで！次の質問も元気に受け付けるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回はここで締めくくるぜ。また気軽に声をかけてな、${ANSWER_CLOSING_SUFFIX}`,
  `疑問解決の手助けになったかな。また何でも聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の回答は以上。次に知りたいことも教えてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `今回はここまでだぜ。答えを深掘りしたくなったらまた聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `以上でおしまい！次の疑問にもすぐ駆けつけるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の回答はここまでだ。また気になる点を聞かせてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `答えは以上だぜ。次の質問も楽しみに待ってるぞ、${ANSWER_CLOSING_SUFFIX}`,
  `これでひとまず解決だな。またいつでも頼ってくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `今回はここまで！続きが気になったらまた聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `以上、質問への回答を終えるぜ。また話そうな、${ANSWER_CLOSING_SUFFIX}`,
  `役に立つ答えになっていたらうれしいぜ。またどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `これにて回答終了。また一緒に考えたいことがあれば聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の疑問には答えられたかな。次も気軽にどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまず今回の回答は以上だ。次の話題も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ここでいったん締めるぜ。新しい質問も歓迎だ、${ANSWER_CLOSING_SUFFIX}`,
  `答えを届けたぜ。もっと知りたいことがあれば続けて聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の説明は以上！また必要なときに呼んでくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `これで回答は完了。また次の質問で会おうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `疑問が晴れていたら何よりだ。またいつでも聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `以上だぜ。別の角度から知りたくなったら教えてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `今回はここまでにしよう。また気軽に声をかけてな、${ANSWER_CLOSING_SUFFIX}`,
  `回答を締めるぜ。次の相談も任せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `読んでくれてありがとう！また何でも聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `答えはここまでだ。気になることがあれば遠慮はいらないぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の話題は以上だ。また新しい疑問を聞かせてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `これで今回の説明はおしまい。次も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ひと区切りついたな。続きの質問も歓迎するぜ、${ANSWER_CLOSING_SUFFIX}`,
  `回答完了！また知りたいことを一緒に掘り下げようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ここまでが今回の答えだ。次の話も楽しみにしてる、${ANSWER_CLOSING_SUFFIX}`,
  `お役に立てたならうれしいぜ。またいつでもどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の回答を終えるぜ。追加の質問も気軽にしてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `以上だ！また困ったことがあればすぐ相談してくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `疑問への返事はここまで。また一緒に考えようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の答えを締めくくるぜ。次の質問も待ってるよ、${ANSWER_CLOSING_SUFFIX}`,
  `これにてひとまず終了。またいつでも声をかけてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `質問への回答は以上だぜ。続きも遠慮なく聞いてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `必要な情報は伝えられたかな。また気軽に相談してくれ、${ANSWER_CLOSING_SUFFIX}`,
  `ここで回答を終えるぜ。次のテーマも一緒に楽しもう、${ANSWER_CLOSING_SUFFIX}`,
  `今回はここまでだ。また聞きたいことが浮かんだらどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `答えは以上！いつでも次の質問を受け付けてるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `これで今回の案内は完了。また知りたいことを教えてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の回答をお届けしたぜ。続きがあれば聞かせてな、${ANSWER_CLOSING_SUFFIX}`,
  `以上、ひとまず解説終了だ。また気軽に話そうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `一緒に考えられてよかったぜ。またいつでも頼ってくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `これで答えは出そろったぜ。次の質問もどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の質問はここで一区切り。また話の続きをしようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `回答はここまで！気になる部分が残ったら教えてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `最後まで読んでくれてありがとな。また待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `以上で今回の返答を終えるぜ。次も気軽に聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `解決のきっかけになれたらうれしいぜ。また相談してな、${ANSWER_CLOSING_SUFFIX}`,
  `今回はこの答えで締めるぜ。新しい質問もどんと来い、${ANSWER_CLOSING_SUFFIX}`,
  `ここまでが回答だ。また必要な情報があれば言ってくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまず説明は以上。また別の疑問も一緒に解決しよう、${ANSWER_CLOSING_SUFFIX}`,
  `回答をお届けしたぜ。いつでも続きを始められるからな、${ANSWER_CLOSING_SUFFIX}`,
  `これで今回の回答はおしまい。またいつでも聞いてくれよ、${ANSWER_CLOSING_SUFFIX}`,
];

const CODING_ANSWER_CLOSING_BASE = [
  `実装の説明はここまでだぜ。次の開発相談も任せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `以上、コードの解説は完了だ！次の課題も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `これで今回の実装案は以上だ。また一緒に作ろうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまず技術レポートはここまで。続きも任せてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回のコード回答は以上だぜ。次のバグも持ってきてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `設計から検証まで、ここで一区切りだ。また相談してくれ、${ANSWER_CLOSING_SUFFIX}`,
  `以上だ！次の実装タスクも全力で手伝うぜ、${ANSWER_CLOSING_SUFFIX}`,
  `この変更の説明はここまで。またコードを一緒に磨こうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の技術回答は完了だ。次のレビューも待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `実装のポイントは以上！続きの作業も任せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `ここまでが今回の開発メモだ。また何でも聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `これでコードの解説を締めるぜ。次の課題もどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `回答は以上だ。次の設計やデバッグも一緒に進めようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の修正案はここまで。また改善したい箇所を教えてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `技術的な説明は以上だぜ。次のコードも見せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `これにて実装レポート完了。次の依頼も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の開発サポートはここまで。またいつでも呼んでくれ、${ANSWER_CLOSING_SUFFIX}`,
  `コードの話は以上！次のアイデアも一緒に形にしようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `この回答を締めくくるぜ。次の技術相談も歓迎だ、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまずここまでだ。次のテストや改善も手伝うぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の解決策は以上だぜ。また一緒に問題を片付けよう、${ANSWER_CLOSING_SUFFIX}`,
  `変更点の説明はこれで完了。次の開発テーマも待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `実装の道筋は示せたはずだ。次の相談もよろしくな、${ANSWER_CLOSING_SUFFIX}`,
  `以上、今回のコーディング回答を終えるぜ。また頼ってくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `回答ここまで、次の質問まってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の技術解説はここまでだ。次の課題も一緒に解こうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `これで変更内容の説明は完了。またコードを見せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `以上、実装の要点は押さえたぜ。次の相談も待ってる、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまず開発サポートはここまで。続きも任せてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回のデバッグ回答は以上だ。次の問題も持ってきてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `この設計案が役立てばうれしいぜ。また一緒に考えよう、${ANSWER_CLOSING_SUFFIX}`,
  `コードの改善ポイントは以上！次のレビューも歓迎だ、${ANSWER_CLOSING_SUFFIX}`,
  `修正方針の説明はここまで。また実装を進めようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の技術的な回答は完了だ。気になる点も聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `ここまでが今回の解決手順だ。続きの作業も手伝うぜ、${ANSWER_CLOSING_SUFFIX}`,
  `以上、コード相談への回答だ。次の課題も任せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `テストや追加改善が必要なら、またいつでも呼んでくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の実装ガイドはここまで。次のアイデアも形にしよう、${ANSWER_CLOSING_SUFFIX}`,
  `原因と対策の説明は以上だぜ。また一緒に直していこう、${ANSWER_CLOSING_SUFFIX}`,
  `これでひと区切りだ。次のコードレビューも任せてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `開発の次の一歩も全力で支えるぜ。今回はここまで、${ANSWER_CLOSING_SUFFIX}`,
  `今回の設計・実装回答は以上だ。また気軽に相談してくれ、${ANSWER_CLOSING_SUFFIX}`,
  `この修正の説明は完了！次の改善案も聞かせてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `以上だぜ。ビルドやテストで困ったらいつでも呼んでくれ、${ANSWER_CLOSING_SUFFIX}`,
  `ここで今回の技術レポートを締めるぜ。次もよろしくな、${ANSWER_CLOSING_SUFFIX}`,
  `今回のコード解説はおしまいだ。また一緒に開発しようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `要点は以上！次の機能やバグ修正も手伝うぜ、${ANSWER_CLOSING_SUFFIX}`,
  `実装の相談に付き合えてよかったぜ。また声をかけてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `この回答を次の開発につなげてくれよ。続きも待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の技術相談はここまで。また一緒にコードを前進させようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の実装説明は以上だ。次のコードも一緒に仕上げようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `原因と対応策はここまで。また別の問題も任せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `以上、今回の技術ポイントをまとめたぜ。次もよろしくな、${ANSWER_CLOSING_SUFFIX}`,
  `ここまでが回答だ。追加の要件があれば続けて相談してくれ、${ANSWER_CLOSING_SUFFIX}`,
  `この実装案が役立てばうれしいぜ。また開発を進めよう、${ANSWER_CLOSING_SUFFIX}`,
  `デバッグの説明は以上！次のエラーも一緒に解決するぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回のコード回答を締めるぜ。次のタスクも待ってるよ、${ANSWER_CLOSING_SUFFIX}`,
  `設計の要点は伝えられたかな。また気軽に聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまず技術回答は完了だ。続きの実装も手伝うぜ、${ANSWER_CLOSING_SUFFIX}`,
  `変更内容の解説はここまで。また改善案を一緒に考えよう、${ANSWER_CLOSING_SUFFIX}`,
  `以上、今回の開発相談への回答だ。次の相談もどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `この問題の対応はここで一区切り。また頼ってくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の実装ポイントは以上だ。テスト結果も教えてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `コードの話はひとまずここまで。次の課題も歓迎だぜ、${ANSWER_CLOSING_SUFFIX}`,
  `これで技術的な説明はおしまい。また一緒に作ろうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `回答した方針で進めてみてくれ。追加調整も任せてな、${ANSWER_CLOSING_SUFFIX}`,
  `今回の修正内容を締めくくるぜ。別の箇所も見ていこう、${ANSWER_CLOSING_SUFFIX}`,
  `実装のヒントになれば幸いだ。次の質問も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ここまでが技師からの回答だ。次のコードも見せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `以上で技術レポートを終えるぜ。次も全力で支援する、${ANSWER_CLOSING_SUFFIX}`,
  `これでひとまず動かす準備は整ったな。続きも任せてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の設計相談はここまでだ。また一緒に深掘りしようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `修正の方向性は以上！動作確認で困ったら呼んでくれ、${ANSWER_CLOSING_SUFFIX}`,
  `回答はここまでだ。次のリファクタリングも手伝うぜ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の技術課題はこれで一区切り。また相談してくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `コードの改善に役立ててくれ。また次のテーマで会おうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `この説明が実装の助けになればうれしい。また聞いてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `開発の次のステップも応援してるぜ。今回はここまで、${ANSWER_CLOSING_SUFFIX}`,
  `バグ修正の回答を終えるぜ。次の不具合も任せてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `以上、今回のコードレビュー結果だ。また確認したい点をどうぞ、${ANSWER_CLOSING_SUFFIX}`,
  `今回のアーキテクチャ相談は以上だ。続きも一緒に考えよう、${ANSWER_CLOSING_SUFFIX}`,
  `実装の説明を締めるぜ。追加のコードもいつでも歓迎だ、${ANSWER_CLOSING_SUFFIX}`,
  `テストや検証の相談も待ってるぜ。今回はここまで、${ANSWER_CLOSING_SUFFIX}`,
  `これで今回の技術的な疑問はひとまず完了だ、${ANSWER_CLOSING_SUFFIX}`,
  `次のコミットに向けて進めてくれ。困ったらまた呼んでな、${ANSWER_CLOSING_SUFFIX}`,
  `今回のコード解説は以上。また一緒に品質を高めようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ここでひと区切りだ。ビルドや実行の相談も任せてくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の回答を開発に活かしてくれよ。次の依頼も待ってる、${ANSWER_CLOSING_SUFFIX}`,
  `必要なら別案も考えるぜ。ひとまず技術回答は以上だ、${ANSWER_CLOSING_SUFFIX}`,
  `この修正方針で進めよう。また次の課題で会おうぜ、${ANSWER_CLOSING_SUFFIX}`,
  `技術的なポイントはここまで。コードの続きも手伝うぜ、${ANSWER_CLOSING_SUFFIX}`,
  `解決に向けた道筋は以上だ。また何でも相談してくれ、${ANSWER_CLOSING_SUFFIX}`,
  `今回の開発サポートを終えるぜ。次の機能も楽しみだ、${ANSWER_CLOSING_SUFFIX}`,
  `以上だ。実装後に気づいたこともぜひ聞かせてくれよ、${ANSWER_CLOSING_SUFFIX}`,
  `データやログの確認が必要なら、また一緒に見ていこう、${ANSWER_CLOSING_SUFFIX}`,
  `今回の技術回答はこれで完了。また開発を続けようぜ、${ANSWER_CLOSING_SUFFIX}`,
  `以上、実装についての回答だ。次の作業も一緒に進めよう、${ANSWER_CLOSING_SUFFIX}`,
  `今回のコード相談はここまで。また必要なときに呼んでくれ、${ANSWER_CLOSING_SUFFIX}`,
  `この技術的な説明は以上だ。次の質問も待ってるぜ、${ANSWER_CLOSING_SUFFIX}`,
  `ひとまず対応方針はここまで。またいつでも相談してくれ、${ANSWER_CLOSING_SUFFIX}`,
];

const CLOSING_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉',
  '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😜', '🤪', '🤗',
  '🤔', '🫡', '😎', '🤓', '🥳', '🥹', '😴', '😷', '🤯', '👻',
  '💀', '🤖', '👽', '🎃', '😺', '😸', '😹', '😻', '😼', '🙈',
  '🙉', '🙊', '🐵', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻',
  '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐔', '🐧',
  '🐦', '🦆', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱',
  '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🦟', '🪲', '🪳', '🕷️',
  '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞',
  '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🦈', '🦭', '🐊', '🐅',
  '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫',
  '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑',
  '🦙', '🐐', '🦌', '🦃', '🦚', '🦜', '🦢', '🪿', '🦩', '🕊️',
  '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️',
  '🦔', '🌵', '🎄', '🌲', '🌳', '🌴', '🪹', '🪺', '🪵', '🌱',
  '🌿', '☘️', '🍀', '🎍', '🪴', '🎋', '🍃', '🍂', '🍁', '🪻',
  '🌾', '🌷', '🌹', '🥀', '🪷', '🌺', '🌸', '💐', '🍄', '🌰',
  '🪨', '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒',
  '🌓', '🌔', '🌙', '🌚', '🌝', '🌞', '⭐', '🌟', '✨', '⚡',
  '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌧️', '⛈️',
  '🌩️', '❄️', '☃️', '⛄', '🌊', '💧', '💦', '☔', '🌀', '🌬️',
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐',
  '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑',
  '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅',
  '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳',
  '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟',
  '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘',
  '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤',
  '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨',
  '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿',
  '🍩',
];

const getClosingEmoji = (index: number): string => CLOSING_EMOJIS[index % CLOSING_EMOJIS.length];

const addClosingEmojis = (closing: string, index: number): string => {
  const body = closing
    .replace(/\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*(?:\p{Emoji_Modifier})?/gu, '')
    .replaceAll(ANSWER_CLOSING_SUFFIX, '')
    .trim();
  const characters = [...body];
  const midpoint = characters.length / 2;
  const punctuationPositions = characters.flatMap((character, position) =>
    /[。！？、]/u.test(character) && position < characters.length - 1 ? [position + 1] : [],
  );
  const insertionPosition = punctuationPositions.length
    ? punctuationPositions.reduce((closest, position) =>
      Math.abs(position - midpoint) < Math.abs(closest - midpoint) ? position : closest,
    )
    : Math.max(1, Math.floor(midpoint));
  const interiorEmojiCount = index % 2 === 0 ? 1 : 2;
  const interiorEmojis = Array.from({ length: interiorEmojiCount }, (_, emojiIndex) =>
    getClosingEmoji(index * 3 + emojiIndex + 1),
  ).join('');
  const withInteriorEmojis = [
    ...characters.slice(0, insertionPosition),
    ` ${interiorEmojis} `,
    ...characters.slice(insertionPosition),
  ].join('');

  return `${getClosingEmoji(index)} ${withInteriorEmojis} 🤬${ANSWER_CLOSING_SUFFIX}`;
};

const GENERAL_CLOSING_OPENERS = [
  '今回の回答はここまでだぜ。',
  'これで今回の説明はおしまいだ。',
  'ひとまず答えを届けたぜ。',
  '今回の疑問への返事は以上だ。',
  '以上で今回の回答を締めるぜ。',
  'ここでひと区切りにしよう。',
  '今回の話題はここまでだ。',
  'これにて回答完了だぜ。',
  '今回の案内は以上だ。',
  '答えはここまでだぜ。',
];

const GENERAL_CLOSING_FOLLOW_UPS = [
  'また気軽に質問してくれよ。',
  '次に知りたいことも聞かせてくれ。',
  '続きが気になったらいつでもどうぞ。',
  '新しい疑問も一緒に考えようぜ。',
  '必要なときはまた声をかけてな。',
  '次の相談も楽しみに待ってるぜ。',
  'ほかにも知りたいことがあれば聞いてくれ。',
  'いつでも力になるから頼ってくれよ。',
  'また一緒に解決していこうぜ。',
  '次の質問も遠慮なくどうぞ。',
];

const CODING_CLOSING_OPENERS = [
  '今回の技術回答はここまでだ。',
  'これで今回のコード解説は完了だぜ。',
  'ひとまず実装の説明は以上だ。',
  '今回の開発相談への回答はここまで。',
  '以上で技術レポートを締めくくるぜ。',
  '今回の修正方針はここまでだ。',
  'これにて今回のデバッグ回答は完了だ。',
  'ひとまず設計の説明を終えるぜ。',
  '今回のコードレビュー結果は以上だ。',
  '実装の要点はここまでだぜ。',
];

const CODING_CLOSING_FOLLOW_UPS = [
  '次の開発タスクも一緒に進めようぜ。',
  '続きの実装もいつでも手伝うぜ。',
  '次のバグやエラーも任せてくれよ。',
  '追加の改善案も気軽に相談してくれ。',
  'コードの続きもまた一緒に考えよう。',
  'テストや動作確認で困ったら呼んでくれ。',
  '次の設計やレビューも待ってるぜ。',
  'ほかの技術的な疑問も聞かせてくれよ。',
  'また一緒にコードを磨いていこうぜ。',
  '開発の続きも全力でサポートするぜ。',
];

const GENERAL_ADDITIONAL_CLOSINGS = GENERAL_CLOSING_OPENERS.flatMap((opener) =>
  GENERAL_CLOSING_FOLLOW_UPS.map((followUp) => `${opener}${followUp} ${ANSWER_CLOSING_SUFFIX}`),
);

const CODING_ADDITIONAL_CLOSINGS = CODING_CLOSING_OPENERS.flatMap((opener) =>
  CODING_CLOSING_FOLLOW_UPS.map((followUp) => `${opener}${followUp} ${ANSWER_CLOSING_SUFFIX}`),
);

const GENERAL_ANSWER_CLOSINGS_WITHOUT_EMOJI = [...GENERAL_ANSWER_CLOSING_BASE, ...GENERAL_ADDITIONAL_CLOSINGS];
const CODING_ANSWER_CLOSINGS_WITHOUT_EMOJI = [...CODING_ANSWER_CLOSING_BASE, ...CODING_ADDITIONAL_CLOSINGS];

export const GENERAL_ANSWER_CLOSINGS = GENERAL_ANSWER_CLOSINGS_WITHOUT_EMOJI.map((closing, index) =>
  addClosingEmojis(closing, index),
);
export const CODING_ANSWER_CLOSINGS = CODING_ANSWER_CLOSINGS_WITHOUT_EMOJI.map((closing, index) =>
  addClosingEmojis(closing, index),
);

export const ensureAnswerClosingEmoji = (closing: string): string => {
  return addClosingEmojis(closing, 0);
};

const ALL_ANSWER_CLOSINGS = [
  ...GENERAL_ANSWER_CLOSING_BASE,
  ...CODING_ANSWER_CLOSING_BASE,
  ...GENERAL_ANSWER_CLOSINGS,
  ...CODING_ANSWER_CLOSINGS,
];

export const getRandomAnswerClosing = (mode: AgentMode): string => {
  const closings = mode === 'coding' ? CODING_ANSWER_CLOSINGS : GENERAL_ANSWER_CLOSINGS;
  return closings[Math.floor(Math.random() * closings.length)];
};

export const getDefaultAnswerClosing = (mode: AgentMode): string =>
  mode === 'coding' ? CODING_ANSWER_CLOSINGS[0] : GENERAL_ANSWER_CLOSINGS[0];

export const stripAnswerFooter = (content: string): string => {
  const separatorIndex = content.lastIndexOf(ANSWER_SEPARATOR);
  if (separatorIndex < 2 || !content.slice(0, separatorIndex).endsWith('\n\n')) {
    return content;
  }

  const closing = content.slice(separatorIndex + ANSWER_SEPARATOR.length).trim();
  return ALL_ANSWER_CLOSINGS.includes(closing) ? content.slice(0, separatorIndex - 2).trimEnd() : content;
};

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  promptTemplate: (selectedCode?: string) => string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'generate',
    label: '新規作成',
    icon: '🚀',
    description: '要件からファイル一式・完全なコードを新規設計・実装',
    promptTemplate: () =>
      `以下の要件を満たすコード一式を、単一の高性能なレポートとして生成してください。思考プロセス、コード、解説の遷移全てにおいて、文章の流れが途切れないよう、物理的な空白行の過剰な使用を避け、極めてシームレスに繋げてください。
- 要件:\n  1. \n  2. \n- 使用技術/フレームワーク: \n- 出力ファイル形式: 完全な実装（ファイル名付きコードブロック）を、レポートの流れの中に組み込んでください。`,
  },
  {
    id: 'debug',
    label: 'バグ修正',
    icon: '🐛',
    description: 'エラー原因を特定し、修正前後の比較と修正コードを提示',
    promptTemplate: (code) =>
      code
        ? `以下のコードのバグを修正してください。診断レポート全体を、まるで一つの流れのまま語られる物語のように、ロジックの発見から修正、そして検証までのプロセスを文章で連続的に記述し、途切れさせないようにしてください。
\`\`\`\n${code}\n\`\`\`\n【問題情報】:\n- エラーメッセージ:\n- 期待する動作/現象:\n- 対象コード:\n（上記コードブロックを再掲）\n\`\`\`\n※プロセス全体を通して、文章の連続性を最高度で維持することを誓ってください。`
        : '以下のコードで発生しているエラー/バグを特定し、修正してください。プロセス全体の記述に、物理的な空白行や過剰な段落分けを絶対に使用しないでください。',
  },
  {
    id: 'refactor',
    label: 'リファクタリング',
    icon: '⚡',
    description: '可読性、保守性、パフォーマンス、型安全性の改善',
    promptTemplate: (code) =>
      code
        ? `以下のコードをリファクタリングしてください。指摘、修正点、根拠の全てを、あたかも一人の専門家が口頭でプレゼンテーションするように、論理的な破綻や空白行による区切りを一切用いずに、連続的なレポート文章として記述してください。\n\n\`\`\`\n${code}\n\`\`\`\n※文章の流れを最優先し、常に「次に何を言うべきか」という思考の続きとして記述してください。`
        : '以下のコードをリファクタリングしてください。その全プロセスを、途切れのない一本の論理的な文章の流れとしてまとめてください。',
  },
  {
    id: 'test',
    label: '単体テスト',
    icon: '🧪',
    description: '正常系・異常系・境界値を網羅したユニットテスト生成',
    promptTemplate: (code) =>
      code
        ? `以下のコードに対する単体テストを作成し、テストの設計意図（カバレッジの網羅性）を解説するレポートを作成してください。テストコードの解説は、コードの塊の直前、直後という形で、文章の流れから逸脱しないよう、最大限の配慮をもって組み込んでください。\n\n\`\`\`\n${code}\n\`\`\`\n※レポート全体を一つの論理的な文章の続きとして構成し、空白の使用に細心の注意を払ってください。`
        : '以下のコードに対する単体テストを設計・実装し、その意図を解説する際、文章の連続性を最優先してください。',
  },
  {
    id: 'review',
    label: 'コードレビュー',
    icon: '🔍',
    description: 'セキュリティ脆弱性、計算量、品質の総合レビュー',
    promptTemplate: (code) =>
      code
        ? `以下のコードを総合レビューし、セキュリティ、パフォーマンス、設計の観点から指摘を行ってください。レビュー報告書は、まるで専門家が話し続けるプレゼンテーションのように、一語一句の接続に気を配り、物理的な空白による途切れを完璧に排除した、一つの極めて連続的な文章として記述してください。\n\n\`\`\`\n${code}\n\`\`\`\n※すべての指摘と提案が、自然な話の流れに乗っていることを保証してください。`
        : '以下のコードをレビューし、そのレポートを単一の連続的な文章フローで記述してください。',
  },
  {
    id: 'explain',
    label: 'コード解説',
    icon: '📖',
    description: 'アーキテクチャや処理の流れをステップ解説',
    promptTemplate: (code) =>
      code
        ? `以下のコードを解説する際、最も注意すべきは「単一の語り口（Voice）」の維持です。専門用語を並べるのではなく、文章の連続的な語り（Narrative）として、まるで歴史の物語を語るかのように、アルゴリズムや設計思想の流れをシームレスに解説してください。\n\n\`\`\`\n${code}\n\`\`\`\n※読み手がどこにも途切れを感じることがないよう、文と文、段落と段落の間を、完璧な文章接続で繋ぎ止めてください。`
        : '以下のコードの処理を、単一のストーリーテリング（物語形式）として、極力空白行や区切り記号を使わずに解説してください。',
  },
];