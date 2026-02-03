# 🚀 Guide d'Intégration Frontend

## État du Backend

✅ **Backend Django REST opérationnel**

### URLs de l'API

**Base URL :** `http://localhost:8000/api/`

#### Endpoints Documents
- `POST /documents/generate/` - Générer un document
- `GET /documents/` - Lister les documents de l'utilisateur
- `GET /documents/{uuid}/` - Détails d'un document
- `GET /documents/{uuid}/download/` - Télécharger le fichier

#### Endpoints Templates
- `GET /templates/categories/` - Lister les catégories
- `GET /templates/templates/` - Lister les templates
- `GET /templates/templates/{id}/` - Détails d'un template
- `GET /templates/templates/{id}/schema/` - Schéma du formulaire
- `GET /templates/versions/` - Lister les versions

#### Authentication
- `POST /auth/token/` - Obtenir JWT token
- `POST /auth/token/refresh/` - Rafraîchir token

---

## 📋 Services Angular à créer

### 1. Service d'Authentification

**File:** `src/app/core/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth';
  private tokenSubject = new BehaviorSubject<string | null>(this.getTokenFromStorage());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/token/`, {
      username,
      password
    }).pipe(
      tap(response => {
        this.setToken(response.access);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.tokenSubject.next(null);
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  refreshToken(refreshToken: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        this.setToken(response.access);
      })
    );
  }
}
```

### 2. Service Templates

**File:** `src/app/core/services/template.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  subcategories_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateVersion {
  id: number;
  template: number;
  version_number: number;
  source_file: string;
  source_file_url: string;
  input_schema: any;
  preview_image: string | null;
  preview_image_url: string | null;
  is_active: boolean;
  change_log: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: number;
  uuid: string;
  title: string;
  category: number;
  category_name: string;
  description: string;
  engine: string;
  is_active: boolean;
  current_version: TemplateVersion;
  versions_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateSchema {
  template_id: number;
  template_title: string;
  version_number: number;
  input_schema: any;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = 'http://localhost:8000/api/templates';

  constructor(private http: HttpClient) {}

  // Catégories
  getCategories(params?: any): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.apiUrl}/categories/`,
      { params }
    );
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}/`);
  }

  // Templates
  getTemplates(filters?: {
    category?: number;
    engine?: string;
    search?: string;
    is_active?: boolean;
  }): Observable<Template[]> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.engine) params = params.set('engine', filters.engine);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.is_active !== undefined) params = params.set('is_active', filters.is_active);

    return this.http.get<Template[]>(`${this.apiUrl}/templates/`, { params });
  }

  getTemplate(id: number): Observable<Template> {
    return this.http.get<Template>(`${this.apiUrl}/templates/${id}/`);
  }

  getTemplateSchema(id: number): Observable<TemplateSchema> {
    return this.http.get<TemplateSchema>(
      `${this.apiUrl}/templates/${id}/schema/`
    );
  }

  getTemplateVersions(id: number): Observable<TemplateVersion[]> {
    return this.http.get<TemplateVersion[]>(
      `${this.apiUrl}/templates/${id}/versions/`
    );
  }

  // Versions
  getVersions(filters?: { template?: number; is_active?: boolean }): Observable<TemplateVersion[]> {
    let params = new HttpParams();
    if (filters?.template) params = params.set('template', filters.template);
    if (filters?.is_active !== undefined) params = params.set('is_active', filters.is_active);

    return this.http.get<TemplateVersion[]>(`${this.apiUrl}/versions/`, { params });
  }

  getVersion(id: number): Observable<TemplateVersion> {
    return this.http.get<TemplateVersion>(`${this.apiUrl}/versions/${id}/`);
  }
}
```

### 3. Service Documents

**File:** `src/app/core/services/document.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Document {
  uuid: string;
  user: number;
  template_version: number;
  input_data: any;
  output_file: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error_log: string;
  created_at: string;
  completed_at: string | null;
  filename: string;
  file_url: string | null;
}

export interface GenerateDocumentRequest {
  template_version: number;
  input_data: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8000/api/documents';

  constructor(private http: HttpClient) {}

  // Générer un document
  generateDocument(request: GenerateDocumentRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/generate/`, request, {
      responseType: 'blob'
    });
  }

  // Lister les documents de l'utilisateur
  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/`);
  }

  // Détails d'un document
  getDocument(uuid: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${uuid}/`);
  }

  // Télécharger un document
  downloadDocument(uuid: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${uuid}/download/`, {
      responseType: 'blob'
    });
  }

  // Obtenir le statut d'un document
  getDocumentStatus(uuid: string): Observable<{ status: string; completed_at: string | null }> {
    return this.http.get<{ status: string; completed_at: string | null }>(
      `${this.apiUrl}/${uuid}/status/`
    );
  }

  // Supprimer un document
  deleteDocument(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}/`);
  }

  // Utility: Sauvegarder le blob en fichier
  saveFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
```

---

## 🔐 Interceptor JWT

**File:** `src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token && request.url.includes('localhost:8000')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request);
  }
}
```

**Enregistrer dans app.config.ts :**

```typescript
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        // Enregistrer l'interceptor ici pour Angular 17+
      ])
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // ... autres providers
  ],
};
```

---

## 📝 Exemple d'Utilisation dans un Component

