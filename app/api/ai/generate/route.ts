import { NextRequest, NextResponse } from 'next/server'

const getSmartResponse = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase()
  
  // Summarization
  if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
    return "## Document Summary\n\n**Key Points:**\n• Main ideas and themes from your content\n• Important conclusions and findings\n• Action items or next steps\n\n**Structure:**\n• Clear introduction of the topic\n• Supporting evidence and examples\n• Logical conclusion\n\n*Tip: Look for the most important sentences in each paragraph to create your summary.*"
  }
  
  // Writing improvement
  if (lowerPrompt.includes('improve') || lowerPrompt.includes('better') || lowerPrompt.includes('enhance')) {
    return "## Writing Improvement Suggestions\n\n**Style Enhancements:**\n• Use active voice: 'We completed the project' vs 'The project was completed'\n• Vary sentence length for better flow\n• Replace weak verbs with stronger alternatives\n• Add specific examples and concrete details\n\n**Structure:**\n• Start with your main point\n• Use transitional phrases between ideas\n• End paragraphs with strong conclusions\n\n**Clarity:**\n• Remove unnecessary words and phrases\n• Define technical terms for your audience\n• Use bullet points for lists and key information"
  }
  
  // Outline creation
  if (lowerPrompt.includes('outline') || lowerPrompt.includes('structure') || lowerPrompt.includes('organize')) {
    return "## Document Outline Template\n\n**I. Introduction (10-15%)**\n• Hook or attention grabber\n• Background context\n• Clear thesis or main argument\n• Preview of main points\n\n**II. Body (70-80%)**\n• Point 1: [Your first main argument]\n  - Supporting evidence\n  - Examples or data\n• Point 2: [Your second main argument]\n  - Supporting evidence\n  - Examples or data\n• Point 3: [Your third main argument]\n  - Supporting evidence\n  - Examples or data\n\n**III. Conclusion (10-15%)**\n• Restate main points\n• Implications or significance\n• Call to action or next steps"
  }
  
  // Grammar and proofreading
  if (lowerPrompt.includes('grammar') || lowerPrompt.includes('proofread') || lowerPrompt.includes('edit')) {
    return "## Grammar & Proofreading Checklist\n\n**Common Errors to Check:**\n• Its vs it's (possessive vs contraction)\n• Your vs you're (possessive vs contraction)\n• There, their, they're\n• Affect vs effect (verb vs noun)\n\n**Punctuation:**\n• Commas in series: A, B, and C\n• Apostrophes for contractions and possession\n• Semicolons to connect related sentences\n\n**Sentence Structure:**\n• Subject-verb agreement\n• Parallel structure in lists\n• Avoid run-on sentences\n• Vary sentence beginnings\n\n**Final Check:**\n• Read aloud to catch awkward phrasing\n• Check spelling of proper nouns\n• Ensure consistent tense throughout"
  }
  
  // Professional writing
  if (lowerPrompt.includes('professional') || lowerPrompt.includes('formal') || lowerPrompt.includes('business')) {
    return "## Professional Writing Guidelines\n\n**Tone & Style:**\n• Use formal language, avoid contractions\n• Write in third person when appropriate\n• Maintain objective, confident tone\n• Avoid slang and casual expressions\n\n**Structure:**\n• Clear headings and subheadings\n• Executive summary for longer documents\n• Logical flow of information\n• Professional formatting\n\n**Content:**\n• Support claims with evidence\n• Use specific data and examples\n• Include relevant citations\n• Provide clear recommendations\n\n**Language:**\n• Use industry-appropriate terminology\n• Be concise but comprehensive\n• Avoid redundancy\n• Use strong, active verbs"
  }
  
  // Simplification
  if (lowerPrompt.includes('simplify') || lowerPrompt.includes('easier') || lowerPrompt.includes('clear')) {
    return "## Simplification Strategies\n\n**Language:**\n• Replace complex words with simpler alternatives\n• Use shorter sentences (15-20 words max)\n• Avoid jargon unless necessary\n• Define technical terms when used\n\n**Structure:**\n• Break long paragraphs into shorter ones\n• Use bullet points for lists\n• Add subheadings for easy scanning\n• Put important information first\n\n**Clarity:**\n• One main idea per paragraph\n• Use examples to illustrate concepts\n• Remove unnecessary words\n• Use 'you' to address the reader directly\n\n**Visual:**\n• Add white space between sections\n• Use bold for key terms\n• Consider numbered lists for processes\n• Keep paragraphs to 3-4 sentences"
  }
  
  // Creative writing
  if (lowerPrompt.includes('creative') || lowerPrompt.includes('story') || lowerPrompt.includes('narrative')) {
    return "## Creative Writing Tips\n\n**Character Development:**\n• Give characters clear motivations\n• Show personality through actions and dialogue\n• Create believable flaws and strengths\n• Develop character arcs throughout the story\n\n**Plot Structure:**\n• Start with an engaging hook\n• Build tension gradually\n• Include conflict and obstacles\n• Provide satisfying resolution\n\n**Writing Techniques:**\n• Show, don't tell\n• Use sensory details\n• Vary sentence structure\n• Create vivid imagery\n\n**Dialogue:**\n• Make it sound natural\n• Give each character a unique voice\n• Use dialogue to advance plot\n• Balance with narrative description"
  }
  
  // Default response
  return `## Writing Assistance for: "${prompt}"\n\n**General Writing Tips:**\n• **Clarity:** Make your main point clear from the beginning\n• **Structure:** Organize ideas logically with smooth transitions\n• **Evidence:** Support your points with specific examples\n• **Audience:** Write for your intended readers' knowledge level\n\n**Next Steps:**\n• Identify your main message\n• Outline your key supporting points\n• Write a strong opening and conclusion\n• Review and revise for clarity\n\n**Quick Improvements:**\n• Remove unnecessary words\n• Use active voice when possible\n• Vary your sentence length\n• Check for grammar and spelling errors\n\n*This is a smart fallback response. For AI-powered assistance, configure an API key.*`
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, roomId } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    // Always use smart fallback responses
    const response = getSmartResponse(prompt)
    
    return NextResponse.json({ 
      response,
      fallback: true,
      message: "Using smart writing assistance. Configure an AI API for enhanced features."
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}