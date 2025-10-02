/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyAC8xoz0bTRFIZzZtlCvK00tthO5fpMeLk');

// Function to generate image description using Gemini and create a dynamic image
async function generateImageWithGemini(prompt: string, styleValues: any): Promise<string> {
  try {
    // Create enhanced prompt based on style values
    const enhancedPrompt = createEnhancedPrompt(prompt, styleValues);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Generate detailed description for the artwork
    const result = await model.generateContent([
      {
        text: `Create a detailed visual description for an NFT artwork based on this prompt: ${enhancedPrompt}. Describe the colors, composition, style, and artistic elements in detail. This description will be used to generate the actual image.`
      }
    ]);

    const description = result.response.text();
    console.log('Generated description:', description);

    // Generate a unique image identifier
    const imageId = uuidv4();
    const imageName = `ai-generated-${imageId}.jpg`;

    // Create a real AI-generated image based on the prompt and style
    await generateRealImage(imageName, prompt, styleValues, description);

    return imageName;

  } catch (error) {
    console.error('Gemini generation error:', error);
    // Fallback to creating a basic dynamic image
    const imageId = uuidv4();
    const imageName = `fallback-${imageId}.jpg`;
    await generateRealImage(imageName, prompt, styleValues, 'AI-generated artwork');
    return imageName;
  }
}

// Function to create enhanced prompt based on style values
function createEnhancedPrompt(basePrompt: string, styleValues: any): string {
  const { colorPalette, artStyle, complexity, mood } = styleValues;

  let enhancedPrompt = basePrompt;

  // Add color palette information
  if (colorPalette && colorPalette.length > 0) {
    enhancedPrompt += ` with a color palette featuring ${colorPalette.join(', ')}`;
  }

  // Add art style
  if (artStyle) {
    enhancedPrompt += ` in ${artStyle} style`;
  }

  // Add complexity level
  if (complexity) {
    enhancedPrompt += ` with ${complexity} level of detail`;
  }

  // Add mood
  if (mood) {
    enhancedPrompt += ` conveying a ${mood} mood`;
  }

  return enhancedPrompt;
}

// Function to generate real AI images using Hugging Face API
async function generateRealImage(imageName: string, prompt: string, styleValues: any, description: string): Promise<void> {
  const { artStyle = 'modern', mood = 'vibrant' } = styleValues;

  // Create enhanced prompt for image generation
  const enhancedPrompt = `${description}, ${artStyle} style, ${mood} mood, high quality, detailed, digital art, masterpiece`;

  try {
    // Use Pollinations AI - completely free, no API key required
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&model=flux&enhance=true`;

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();

    // Ensure the mock-images directory exists
    const imagesDir = path.join(process.cwd(), 'public', 'api', 'mock-images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Save the generated image
    const filePath = path.join(imagesDir, imageName);
    fs.writeFileSync(filePath, Buffer.from(imageBuffer));

    console.log(`Generated real AI image: ${imageName}`);
  } catch (error) {
    console.error('Error generating image with AI:', error);
    // Fallback to a simple placeholder if AI generation fails
    await createFallbackImage(imageName, prompt, styleValues);
  }
}

// Fallback function for when AI generation fails
async function createFallbackImage(imageName: string, prompt: string, styleValues: any): Promise<void> {
  const { colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1'], artStyle = 'modern', complexity = 'medium', mood = 'vibrant' } = styleValues;

  // Create a dynamic SVG based on the prompt and style as fallback
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colorPalette[0]};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colorPalette[1] || colorPalette[0]};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${colorPalette[2] || colorPalette[0]};stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/> 
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg)" />
  
  <!-- Dynamic shapes based on prompt -->
  ${generateShapesFromPrompt(prompt, colorPalette, complexity)}
  
  <!-- Text overlay -->
  <text x="256" y="450" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold" filter="url(#glow)">
    ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}
  </text>
  
  <!-- Style indicator -->
  <text x="256" y="480" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="12">
    ${artStyle.toUpperCase()} • ${mood.toUpperCase()}
  </text>
  
  <!-- Fallback indicator -->
  <text x="256" y="30" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="10">
    FALLBACK MODE
  </text>
</svg>`;

  // Ensure the mock-images directory exists
  const imagesDir = path.join(process.cwd(), 'public', 'api', 'mock-images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Save the SVG file
  const filePath = path.join(imagesDir, imageName.replace('.jpg', '.svg'));
  fs.writeFileSync(filePath, svg);

  console.log(`Generated fallback image: ${imageName}`);
}

// Helper function to generate shapes based on prompt keywords
function generateShapesFromPrompt(prompt: string, colors: string[], complexity: string): string {
  const shapes = [];
  const promptLower = prompt.toLowerCase();

  // Base complexity multiplier
  const shapeCount = complexity === 'high' ? 8 : complexity === 'medium' ? 5 : 3;

  for (let i = 0; i < shapeCount; i++) {
    const x = Math.random() * 400 + 56;
    const y = Math.random() * 400 + 56;
    const size = Math.random() * 80 + 20;
    const color = colors[i % colors.length];
    const opacity = Math.random() * 0.6 + 0.3;

    if (promptLower.includes('circle') || promptLower.includes('round') || i % 3 === 0) {
      shapes.push(`<circle cx="${x}" cy="${y}" r="${size / 2}" fill="${color}" opacity="${opacity}" />`);
    } else if (promptLower.includes('star') || promptLower.includes('cosmic') || i % 3 === 1) {
      shapes.push(createStar(x, y, size / 2, color, opacity));
    } else {
      shapes.push(`<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="${color}" opacity="${opacity}" transform="rotate(${Math.random() * 360} ${x} ${y})" />`);
    }
  }

  return shapes.join('\n  ');
}

// Helper function to create a star shape
function createStar(cx: number, cy: number, r: number, color: string, opacity: number): string {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : r / 2;
    const x = cx + radius * Math.cos(angle - Math.PI / 2);
    const y = cy + radius * Math.sin(angle - Math.PI / 2);
    points.push(`${x},${y}`);
  }
  return `<polygon points="${points.join(' ')}" fill="${color}" opacity="${opacity}" />`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, styleValues, regenerate = false } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate image using Gemini AI
    console.log('Generating image with prompt:', prompt);
    const generatedImage = await generateImageWithGemini(prompt, styleValues || {});

    // Generate a unique ID for this generation
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return the generated NFT data
    return res.status(200).json({
      success: true,
      data: {
        id: generationId,
        imageUrl: `/api/mock-images/${generatedImage}`,
        fallbackUrl: `/api/mock-images/${generatedImage.replace('.jpg', '.svg')}`,  // SVG fallback
        prompt,
        styleValues,
        metadata: {
          width: 512,
          height: 512,
          generatedAt: new Date().toISOString(),
          model: 'Gemini-AI-NFT-Generator-v2.0'
        }
      }
    });

  } catch (error) {
    console.error('NFT generation API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate NFT'
    });
  }
}