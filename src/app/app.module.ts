import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { TestCaseGeneratorModule } from './components/test-case-generator/test-case-generator.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TestCaseGeneratorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 