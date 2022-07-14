import { NgModule, LOCALE_ID } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app.routing.module";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NbEvaIconsModule } from "@nebular/eva-icons";
import { NbThemeModule } from "@nebular/theme";
import { MatNativeDateModule } from "@angular/material/core";
import { NEBULAR_ROOT, NEBULAR_ALL } from "@define/nebular/nebular.module";
import { MaterialModule } from "@define/material/material.module";
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireDatabaseModule } from "@angular/fire/compat/database";
import { CoreModule } from "@core/core.module";
import { SharedModule } from "@shared/shared.module";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { DemoButtonsComponent } from "./demo-buttons/demo-buttons.component";
import { DemoFirebaseComponent } from "./demo-firebase/demo-firebase.component";
import { SmartQaEditorComponent } from "./smart-qa-editor/smart-qa-editor.component";

const firebaseConfig = {
    apiKey: "AIzaSyB5UegVWFft7JgMm-_x1OcCWSqyae86RBk",
    authDomain: "my-demo-45d3d.firebaseapp.com",
    projectId: "my-demo-45d3d",
    storageBucket: "my-demo-45d3d.appspot.com",
    messagingSenderId: "777760611121",
    appId: "1:777760611121:web:1a757fd2b3c79bbee62e10",
    measurementId: "G-SJSJSZC08Q",
};

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "../assets/i18n/", ".json");
}

@NgModule({
    declarations: [AppComponent, HomeComponent, DemoButtonsComponent, DemoFirebaseComponent, SmartQaEditorComponent],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MatNativeDateModule,
        MaterialModule,
        NbEvaIconsModule,
        NbThemeModule.forRoot(),
        ...NEBULAR_ROOT,
        ...NEBULAR_ALL,
        AngularFireDatabaseModule,
        AngularFireModule.initializeApp(firebaseConfig),
        CoreModule.forRoot(),
        SharedModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
