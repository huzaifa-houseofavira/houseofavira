const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // relies on env

async function run() {
  console.log("Starting stream test...");
  try {
    const responseStream = await ai.interactions.create({
      model: 'gemini-3.7-flash',
      input: 'User: hello\n\nAssistant:',
      system_instruction: "You are a helpful assistant.",
      stream: true,
    });
    
    console.log("Stream opened. Reading chunks...");
    for await (const event of responseStream) {
      if (event.event_type === "step.delta" && event.delta && event.delta.type === "text") {
        if (event.delta.text) {
          process.stdout.write(event.delta.text);
        }
      }
    }
    console.log("\nDone.");
  } catch (error) {
    console.error("Error:", error);
  }
}
run();
