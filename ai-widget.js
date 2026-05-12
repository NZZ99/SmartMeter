/**
 * Assistive Touch AI Widget
 * Vanilla JavaScript version for SmartMeter Pro
 * 
 * This widget adds an iPhone-style floating button with Gemini AI chat
 * API key is kept secure on the backend
 */

class AssistiveTouchAIWidget {
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || '/api/chat';
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;
    this.init();
  }

  init() {
    this.createStyles();
    this.createHTML();
    this.attachEventListeners();
  }

  createStyles() {
    const styleId = 'ai-widget-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Assistive Touch Button */
      .assistive-touch-button {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        transition: all 0.3s ease;
        z-index: 999;
      }

      .assistive-touch-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
      }

      .assistive-touch-button:active {
        transform: scale(0.95);
      }

      .button-icon {
        display: block;
        animation: rotate 2s linear infinite;
      }

      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Chat Widget Container */
      .assistive-touch-widget {
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        z-index: 998;
        animation: slideUp 0.3s ease;
        overflow: hidden;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Widget Header */
      .widget-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 20px 20px 0 0;
      }

      .widget-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .close-button {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .close-button:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      /* Messages Container */
      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f8f9fa;
      }

      .messages-container::-webkit-scrollbar {
        width: 6px;
      }

      .messages-container::-webkit-scrollbar-track {
        background: transparent;
      }

      .messages-container::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
      }

      .messages-container::-webkit-scrollbar-thumb:hover {
        background: #999;
      }

      /* Welcome Message */
      .welcome-message {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        color: #999;
        font-size: 14px;
      }

      /* Message Styles */
      .message {
        display: flex;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .message.user {
        justify-content: flex-end;
      }

      .message.assistant {
        justify-content: flex-start;
      }

      .message-content {
        max-width: 75%;
        padding: 10px 14px;
        border-radius: 16px;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.4;
      }

      .message.user .message-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom-right-radius: 4px;
      }

      .message.assistant .message-content {
        background: #e8e8e8;
        color: #333;
        border-bottom-left-radius: 4px;
      }

      /* Typing Animation */
      .message-content.typing {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 14px;
      }

      .message-content.typing span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #999;
        animation: typing 1.4s infinite;
      }

      .message-content.typing span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .message-content.typing span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          opacity: 0.5;
          transform: translateY(0);
        }
        30% {
          opacity: 1;
          transform: translateY(-10px);
        }
      }

      /* Error Message */
      .error-message {
        padding: 8px 12px;
        background: #fee;
        color: #c33;
        font-size: 12px;
        border-left: 3px solid #c33;
        margin: 0 8px;
      }

      /* Input Form */
      .input-form {
        display: flex;
        gap: 8px;
        padding: 12px;
        background: white;
        border-top: 1px solid #e0e0e0;
        border-radius: 0 0 20px 20px;
      }

      .message-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 10px 14px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease;
        font-family: inherit;
      }

      .message-input:focus {
        border-color: #667eea;
      }

      .message-input:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
      }

      .send-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .send-button:hover:not(:disabled) {
        transform: scale(1.05);
      }

      .send-button:active:not(:disabled) {
        transform: scale(0.95);
      }

      .send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Responsive Design */
      @media (max-width: 480px) {
        .assistive-touch-widget {
          width: calc(100vw - 20px);
          height: 70vh;
          bottom: 80px;
          right: 10px;
          left: 10px;
        }

        .message-content {
          max-width: 85%;
        }

        .assistive-touch-button {
          bottom: 20px;
          right: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  createHTML() {
    // Create button
    const button = document.createElement('button');
    button.className = 'assistive-touch-button';
    button.innerHTML = '<span class="button-icon">⚙️</span>';
    button.addEventListener('click', () => this.toggle());

    // Create widget
    const widget = document.createElement('div');
    widget.className = 'assistive-touch-widget';
    widget.style.display = 'none';
    widget.innerHTML = `
      <div class="widget-header">
        <h3>AI Assistant</h3>
        <button class="close-button" aria-label="Close">✕</button>
      </div>
      <div class="messages-container">
        <div class="welcome-message">
          <p>👋 Hello! How can I help you today?</p>
        </div>
      </div>
      <div class="error-message" style="display: none;"></div>
      <form class="input-form">
        <input type="text" class="message-input" placeholder="Type your message..." />
        <button type="submit" class="send-button">→</button>
      </form>
    `;

    document.body.appendChild(button);
    document.body.appendChild(widget);

    this.button = button;
    this.widget = widget;
    this.messagesContainer = widget.querySelector('.messages-container');
    this.errorContainer = widget.querySelector('.error-message');
    this.form = widget.querySelector('.input-form');
    this.input = widget.querySelector('.message-input');
    this.sendBtn = widget.querySelector('.send-button');
    this.closeBtn = widget.querySelector('.close-button');
  }

  attachEventListeners() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.form.addEventListener('submit', (e) => this.handleSendMessage(e));
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.widget.style.display = 'flex';
    this.input.focus();
  }

  close() {
    this.isOpen = false;
    this.widget.style.display = 'none';
  }

  async handleSendMessage(e) {
    e.preventDefault();
    const message = this.input.value.trim();
    if (!message || this.isLoading) return;

    this.input.value = '';
    this.addMessage('user', message);
    this.isLoading = true;
    this.sendBtn.disabled = true;
    this.input.disabled = true;
    this.errorContainer.style.display = 'none';

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      this.addMessage('assistant', data.reply);
    } catch (err) {
      this.showError(err.message || 'Failed to get response');
      this.addMessage('assistant', `Error: ${err.message}. Please try again.`);
    } finally {
      this.isLoading = false;
      this.sendBtn.disabled = false;
      this.input.disabled = false;
      this.input.focus();
    }
  }

  addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);
    this.messagesContainer.appendChild(messageDiv);

    // Remove welcome message if exists
    const welcome = this.messagesContainer.querySelector('.welcome-message');
    if (welcome) welcome.remove();

    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  showError(errorMsg) {
    this.errorContainer.textContent = errorMsg;
    this.errorContainer.style.display = 'block';
  }
}

// Initialize widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.aiWidget = new AssistiveTouchAIWidget({
    apiEndpoint: '/api/chat',
  });
});
