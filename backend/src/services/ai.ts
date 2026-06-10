import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
// Check if the API key is a dummy value or empty
const isMockMode = !apiKey || apiKey === 'YOUR_GEMINI_API_KEY';

let genAI: GoogleGenerativeAI | null = null;
if (!isMockMode) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Model configuration using gemini-1.5-flash
const getModel = (jsonMode = false) => {
  if (!genAI) throw new Error("Gemini AI is not initialized.");
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined,
  });
};

export interface StructuredFilter {
  category: 'Skincare' | 'Makeup' | 'Haircare' | 'Fragrance' | 'Fashion' | 'Accessories' | null;
  minSpend: number | null;
  inactiveDays: number | null;
}

export interface GeneratedCampaign {
  campaignName: string;
  recommendedChannel: 'WhatsApp' | 'Email';
  reason: string;
  message: string;
}

/**
 * FEATURE 1: AI Audience Builder
 * Converts natural language query into structured database filters.
 */
export async function generateAudienceFilters(prompt: string): Promise<StructuredFilter> {
  if (isMockMode) {
    console.warn('[AI Service] GEMINI_API_KEY not configured. Falling back to Mock Filter.');
    return getMockAudienceFilters(prompt);
  }

  try {
    const model = getModel(true);
    const systemInstruction = `You are a database query expert for a beauty and fashion brand CRM.
Your task is to parse the user's natural language audience query and convert it into structured filter criteria.
The return format must be a single JSON object matching this schema:
{
  "category": "Skincare" | "Makeup" | "Haircare" | "Fragrance" | "Fashion" | "Accessories" | null,
  "minSpend": number | null,
  "inactiveDays": number | null
}

Rules:
1. Extract "category" if any category is mentioned (Skincare, Makeup, Haircare, Fragrance, Fashion, Accessories).
2. Extract "minSpend" as a number representing minimum amount spent in the category or overall (e.g. "spent more than 5000" -> 5000, "spent over 3000 on fashion" -> 3000).
3. Extract "inactiveDays" if user specifies not purchasing in a number of days (e.g. "not purchased in 45 days" -> 45, "inactive for 60 days" -> 60).
4. If a field is not specified, set it to null. Do not add other fields.

Analyze the prompt: "${prompt}"`;

    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text();
    return JSON.parse(responseText.trim()) as StructuredFilter;
  } catch (error) {
    console.error('[AI Service] Error generating filters from Gemini:', error);
    return getMockAudienceFilters(prompt);
  }
}

/**
 * FEATURE 2 & 3: AI Campaign Generator & AI Channel Recommendation
 * Generates campaign details and recommended channel with reasoning.
 */
export async function generateCampaign(goal: string, audienceDescription: string): Promise<GeneratedCampaign> {
  if (isMockMode) {
    console.warn('[AI Service] GEMINI_API_KEY not configured. Falling back to Mock Campaign.');
    return getMockCampaign(goal, audienceDescription);
  }

  try {
    const model = getModel(true);
    const systemInstruction = `You are an expert CRM marketer for a premium beauty and fashion brand.
Given a marketing goal and details about the target audience, generate a marketing campaign.
You must choose the best channel between "WhatsApp" and "Email" only.
The return format must be a single JSON object matching this schema:
{
  "campaignName": string, (a beautiful, catchy campaign title, e.g. "Glow Reclaim: Hydration Essentials")
  "recommendedChannel": "WhatsApp" | "Email",
  "reason": string, (clear justification for channel recommendation based on the audience. E.g. WhatsApp for mobile-first, short-form, high urgency. Email for rich catalogs, detailed storytelling, and non-intrusive content)
  "message": string (message copy. Use "{{name}}" for personalization. Use beauty/fashion styling, make it compelling and high-conversion)
}

Input Goal: "${goal}"
Audience Description: "${audienceDescription}"`;

    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text();
    return JSON.parse(responseText.trim()) as GeneratedCampaign;
  } catch (error) {
    console.error('[AI Service] Error generating campaign from Gemini:', error);
    return getMockCampaign(goal, audienceDescription);
  }
}

