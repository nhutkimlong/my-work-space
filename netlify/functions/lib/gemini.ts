import { GoogleGenerativeAI } from '@google/generative-ai';

interface DocumentAnalysis {
  category: string;
  priority: 'low' | 'medium' | 'high';
  suggestedTags: string[];
  summary: string;
  keywords: string[];
  actionItems: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  // OCR từ Google Drive link
  async extractTextFromDriveFile(driveFileUrl: string): Promise<{
    extractedText: string;
    summary: string;
    keywords: string[];
  }> {
    try {
      // Convert Google Drive share link to direct image link
      const fileId = this.extractFileIdFromUrl(driveFileUrl);
      const directImageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

      const prompt = `
        Phân tích tài liệu này và thực hiện:
        1. Trích xuất toàn bộ text từ hình ảnh (OCR)
        2. Tóm tắt nội dung chính (tối đa 200 từ)
        3. Tạo danh sách từ khóa quan trọng (5-10 từ khóa)
        
        Trả về kết quả dưới dạng JSON:
        {
          "extractedText": "...",
          "summary": "...",
          "keywords": ["keyword1", "keyword2", ...]
        }
      `;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: await this.getImageBase64(directImageUrl)
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error processing image with Gemini:', error);
      throw new Error('Failed to process image with AI');
    }
  }

  // Phân tích và phân loại tài liệu
  async analyzeDocument(text: string): Promise<DocumentAnalysis> {
    try {
      const prompt = `
        Phân tích văn bản sau và trả về thông tin dưới dạng JSON:
        
        Văn bản: "${text}"
        
        Yêu cầu phân tích:
        1. Phân loại tài liệu (category): "công văn", "báo cáo", "quyết định", "thông báo", "khác"
        2. Đánh giá độ ưu tiên (priority): "low", "medium", "high"
        3. Đề xuất tags phù hợp (suggestedTags): mảng 3-5 tags
        4. Tóm tắt nội dung (summary): 2-3 câu
        5. Từ khóa chính (keywords): mảng 5-7 từ khóa
        6. Các hành động cần thực hiện (actionItems): mảng các việc cần làm
        
        JSON format:
        {
          "category": "...",
          "priority": "...",
          "suggestedTags": ["tag1", "tag2", ...],
          "summary": "...",
          "keywords": ["keyword1", "keyword2", ...],
          "actionItems": ["action1", "action2", ...]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error('Failed to analyze document');
    }
  }

  // Tóm tắt thông minh
  async generateSummary(text: string, maxLength: number = 200): Promise<string> {
    try {
      const prompt = `
        Tóm tắt văn bản sau thành ${maxLength} từ hoặc ít hơn, tập trung vào những điểm chính:
        
        "${text}"
        
        Yêu cầu:
        - Ngắn gọn, súc tích
        - Giữ lại thông tin quan trọng nhất
        - Dùng tiếng Việt
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  // Gợi ý tối ưu hóa công việc
  async suggestWorkflowOptimization(tasks: any[]): Promise<{
    suggestions: string[];
    priorityRecommendations: Array<{
      taskId: string;
      currentPriority: string;
      suggestedPriority: string;
      reason: string;
    }>;
  }> {
    try {
      const prompt = `
        Phân tích danh sách công việc và đưa ra gợi ý tối ưu hóa:
        
        Công việc: ${JSON.stringify(tasks, null, 2)}
        
        Yêu cầu phân tích:
        1. Gợi ý tối ưu hóa quy trình (suggestions)
        2. Đề xuất điều chỉnh độ ưu tiên (priorityRecommendations)
        
        Trả về JSON format:
        {
          "suggestions": ["suggestion1", "suggestion2", ...],
          "priorityRecommendations": [
            {
              "taskId": "...",
              "currentPriority": "...",
              "suggestedPriority": "...",
              "reason": "..."
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error suggesting workflow optimization:', error);
      throw new Error('Failed to suggest workflow optimization');
    }
  }

  // Helper: Extract file ID from Google Drive URL
  private extractFileIdFromUrl(url: string): string {
    const regex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    if (match) {
      return match[1];
    }
    
    // Fallback for other URL formats
    const idRegex = /id=([a-zA-Z0-9-_]+)/;
    const idMatch = url.match(idRegex);
    if (idMatch) {
      return idMatch[1];
    }
    
    throw new Error('Invalid Google Drive URL format');
  }

  // Helper: Get image as base64 from URL
  private async getImageBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error fetching image:', error);
      throw new Error('Failed to fetch image from URL');
    }
  }
}

export const geminiService = new GeminiService(); 