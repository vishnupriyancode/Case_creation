import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test-case-generator',
  templateUrl: './test-case-generator.component.html',
  styleUrls: ['./test-case-generator.component.css']
})
export class TestCaseGeneratorComponent {
  selectedFile: File | null = null;
  analysisResult: any = null;
  isLoading: boolean = false;
  error: string | null = null;
  testCaseCount: number = 0;
  userDomainId: string = '';
  progress: number = 0;
  showProgress: boolean = false;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.error = null;
    this.testCaseCount = 0;
    this.userDomainId = '';
  }

  async uploadAndAnalyze(): Promise<void> {
    if (!this.selectedFile) {
      this.error = 'Please select a file first';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.showProgress = true;
    this.progress = 0;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (this.progress < 90) {
          this.progress += 10;
        }
      }, 500);

      const response = await this.http.post('/api/analyze-document', formData).toPromise();
      
      clearInterval(progressInterval);
      this.progress = 100;
      
      this.analysisResult = response;
      this.testCaseCount = this.calculateTestCaseCount(response);
      this.userDomainId = this.generateUserDomainId();
      
      // Reset progress after a delay
      setTimeout(() => {
        this.showProgress = false;
        this.progress = 0;
      }, 1000);

    } catch (err) {
      this.error = 'Error analyzing document. Please try again.';
      console.error('Error:', err);
      this.showProgress = false;
      this.progress = 0;
    } finally {
      this.isLoading = false;
    }
  }

  private calculateTestCaseCount(response: any): number {
    if (!response) return 0;
    if (Array.isArray(response)) return response.length;
    if (typeof response === 'object') return Object.keys(response).length;
    return 0;
  }

  private generateUserDomainId(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `DOM_${timestamp}_${random}`;
  }
} 