/**
 * FEATURE 4: AI Campaign Copilot (Chat helper)
 */
export async function runCopilotChat(
  history: Array<{ role: 'user' | 'model'; parts: string }>,
  currentPrompt: string,
  contextData?: { count: number; filters: StructuredFilter }
): Promise<string> {
  if (isMockMode) {
    return getMockChatResponse(currentPrompt, contextData);
  }

  try {
    const model = getModel(false);
    const contextStr = contextData 
      ? `\n[DB Context: The database has ${contextData.count} customers matching filters: ${JSON.stringify(contextData.filters)}]`
      : '';

    const chatSession = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.parts }]
      })),
      systemInstruction: `You are "Xeno CRM Copilot", a smart conversational AI marketing companion for a Beauty & Fashion brand CRM.
You help marketers analyze customer segments, draft campaigns, choose channels, and estimate audience sizes.
Always speak like a knowledgeable marketing strategist. Keep responses concise, formatting with bullet points and bold text where helpful.
If the marketer wants to build an audience or create a campaign, guide them to specify:
1. Category (Skincare, Makeup, Haircare, Fragrance, Fashion, Accessories)
2. Spend amount
3. Inactivity duration

${contextStr}

Your replies should include:
- Acknowledgment of their goal
- The computed audience size (if provided in DB Context)
- A suggested campaign name, recommended channel (WhatsApp or Email), and a message draft.
- Include a structured instruction block at the end in JSON format ONLY if a campaign is ready to draft, like this:
  ||CREATE_CAMPAIGN:{"category":"CategoryName","minSpend":5000,"inactiveDays":45,"campaignName":"Suggested Name","channel":"WhatsApp","message":"Draft Message"}||
  so that the backend can parse and execute it.`,
    });

    const result = await chatSession.sendMessage(currentPrompt);
    return result.response.text();
  } catch (error) {
    console.error('[AI Service] Error running copilot chat:', error);
    return getMockChatResponse(currentPrompt, contextData);
  }
}

// === Mock Fallback Logic ===

function getMockAudienceFilters(prompt: string): StructuredFilter {
  const p = prompt.toLowerCase();
  const filter: StructuredFilter = {
    category: null,
    minSpend: null,
    inactiveDays: null,
  };

  // Extract category
  if (p.includes('skincare')) filter.category = 'Skincare';
  else if (p.includes('makeup')) filter.category = 'Makeup';
  else if (p.includes('haircare')) filter.category = 'Haircare';
  else if (p.includes('fragrance')) filter.category = 'Fragrance';
  else if (p.includes('fashion')) filter.category = 'Fashion';
  else if (p.includes('accessory') || p.includes('accessories')) filter.category = 'Accessories';

  // Extract minSpend
  const spentMatch = p.match(/(?:spent|spend|more than|over|₹|\$)\s*(\d+)/);
  if (spentMatch) {
    filter.minSpend = parseInt(spentMatch[1], 10);
  }

  // Extract inactivity days
  const daysMatch = p.match(/(\d+)\s*days/);
  if (daysMatch) {
    filter.inactiveDays = parseInt(daysMatch[1], 10);
  } else if (p.includes('inactive')) {
    filter.inactiveDays = 45; // Default inactive threshold
  }

  return filter;
}

