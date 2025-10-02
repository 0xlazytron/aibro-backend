/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
// import { storage } from '@/lib/firebase';
import fetch from 'node-fetch';

// Function to generate image using Pollinations.ai
async function generateImageWithPollinations(prompt: string, styleValues: any): Promise<string> {
  try {
    // Create enhanced prompt based on style values
    const enhancedPrompt = createEnhancedPrompt(prompt, styleValues);
    
    // Add randomness to ensure different images on regenerate
    const randomSeed = Math.floor(Math.random() * 1000000);
    const randomVariation = Math.floor(Math.random() * 100);
    
    // Generate image using Pollinations.ai with randomness
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&model=flux&enhance=true&seed=${randomSeed}&nologo=true&private=true&variation=${randomVariation}`;
    
    console.log('Generating image with Pollinations.ai:', enhancedPrompt);
    console.log('Using random seed:', randomSeed, 'variation:', randomVariation);
    
    // For now, return the Pollinations.ai URL directly (Firebase Storage will be added later)
    console.log('Generated image with Pollinations.ai:', imageUrl);
    return imageUrl;
    
  } catch (error) {
    console.error('Error generating image with Pollinations.ai:', error);
    
    // Fallback: create a dynamic SVG image and return as data URL
     const fallbackSvg = createFallbackSvg(prompt, styleValues);
     const dataUrl = `data:image/svg+xml;base64,${Buffer.from(fallbackSvg).toString('base64')}`;
     
     console.log('Generated fallback SVG image');
     return dataUrl;
  }
}

// Function to create enhanced prompt based on style values
function createEnhancedPrompt(basePrompt: string, styleValues: any): string {
  const { realism = 50, colorTemp = 50, texture = 50, artStyle = 'modern', mood = 'vibrant' } = styleValues;
  
  let enhancedPrompt = basePrompt;
  
  // Add realism level
  if (realism > 70) {
    enhancedPrompt += ', photorealistic, highly detailed, 8k resolution';
  } else if (realism > 40) {
    enhancedPrompt += ', semi-realistic, detailed artwork';
  } else {
    enhancedPrompt += ', stylized, artistic interpretation';
  }
  
  // Add color temperature
  if (colorTemp > 60) {
    enhancedPrompt += ', warm colors, golden hour lighting';
  } else if (colorTemp < 40) {
    enhancedPrompt += ', cool colors, blue tones, moonlight';
  } else {
    enhancedPrompt += ', balanced lighting, natural colors';
  }
  
  // Add texture
  if (texture > 60) {
    enhancedPrompt += ', highly textured, detailed surface, intricate patterns';
  } else if (texture < 40) {
    enhancedPrompt += ', smooth, clean, minimalist';
  }
  
  // Add art style
  enhancedPrompt += `, ${artStyle} art style`;
  
  // Add mood
  enhancedPrompt += `, ${mood} atmosphere`;
  
  // Add quality enhancers
  enhancedPrompt += ', masterpiece, best quality, professional artwork';
  
  return enhancedPrompt;
}

// Fallback function to create SVG when AI generation fails
function createFallbackSvg(prompt: string, styleValues: any): string {
  const { realism = 50, colorTemp = 50, texture = 50 } = styleValues;
  
  // Generate colors based on style values
  const colors = generateColorsFromStyle(colorTemp, realism);
  const complexity = texture > 60 ? 'high' : texture > 30 ? 'medium' : 'low';
  
  // Generate shapes based on prompt keywords
  const shapes = generateShapesFromPrompt(prompt, colors, complexity);
  
  const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)" />
  ${shapes}
  <text x="256" y="480" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" opacity="0.7">
    AI Generated: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}
  </text>
</svg>`;

  return svg;
}

function generateColorsFromStyle(colorTemp: number, realism: number): string[] {
  if (colorTemp > 60) {
    // Warm colors
    return ['#FF6B6B', '#FF8E53', '#FF6B9D'];
  } else if (colorTemp < 40) {
    // Cool colors
    return ['#4ECDC4', '#45B7D1', '#96CEB4'];
  } else {
    // Balanced colors
    return ['#FECA57', '#48CAE4', '#FF6B6B'];
  }
}

function generateShapesFromPrompt(prompt: string, colors: string[], complexity: string): string {
  const shapes = [];
  const numShapes = complexity === 'high' ? 8 : complexity === 'medium' ? 5 : 3;
  
  for (let i = 0; i < numShapes; i++) {
    const x = Math.random() * 400 + 56;
    const y = Math.random() * 400 + 56;
    const size = Math.random() * 60 + 20;
    const color = colors[i % colors.length];
    const opacity = Math.random() * 0.6 + 0.3;
    
    if (prompt.toLowerCase().includes('robot') || prompt.toLowerCase().includes('tech')) {
      shapes.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}" opacity="${opacity}" transform="rotate(${Math.random() * 45} ${x + size/2} ${y + size/2})" />`);
    } else if (prompt.toLowerCase().includes('nature') || prompt.toLowerCase().includes('organic')) {
      shapes.push(`<circle cx="${x}" cy="${y}" r="${size/2}" fill="${color}" opacity="${opacity}" />`);
    } else {
      shapes.push(createStar(x, y, size/2, color, opacity));
    }
  }
  
  return shapes.join('\n  ');
}

function createStar(cx: number, cy: number, r: number, color: string, opacity: number): string {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : r * 0.5;
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
    const { prompt, styleValues } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate image using Pollinations.ai and upload to Firebase Storage
    console.log('Generating NFT with prompt:', prompt);
    const imageUrl = await generateImageWithPollinations(prompt, styleValues || {});

    // Generate a unique ID for this generation
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return the generated NFT data
    return res.status(200).json({
      success: true,
      data: {
        id: generationId,
        imageUrl: imageUrl,
        prompt,
        styleValues,
        metadata: {
          width: 512,
          height: 512,
          generatedAt: new Date().toISOString(),
          model: 'Pollinations-AI-NFT-Generator-v2.0',
          source: 'pollinations.ai'
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