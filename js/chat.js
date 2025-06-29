import GeminiChat from './gemini-chat.js';

class ChatInterface {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.recordButton = document.getElementById('recordButton');
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        // Initialize Gemini Chat
        this.geminiChat = new GeminiChat();

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        this.recordButton.addEventListener('click', () => this.toggleRecording());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
    }

    async handleSendMessage() {
        const message = this.userInput.value.trim();
        if (message) {
            // Add user message to chat
            this.addMessage(message, 'user-message');
            this.userInput.value = '';

            try {
                // Show loading indicator
                this.showLoadingIndicator();

                // Get response from Gemini
                const response = await this.geminiChat.sendMessage(message);
                
                // Hide loading indicator
                this.hideLoadingIndicator();

                // Add AI response to chat
                this.addMessage(response, 'ai-message');
            } catch (error) {
                console.error('Error getting AI response:', error);
                this.hideLoadingIndicator();
                this.addMessage('Sorry, I encountered an error. Please try again.', 'ai-message error');
            }
        }
    }

    async toggleRecording() {
        if (!this.isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];

                this.mediaRecorder.addEventListener('dataavailable', (event) => {
                    this.audioChunks.push(event.data);
                });

                this.mediaRecorder.addEventListener('stop', () => {
                    this.processAudioRecording();
                });

                this.mediaRecorder.start();
                this.isRecording = true;
                this.recordButton.innerHTML = '<i class="fas fa-stop"></i>';
                this.recordButton.classList.add('recording');
            } catch (error) {
                console.error('Error accessing microphone:', error);
                this.addMessage('System: Unable to access microphone. Please check permissions.', 'ai-message error');
            }
        } else {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.recordButton.innerHTML = '<i class="fas fa-microphone"></i>';
            this.recordButton.classList.remove('recording');
        }
    }

    async processAudioRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        try {
            // Show loading indicator
            this.showLoadingIndicator();

            // Process audio with Gemini
            const response = await this.geminiChat.processVoiceRecording(audioBlob);
            
            // Hide loading indicator
            this.hideLoadingIndicator();

            // Add AI response to chat
            this.addMessage(response, 'ai-message');
        } catch (error) {
            console.error('Error processing audio:', error);
            this.hideLoadingIndicator();
            this.addMessage('Sorry, I encountered an error processing your voice message.', 'ai-message error');
        }
    }

    addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.textContent = text;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading';
        loadingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        this.chatMessages.appendChild(loadingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideLoadingIndicator() {
        const loadingDiv = this.chatMessages.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
}

// Initialize chat interface when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chat = new ChatInterface();
}); 