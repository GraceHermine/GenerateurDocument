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