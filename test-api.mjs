// Quick test for DeepSeek API
import { readFileSync } from 'fs';

// Read .env manually
const envContent = readFileSync('.env', 'utf-8');
const DEEPSEEK_API_KEY = envContent.match(/DEEPSEEK_API_KEY=(.+)/)?.[1]?.trim();

console.log('🔑 API Key:', DEEPSEEK_API_KEY ? `${DEEPSEEK_API_KEY.slice(0, 10)}...${DEEPSEEK_API_KEY.slice(-4)}` : 'NOT FOUND');
console.log('📡 Testing DeepSeek API...\n');

try {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello in one word.' }
      ],
      max_tokens: 10,
      temperature: 0.7,
    }),
  });

  console.log('📊 Status:', response.status, response.statusText);
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ API funcionando!');
    console.log('📝 Resposta:', data.choices[0].message.content);
  } else {
    console.log('❌ Erro da API:');
    console.log(JSON.stringify(data, null, 2));
  }
} catch (error) {
  console.error('❌ Erro ao chamar API:', error.message);
}
