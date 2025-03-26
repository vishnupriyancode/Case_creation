import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TestCaseGeneratorComponent } from './test-case-generator.component';

@NgModule({
  declarations: [
    TestCaseGeneratorComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [
    TestCaseGeneratorComponent
  ]
})
export class TestCaseGeneratorModule { } 