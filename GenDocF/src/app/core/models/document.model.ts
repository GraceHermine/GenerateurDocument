export interface DocumentHistory {
  id: number;
  template_nom: string;
  format: 'pdf' | 'docx';
  status: 'pending' | 'processing' | 'done' | 'error';
  date_generation: string;
  fichier: string | null;
}