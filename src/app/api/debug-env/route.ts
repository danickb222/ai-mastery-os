import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasOpenAIEval: !!process.env.OPENAI_EVAL_MODEL,
    nodeEnv: process.env.NODE_ENV,
    allKeys: Object.keys(process.env).filter(k =>
      k.includes('OPENAI') || k.includes('API')
    )
  })
}
