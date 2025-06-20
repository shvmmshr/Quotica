/**
 * Test utility for the chat context system
 * This file can be used to test the context functionality
 */

import {
  getChatContext,
  getRelevantChatContext,
  formatContextForOpenAI,
  formatContextForGemini,
} from '../utils/chat-context';
import { chatConfig } from '../config/chat';

// Mock data for testing
const mockSessionId = 'test-session-123';

export async function testBasicContext() {
  console.log('🧪 Testing basic context retrieval...');

  try {
    const context = await getChatContext(mockSessionId, 1000);
    console.log(`✅ Retrieved ${context.length} messages`);
    console.log('Context preview:', context.slice(0, 2));
    return true;
  } catch (error) {
    console.error('❌ Basic context test failed:', error);
    return false;
  }
}

export async function testRelevantContext() {
  console.log('🧪 Testing relevant context selection...');

  try {
    const testMessage = 'Create a motivational quote about success and perseverance';
    const context = await getRelevantChatContext(mockSessionId, testMessage, 1000);
    console.log(`✅ Retrieved ${context.length} relevant messages`);
    console.log('Relevant context preview:', context.slice(0, 2));
    return true;
  } catch (error) {
    console.error('❌ Relevant context test failed:', error);
    return false;
  }
}

export async function testContextFormatting() {
  console.log('🧪 Testing context formatting...');

  try {
    const context = await getChatContext(mockSessionId, 500);

    // Test OpenAI formatting
    const openAIContext = formatContextForOpenAI(context, chatConfig.context.systemPrompts.bot);
    console.log(`✅ OpenAI format: ${openAIContext.length} messages`);

    // Test Gemini formatting
    const geminiContext = formatContextForGemini(context, chatConfig.context.systemPrompts.gemini);
    console.log(`✅ Gemini format: ${geminiContext.length} characters`);

    return true;
  } catch (error) {
    console.error('❌ Context formatting test failed:', error);
    return false;
  }
}

export async function testConfigurationSettings() {
  console.log('🧪 Testing configuration settings...');

  try {
    console.log('Configuration loaded:');
    console.log(`- Max words: ${chatConfig.context.maxWords}`);
    console.log(`- Max messages: ${chatConfig.context.maxMessages}`);
    console.log(`- Use relevant context: ${chatConfig.context.useRelevantContext}`);
    console.log(`- Include image context: ${chatConfig.context.includeImageContext}`);
    console.log('✅ Configuration test passed');
    return true;
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    return false;
  }
}

export async function runAllTests() {
  console.log('🚀 Starting chat context system tests...\n');

  const tests = [
    testConfigurationSettings,
    testBasicContext,
    testRelevantContext,
    testContextFormatting,
  ];

  const results = [];

  for (const test of tests) {
    const result = await test();
    results.push(result);
    console.log(''); // Add spacing between tests
  }

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`📊 Test Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All tests passed! Chat context system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above.');
  }

  return passed === total;
}

// Example usage in API route for debugging
export function debugContextInfo(sessionId: string, currentMessage: string) {
  return {
    sessionId,
    currentMessage,
    config: {
      maxWords: chatConfig.context.maxWords,
      useRelevantContext: chatConfig.context.useRelevantContext,
      maxMessages: chatConfig.context.maxMessages,
    },
    timestamp: new Date().toISOString(),
  };
}
