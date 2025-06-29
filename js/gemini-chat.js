// Import the Google GenAI library
import { GoogleGenAI } from "@google/genai";

class GeminiChat {
    constructor() {
        // Initialize Gemini API with the API key
        this.ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
        this.model = "gemini-2.5-flash";
        this.chatHistory = [];
    }

    async sendMessage(message, isVoice = false) {
        try {
            let prompt = message;
            
            // If it's a voice message, add context
            if (isVoice) {
                prompt = `This is a transcribed voice message: ${message}
                Please provide a natural and conversational response.`;
            }

            // Add user message to chat history
            this.chatHistory.push({
                role: 'user',
                content: message
            });

            // Generate response using Gemini
            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ]
            });

            // Get the response text
            const responseText = response.text;

            // Add AI response to chat history
            this.chatHistory.push({
                role: 'assistant',
                content: responseText
            });

            return responseText;

        } catch (error) {
            console.error('Error in Gemini chat:', error);
            throw new Error('Failed to get response from AI');
        }
    }

    async processVoiceRecording(audioBlob) {
        try {
            // Convert audio to text (you'll need to implement this part based on your needs)
            // For now, we'll use a placeholder
            const transcribedText = "Transcribed text will go here";
            
            // Send transcribed text to Gemini
            return await this.sendMessage(transcribedText, true);

        } catch (error) {
            console.error('Error processing voice recording:', error);
            throw new Error('Failed to process voice recording');
        }
    }

    clearHistory() {
        this.chatHistory = [];
    }
}

export default GeminiChat; 