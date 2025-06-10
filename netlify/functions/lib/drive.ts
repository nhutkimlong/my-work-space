import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  size: number
}

interface UploadFileParams {
  name: string
  mimeType: string
  content: string | Buffer
  parents?: string[]
}

class DriveService {
  private drive: any
  private jwt: JWT

  constructor() {
    this.jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    })

    this.drive = google.drive({ version: 'v3', auth: this.jwt })
  }

  async uploadFile({ name, mimeType, content, parents }: UploadFileParams): Promise<DriveFile> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name,
          mimeType,
          parents
        },
        media: {
          mimeType,
          body: content
        },
        fields: 'id, name, mimeType, webViewLink, size'
      })

      return response.data
    } catch (error) {
      console.error('Error uploading file to Drive:', error)
      throw new Error('Failed to upload file to Google Drive')
    }
  }

  async extractText(fileId: string): Promise<{ extractedText: string }> {
    try {
      const response = await this.drive.files.export({
        fileId,
        mimeType: 'text/plain'
      })

      return {
        extractedText: response.data
      }
    } catch (error) {
      console.error('Error extracting text from Drive file:', error)
      throw new Error('Failed to extract text from file')
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId
      })
    } catch (error) {
      console.error('Error deleting file from Drive:', error)
      throw new Error('Failed to delete file from Google Drive')
    }
  }

  async getFileMetadata(fileId: string): Promise<DriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, webViewLink, size'
      })

      return response.data
    } catch (error) {
      console.error('Error getting file metadata:', error)
      throw new Error('Failed to get file metadata')
    }
  }
}

export const driveService = new DriveService() 