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

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.error = null;
  }

  async uploadAndAnalyze(): Promise<void> {
    if (!this.selectedFile) {
      this.error = 'Please select a file first';
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    try {
      const response = await this.http.post('/api/analyze-document', formData).toPromise();
      this.analysisResult = response;
    } catch (err) {
      this.error = 'Error analyzing document. Please try again.';
      console.error('Error:', err);
    } finally {
      this.isLoading = false;
    }
  }
} 