import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AbilityModule, AbilityService } from '@casl/angular';

import { createAbility, AppAbility } from '../services/AppAbility';
import { AppComponent } from './app.component';
import { TodoForm } from './todo/form.component';
import { TodoList } from './todo/list.component';
import { TodoFooter } from './todo/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    TodoForm,
    TodoList,
    TodoFooter,
  ],
  imports: [
    BrowserModule,
    AbilityModule,
    FormsModule
  ],
  providers: [
    { provide: AppAbility, useFactory: createAbility },
    AbilityService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
