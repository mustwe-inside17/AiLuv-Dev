const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenAI, HarmCategory, HarmBlockThreshold } = require("@google/genai");

// ❌ ลบ defineSecret ออกไปก่อน เราจะใช้ Hardcode เทส
// const { defineSecret } = require("firebase-functions/params"); 
// const apiKeySecret = defineSecret("GOOGLE_API_KEY");

exports.generateCharacterResponse = onCall(
  { 
    cors: true, 
    timeoutSeconds: 60, 
    minInstances: 0, 
    // secrets: [apiKeySecret], // ❌ ปิดไว้ก่อน
  }, 
  async (request) => {
    
    // 🧪 HARDCODE TEST: ใส่ Key บอสตรงนี้เลย! (ห้ามลืมลบออกตอนขึ้น Prod นะคะ!)
    const apiKey = "AIzaSyAcxwiXqUoc2XH8jktM_Qs-0ZDhIl4VhZY"; 
    
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'Server Error: API Key missing.');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Validate Input
    const { contents, config } = request.data;
    if (!contents) {
      throw new HttpsError('invalid-argument', 'Missing prompt contents.');
    }

    // Settings ที่บังคับใช้จาก Server (เพื่อความชัวร์เรื่องเฟียร์เงียบ)
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    let attempts = 0;
    const maxRetries = 3;

    while (attempts < maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          // ✅ FIX: ใส่ Safety Settings ที่นี่เลย (นอก config) ตามมาตรฐานใหม่
          config: config || {}, 
          safetySettings: safetySettings, 
        });

        return {
          text: response.text ? response.text() : JSON.stringify(response), 
        };

      } catch (error) {
        attempts++;
        console.warn(`Attempt ${attempts} failed: ${error.message}`);

        const isRateLimit = error.message && (error.message.includes('429') || error.message.includes('400'));
        
        if (isRateLimit && attempts < maxRetries) {
          const delay = Math.pow(2, attempts) * 1000; 
          console.log(`Rate Limit hit. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; 
        }

        if (attempts === maxRetries) {
           console.error("Final Gemini Error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
           if (isRateLimit) {
             throw new HttpsError('resource-exhausted', 'AI is overloaded. Please try again later.');
           }
           throw new HttpsError('internal', `Gemini Error: ${error.message || 'Unknown error'}`);
        }
      }
    }
});