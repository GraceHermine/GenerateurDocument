
export interface CategorieTemplate {
  id: number;
  nom: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateDocument {
  id: number;
  nom: string;
  categorie: number;
  categorie_nom: string;
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
}

export interface DocumentHistory {
  id: number;
  template: number;
  template_nom: string;
  // 👇 On précise les valeurs possibles pour éviter les fautes de frappe
  format: 'pdf' | 'docx' | string; 
  status: 'pending' | 'processing' | 'done' | 'completed' | 'error' | string;
  date_generation: string;
  fichier: string | null;
}