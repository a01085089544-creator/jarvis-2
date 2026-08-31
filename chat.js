import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"POST only"});
  try {
    const { message, image } = req.body || {};
    if (!message && !image) return res.status(400).json({error:"message or image is required"});
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({error:"OPENAI_API_KEY is not configured"});
    const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const content=[];
    if (message) content.push({type:"input_text",text:String(message)});
    if (image && typeof image==="string" && image.startsWith("data:image/"))
      content.push({type:"input_image",image_url:image});
    const response=await client.responses.create({
      model:"gpt-4.1-mini",
      instructions:"너는 JARVIS라는 한국어 AI 비서다. 자연스럽고 간결하게 답하고 사용자의 요청을 명확히 처리한다.",
      input:[{role:"user",content}]
    });
    return res.status(200).json({reply:response.output_text || "답변을 생성하지 못했습니다."});
  } catch(e) {
    console.error(e);
    return res.status(500).json({error:"AI 요청에 실패했습니다.",detail:e?.message || "unknown error"});
  }
}