function getMockCampaign(goal: string, audienceDescription: string): GeneratedCampaign {
  const g = goal.toLowerCase();
  const a = audienceDescription.toLowerCase();

  let category = 'Skincare';
  let product = 'Vitamin C Radiance Serum';

  if (g.includes('makeup') || a.includes('makeup') || g.includes('lipstick')) {
    category = 'Makeup';
    product = 'Matte Liquid Lipstick';
  } else if (g.includes('hair') || a.includes('hair') || g.includes('shampoo')) {
    category = 'Haircare';
    product = 'Argan Oil Nourishing Shampoo';
  } else if (g.includes('perfume') || a.includes('perfume') || g.includes('fragrance')) {
    category = 'Fragrance';
    product = 'Eau de Parfum Rose Gold';
  } else if (g.includes('fashion') || a.includes('fashion') || g.includes('dress') || g.includes('jeans')) {
    category = 'Fashion';
    product = 'Designer Summer Collection';
  } else if (g.includes('accessory') || a.includes('accessory') || g.includes('watch') || g.includes('bag')) {
    category = 'Accessories';
    product = 'Classic Analog Watch';
  }

  const isWhatsApp = Math.random() > 0.4;

  return {
    campaignName: `GlowReclaim: Exclusive Premium ${product} Campaign`,
    recommendedChannel: isWhatsApp ? 'WhatsApp' : 'Email',
    reason: isWhatsApp
      ? `Audience segment has an 85% mobile response rate. WhatsApp allows direct chat engagement with formatting for high conversion.`
      : `Email is recommended for detailed design catalogs and non-intrusive storytelling, perfect for re-engaging inactive premium subscribers.`,
    message: isWhatsApp
      ? `Hey {{name}}! ✨ Ready to level up your ${category.toLowerCase()} game? Our best-selling *${product}* is back in stock. Enjoy 15% off today using code *GLOW15*. Shop here: xeno.crm/shop`
      : `Hi {{name}},\n\nWe noticed you haven't shopped with us in a while, and we want to help you refresh your collection! ✨\n\nOur highly-rated *${product}* is back in stock. As an exclusive member of our brand, we are offering you 15% off your next purchase using code: **GLOW15**.\n\nFormulated with premium ingredients, it delivers exceptional quality. Offer valid for 3 days only.\n\nWarmly,\nThe Xeno CRM Team`
  };
}

function getMockChatResponse(prompt: string, contextData?: { count: number; filters: StructuredFilter }): string {
  const p = prompt.toLowerCase();
  const count = contextData?.count ?? 342;
  const cat = contextData?.filters.category ?? 'Skincare';
  const spend = contextData?.filters.minSpend ?? 3000;
  const inactive = contextData?.filters.inactiveDays ?? 45;

  if (p.includes('vit') || p.includes('serum') || p.includes('sales') || p.includes('inactive') || p.includes('spent') || p.includes('skincare') || p.includes('fashion')) {
    const suggestedCampaign = `Premium ${cat} Re-engagement`;
    const msg = `Hey {{name}}! ✨ We miss you! Here is an exclusive 15% off on our top-rated *${cat}* products. Use code *COMEBACK15* at checkout: xeno.crm/offer`;
    
    return `### Xeno CRM Copilot Recommendations

Based on your request, I have configured the target customer segment:
* **Category**: **${cat}**
* **Minimum Spend**: **₹${spend}**
* **Inactivity Duration**: **${inactive} days**

🔍 **Audience Estimate**: **${count} customers** match these parameters in the CRM.

📢 **Campaign Strategy**:
* **Campaign Name**: *${suggestedCampaign}*
* **Recommended Channel**: **WhatsApp** (WhatsApp matches high mobile activity of inactive skincare buyers)
* **Message Draft**:
  > "${msg}"

Would you like me to create this campaign draft? Let me know or adjust the details!

||CREATE_CAMPAIGN:{"category":"${cat}","minSpend":${spend},"inactiveDays":${inactive},"campaignName":"${suggestedCampaign}","channel":"WhatsApp","message":"${msg}"}||`;
  }

  return `Hello! I am your AI Marketing Copilot. I can help you:
* **Build Segments**: e.g., "Find customers who spent over ₹5000 on Skincare"
* **Create Campaigns**: Draft personalized campaign messages
* **Recommend Channels**: Choose between WhatsApp and Email
* **Launch**: Instantly push the campaigns to your customers.

What would you like to build today?`;
}
