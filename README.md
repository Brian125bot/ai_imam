<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Ai-Imam: Fatwas by Imam Ai-Kitab

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

*An AI-powered virtual Imam delivering scholarly Islamic legal rulings in classical style*

[View in AI Studio](https://ai.studio/apps/drive/1ssnbjWrXZ6bB-iW274Yyf2Uq5i6SWVW_)

</div>

## 📖 Overview

**Ai-Imam** is a sophisticated web application that leverages Google's Gemini AI to provide well-structured Islamic legal rulings (fatwas) on matters of Fiqh (Islamic jurisprudence). The application delivers responses in both classical Arabic and formal English, emulating the scholarly tone and structure of traditional Islamic scholarship.

### Key Features

- **🤖 AI-Powered Fatwas**: Utilizes Google Gemini 2.5 Pro for generating scholarly Islamic rulings
- **🌐 Bilingual Output**: Provides fatwas in both classical Arabic (with proper vocalization) and formal English
- **🎯 Structured Response**: JSON-validated responses ensure consistent formatting and structure
- **🎤 Text-to-Speech**: Built-in voice synthesis for reading fatwas aloud in both languages
- **📋 Easy Sharing**: One-click copy functionality for sharing fatwas
- **🎨 Modern UI**: Responsive, accessible interface with Tailwind CSS styling
- **⚡ Real-time Highlighting**: Synchronized word highlighting during text-to-speech playback
- **📱 Mobile-Friendly**: Fully responsive design that works on all device sizes

### Technology Stack

- **Frontend**: React 19.2 with TypeScript
- **Build Tool**: Vite 6.2
- **AI Model**: Google Gemini 2.5 Pro via @google/genai SDK
- **Styling**: Custom CSS with CSS variables and Tailwind-like utilities
- **Internationalization**: Support for English (en-US) and Arabic (ar-SA)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later
- **Google Gemini API Key** (Get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Brian125bot/ai_imam.git
   cd ai_imam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > **Note**: The application expects the API key in the `GEMINI_API_KEY` environment variable. The Vite configuration automatically maps this to `process.env.API_KEY` in the application.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 📚 Usage

### Asking Questions

1. Type your question about Islamic jurisprudence in the text area
2. Click "Issue Fatwa" or press Enter
3. Wait while the AI generates a comprehensive response
4. View the ruling in both English and Arabic

### Example Questions

- "What is the ruling on fasting while traveling?"
- "Is music permissible in Islam?"
- "Explain the conditions for Zakat on wealth."
- "How should one perform the funeral prayer (Salat al-Janazah)?"

### Using Text-to-Speech

1. After receiving a fatwa, click "Read English" or "قراءة الفتوى" (Read Arabic)
2. Select your preferred voice from the dropdown menu
3. Watch as the text is highlighted in sync with the speech
4. Click the button again to stop playback

### Sharing Fatwas

Click the "Share Fatwa" button to copy the complete ruling (question + English + Arabic) to your clipboard.

## 🏗️ Project Structure

```
ai_imam/
├── api/                    # API route handlers (if deployed with serverless)
│   └── generate.ts
├── components/             # React components
│   ├── ErrorMessage.tsx    # Error display component
│   ├── FatwaDisplay.tsx    # Main fatwa rendering with TTS
│   ├── LoadingSpinner.tsx  # Animated loading indicator
│   └── PromptForm.tsx      # User input form
├── services/               # Service layer
│   └── geminiService.ts    # Google Gemini API integration
├── App.tsx                 # Root application component
├── index.tsx               # Application entry point
├── index.html              # HTML template
├── types.ts                # TypeScript type definitions
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies
└── README.md               # This file
```

## ⚙️ Configuration

### Vite Configuration

The `vite.config.ts` file configures:
- Server port (3000) and host (0.0.0.0 for network access)
- Environment variable injection
- Path aliases for cleaner imports
- React plugin for Fast Refresh

### TypeScript Configuration

The `tsconfig.json` is optimized for:
- ES2022 target with modern JavaScript features
- React JSX transformation
- Bundler module resolution
- Path aliases (@/* → ./*)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Development Workflow

1. Make your changes in the source files
2. The dev server automatically reloads
3. Test your changes in the browser
4. Run `npm run build` to verify production build
5. Commit your changes

### Code Style

The project follows these conventions:
- **TypeScript**: Strict type checking with explicit types
- **React**: Functional components with hooks
- **Comments**: JSDoc-style documentation for all components and functions
- **Naming**: PascalCase for components, camelCase for functions/variables

## 🌐 API Integration

### Gemini Service

The `geminiService.ts` module handles all interactions with the Google Gemini API:

**Key Features:**
- Structured JSON output with schema validation
- Comprehensive error handling with user-friendly messages
- System instructions for consistent scholarly tone
- Temperature set to 0.5 for balanced creativity and accuracy

**Response Schema:**
```typescript
{
  englishFatwa: string;  // Complete fatwa in formal English
  arabicFatwa: string;   // Complete fatwa in classical Arabic
}
```

**Error Handling:**
- Invalid API key
- Rate limiting
- Safety blocks
- Network errors
- Malformed responses

### Rate Limits

Be aware of Google Gemini API rate limits:
- Free tier: 60 requests per minute
- Paid tier: Varies by plan

## 📦 Building for Production

### Build Process

```bash
# Build the application
npm run build

# Output directory: dist/
# - dist/index.html
# - dist/assets/*.js
# - dist/assets/*.css
```

### Build Optimization

Vite automatically applies:
- Code splitting for optimal loading
- Tree shaking to remove unused code
- Minification for smaller bundle size
- Asset hashing for cache busting

### Deployment

The application can be deployed to:

1. **Static Hosting** (Netlify, Vercel, GitHub Pages)
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **AI Studio**
   - Use the provided AI Studio link for cloud deployment
   - Environment variables are managed in AI Studio settings

3. **Docker** (see DEPLOYMENT.md for detailed instructions)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🧪 Testing

Currently, the application doesn't include automated tests. However, manual testing should cover:

- ✅ Form submission with valid questions
- ✅ Error handling for empty input
- ✅ API error responses (invalid key, rate limits)
- ✅ Text-to-speech functionality in both languages
- ✅ Voice selection and switching
- ✅ Copy to clipboard functionality
- ✅ Responsive design on mobile/tablet/desktop
- ✅ Loading states and animations

## 🐛 Troubleshooting

### Common Issues

**"API key is missing" error**
- Ensure `.env.local` file exists with `GEMINI_API_KEY=your_key`
- Restart the dev server after adding environment variables

**"The provided API key is invalid" error**
- Verify your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check for extra spaces or characters in your `.env.local` file

**"Rate limit exceeded" error**
- You've hit the API rate limit
- Wait a few minutes before trying again
- Consider upgrading your API plan for higher limits

**Text-to-speech not working**
- Ensure your browser supports the Web Speech API
- Check browser permissions for audio
- Try a different browser (Chrome/Edge work best)

**Build fails**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Check Node.js version: `node -v` (should be 18+)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear, descriptive commits
4. Test your changes thoroughly
5. Update documentation as needed
6. Submit a pull request

### Contribution Areas

- 🐛 Bug fixes and error handling improvements
- ✨ New features (e.g., fatwa history, favorites)
- 🌍 Localization for additional languages
- 📖 Documentation improvements
- ♿ Accessibility enhancements
- 🎨 UI/UX improvements

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## ⚠️ Disclaimer

**Important Notice:**

This application uses generative AI and should be used for educational and reference purposes only. The fatwas generated by this AI are **not a substitute for consultation with qualified Islamic scholars**.

- AI responses may contain inaccuracies or lack important nuances
- Complex legal matters should be referred to trained Islamic jurists
- Different schools of Islamic thought may have varying opinions
- Context and individual circumstances matter in Islamic rulings

Always verify important religious rulings with credible scholars and trusted Islamic institutions.

## 🙏 Acknowledgments

- **Google Gemini AI** for the powerful language model
- **React Team** for the excellent framework
- **Vite Team** for the blazingly fast build tool
- **Islamic Scholars** whose wisdom inspires this educational tool

## 📞 Support

For issues, questions, or suggestions:

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Brian125bot/ai_imam/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Brian125bot/ai_imam/discussions)
- 📧 **Email**: Create an issue for contact

## 🔗 Links

- [Live Demo (AI Studio)](https://ai.studio/apps/drive/1ssnbjWrXZ6bB-iW274Yyf2Uq5i6SWVW_)
- [Google Gemini Documentation](https://ai.google.dev/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

<div align="center">

**Built with ❤️ for the Muslim community**

~the door is finished & peace~

</div>