**File:** `src/app/features/user/document-generation/document-generation.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateService, TemplateSchema } from '../../../core/services/template.service';
import { DocumentService } from '../../../core/services/document.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-document-generation',
  templateUrl: './document-generation.component.html',
  styleUrls: ['./document-generation.component.scss']
})
export class DocumentGenerationComponent implements OnInit {
  templateId: number;
  templateSchema: TemplateSchema;
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  generatedFileName: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private documentService: DocumentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.templateId = +this.route.snapshot.paramMap.get('id');
    this.loadTemplateSchema();
  }

  loadTemplateSchema(): void {
    this.loading = true;
    this.templateService.getTemplateSchema(this.templateId).subscribe({
      next: (schema) => {
        this.templateSchema = schema;
        this.buildDynamicForm(schema.input_schema);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Impossible de charger le template';
        this.loading = false;
      }
    });
  }

  buildDynamicForm(schema: any): void {
    const formControls: any = {};

    if (schema.fields && Array.isArray(schema.fields)) {
      schema.fields.forEach((field: any) => {
        const validators = [];
        if (field.required) validators.push(Validators.required);
        if (field.type === 'email') validators.push(Validators.email);
        if (field.min !== undefined) validators.push(Validators.min(field.min));
        if (field.max !== undefined) validators.push(Validators.max(field.max));

        formControls[field.name] = ['', validators];
      });
    }

    this.form = this.fb.group(formControls);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const request = {
      template_version: this.templateSchema.version_number,
      input_data: this.form.value
    };

    this.documentService.generateDocument(request).subscribe({
      next: (blob) => {
        // Générer le nom de fichier
        const ext = this.templateSchema.input_schema.output_format || 'docx';
        this.generatedFileName = `${this.templateSchema.template_title}_${new Date().getTime()}.${ext}`;

        // Télécharger le fichier
        this.documentService.saveFile(blob, this.generatedFileName);

        this.success = true;
        this.loading = false;

        // Rediriger après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/user/documents']);
        }, 3000);
      },
      error: (error) => {
        this.error = error.error?.error || 'Erreur lors de la génération du document';
        this.loading = false;
      }
    });
  }
}
```

**Template HTML :**

```html
<div class="document-generation-container">
  <h1>Générer un document</h1>

  <div *ngIf="loading" class="spinner">
    Chargement en cours...
  </div>

  <div *ngIf="error" class="alert alert-danger">
    {{ error }}
  </div>

  <div *ngIf="success" class="alert alert-success">
    Document généré avec succès ! {{ generatedFileName }}
    Redirection en cours...
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="templateSchema && !success">
    <div *ngFor="let field of templateSchema.input_schema.fields" class="form-group">
      <label [for]="field.name">
        {{ field.label }}
        <span *ngIf="field.required" class="required">*</span>
      </label>
      <input
        [id]="field.name"
        [type]="field.type || 'text'"
        [formControlName]="field.name"
        [placeholder]="field.placeholder || ''"
        class="form-control"
      />
      <small *ngIf="form.get(field.name)?.invalid" class="text-danger">
        Ce champ est obligatoire
      </small>
    </div>

    <button type="submit" [disabled]="form.invalid || loading" class="btn btn-primary">
      <span *ngIf="!loading">Générer le document</span>
      <span *ngIf="loading">Génération en cours...</span>
    </button>
  </form>
</div>
```

---

## 🔄 Flux Complet

### 1. Authentification
```
User → Frontend (login form) → Backend (/api/auth/token/) → JWT Token → localStorage
```

### 2. Lister Templates
```
Frontend → GET /api/templates/templates/ → Liste affichée
```

### 3. Génération Document
```
User sélectionne template
  ↓
Frontend → GET /api/templates/templates/{id}/schema/ → Récupère schéma
  ↓
Frontend affiche formulaire dynamique basé sur schema
  ↓
User remplit formulaire
  ↓
Frontend → POST /api/documents/generate/ + input_data → File blob
  ↓
Frontend télécharge le fichier
```

---

## ⚙️ Configuration CORS

Le backend a CORS activé pour tous les domaines. Pour la production, modifiez `settings.py` :

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",  # Dev Angular
    "https://yourdomain.com",  # Production
]
```

---

## 📦 Dépendances Frontend

```bash
npm install @angular/common @angular/forms @angular/router
npm install axios  # Optional, si vous préférez à HttpClient
```

---

## 🧪 Tests avec Swagger

Avant d'intégrer au frontend, testez tous les endpoints dans Swagger :

**http://localhost:8000/api/docs/**

1. Obtenir un token JWT
2. Tester GET /templates/
3. Tester GET /templates/{id}/schema/
4. Tester POST /documents/generate/

---

## 📋 Checklist Intégration

- [ ] Service AuthService créé
- [ ] Service TemplateService créé
- [ ] Service DocumentService créé
- [ ] AuthInterceptor implémenté
- [ ] Component de génération créé
- [ ] Formulaire dynamique fonctionnel
- [ ] Téléchargement de fichier fonctionnel
- [ ] Gestion d'erreurs complète
- [ ] Tests dans Swagger validés

---

## 🚀 Démarrage

1. Backend : `python manage.py runserver` (port 8000)
2. Frontend : `ng serve` (port 4200)
3. Accédez à : http://localhost:4200
4. Swagger : http://localhost:8000/api/docs/
