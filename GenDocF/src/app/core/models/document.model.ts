<<<<<<< HEAD
export interface CategorieTemplate {
  id: number;
  nom: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateDocument {
  id: number;
  titre: string;
  categorie: number;
  categorie_details?: CategorieTemplate;
  contenu: string;
  variables?: string[];
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: number;
  formulaire: number;
  texte: string;
  type_question: 'text' | 'number' | 'date' | 'choice' | 'multiple_choice';
  ordre: number;
  obligatoire: boolean;
  options?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Formulaire {
  id: number;
  template: number;
  template_details?: TemplateDocument;
  titre: string;
  description?: string;
  questions?: Question[];
  created_at?: string;
  updated_at?: string;
}

export interface ReponseQuestion {
  id: number;
  document_genere: number;
  question: number;
  question_details?: Question;
  reponse: string;
  created_at?: string;
}

export interface DocumentGenere {
  id: number;
  template: number;
  template_details?: TemplateDocument;
  formulaire?: number;
  formulaire_details?: Formulaire;
  titre: string;
  contenu_final: string;
  reponses?: ReponseQuestion[];
  statut: 'brouillon' | 'finalise' | 'archive';
  created_at?: string;
  updated_at?: string;
}

// Interfaces pour les réponses paginées de l'API
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
=======
export interface DocumentHistory {
  id: number;
  template_nom: string;
  format: 'pdf' | 'docx';
  status: 'pending' | 'processing' | 'done' | 'error';
  date_generation: string;
  fichier: string | null;
>>>>>>> ebbfb2a6c04bf9e3ea352244f444ff87e7aa8d06
}