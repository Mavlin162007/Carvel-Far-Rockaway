class ChatInterface {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.recordButton = document.getElementById('recordButton');
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];

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
                this.addMessage('System: Unable to access microphone. Please check permissions.', 'ai-message');
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
        // Here you would typically send the audioBlob to your server
        // and then to the Gemini API for processing
        // For now, we'll just show a placeholder message
        this.addMessage('Audio recording completed. (Integration with Gemini API pending)', 'ai-message');
    }

    handleSendMessage() {
        const message = this.userInput.value.trim();
        if (message) {
            this.addMessage(message, 'user-message');
            this.userInput.value = '';
            
            // Simulate AI response (replace with actual Gemini API call)
            setTimeout(() => {
                this.addMessage('This is a placeholder response. Gemini API integration pending.', 'ai-message');
            }, 1000);
        }
    }

    addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.textContent = text;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize chat interface when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chat = new ChatInterface();
}); 