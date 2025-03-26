import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { TestCaseGeneratorComponent } from './test-case-generator/test-case-generator.component';

@NgModule({
  declarations: [
    TestCaseGeneratorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [TestCaseGeneratorComponent]
})
export class AppModule { } 