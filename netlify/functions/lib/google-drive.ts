import { GoogleAuth } from 'google-auth-library';
import { drive_v3, google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

class GoogleDriveService {
  private drive: drive_v3.Drive;
  private auth: GoogleAuth;

  constructor() {
    // Khởi tạo auth với service account credentials
    this.auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
      },
      scopes: SCOPES,
    });

    this.drive = google.drive({
      version: 'v3',
      auth: this.auth,
    });
  }

  // Upload file to Google Drive
  async uploadFile(fileName: string, mimeType: string, fileBuffer: Buffer, folderId?: string) {
    try {
      const fileMetadata: any = {
        name: fileName,
      };

      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      const media = {
        mimeType: mimeType,
        body: fileBuffer,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,size,mimeType,createdTime',
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  // Get file metadata
  async getFileMetadata(fileId: string) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,webViewLink,size,mimeType,createdTime,owners,permissions',
      });

      return response.data;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  // Download file from Google Drive
  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      }, {
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }

  // Delete file from Google Drive
  async deleteFile(fileId: string) {
    try {
      await this.drive.files.delete({
        fileId: fileId,
      });

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get shareable link for file
  async getShareableLink(fileId: string) {
    try {
      // Make file publicly readable
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const file = await this.getFileMetadata(fileId);
      return file.webViewLink;
    } catch (error) {
      console.error('Error creating shareable link:', error);
      throw new Error('Failed to create shareable link');
    }
  }

  // List files in folder
  async listFiles(folderId?: string, query?: string) {
    try {
      let q = '';
      
      if (folderId) {
        q += `'${folderId}' in parents`;
      }
      
      if (query) {
        q += q ? ` and name contains '${query}'` : `name contains '${query}'`;
      }

      const response = await this.drive.files.list({
        q: q || undefined,
        fields: 'files(id,name,webViewLink,size,mimeType,createdTime)',
        orderBy: 'createdTime desc',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }
}

export const googleDriveService = new GoogleDriveService(); 