import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateService } from '../../../core/services/template.service';
import { FormulaireService } from '../../../core/services/formulaire.service';
import { DocumentGenereService } from '../../../core/services/document-genere.service';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss'
})
export class DynamicForm implements OnInit {
  templateId: number;
  template: any = null;
  questions: any[] = [];
  formulaireId: number | null = null;
  
  responses: any = {};
  progress = 0;
  isStepPreview = false; // Bascule entre formulaire et aperçu
  today = new Date();
  showFormatModal = false; // Contrôle l'affichage de la modale de choix
  isGenerating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private formulaireService: FormulaireService,
    private documentService: DocumentGenereService
  ) {
    this.templateId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadTemplate();
    this.loadFormData();
  }

  loadTemplate(): void {
    this.templateService.getTemplate(this.templateId).subscribe({
      next: (t) => {
        this.template = t;
      },
      error: (err) => console.error('Erreur template:', err)
    });
  }

  loadFormData(): void {
    this.formulaireService.getFormulairesByTemplate(this.templateId).subscribe({
      next: (response: any) => {
        const formulaires = response.results || response;
        if (formulaires && formulaires.length > 0) {
          const form = formulaires[0];
          this.formulaireId = form.id;
          this.questions = form.questions || [];
          this.updateProgress();
        }
      }
    });
  }

  // Détermine le type de design à afficher dans l'aperçu
  getTemplateType(): string {
    const nom = (this.template?.nom || '').toLowerCase();
    if (nom.includes('lettre')) return 'lettre';
    if (nom.includes('cv') || nom.includes('curriculum')) return 'cv';
    return 'default';
  }

  // Récupère une valeur de réponse en cherchant par le texte du label
  getVal(labelPart: string): string {
    const q = this.questions.find(item => 
      item.label.toLowerCase().includes(labelPart.toLowerCase())
    );
    return q ? (this.responses[q.id] || '') : '';
  }

  updateProgress(): void {
    if (this.questions.length === 0) return;
    const answered = this.questions.filter(q => this.responses[q.id]).length;
    this.progress = Math.round((answered / this.questions.length) * 100);
  }

  onResponseChange(): void {
    this.updateProgress();
  }

  isFormValid(): boolean {
    return this.questions
      .filter(q => q.obligatoire)
      .every(q => this.responses[q.id] && this.responses[q.id] !== '');
  }

  goToPreview(): void {
    if (this.isFormValid()) {
      this.isStepPreview = true;
      window.scrollTo(0, 0);
    }
  }

  openDownloadOptions() {
    this.showFormatModal = true;
  }

  // Cette fonction lance la génération avec le format choisi
 // dynamic-form.ts

  generateDocument(format: 'pdf' | 'docx') {
    this.showFormatModal = false;
    this.isGenerating = true;

    const payload = {
      template: this.templateId,
      format: format,
      reponses: Object.keys(this.responses).map(id => ({
        question: Number(id),
        valeur: String(this.responses[id])
      }))
    };

    this.documentService.createDocument(payload as any).subscribe({
      next: (res: any) => {
        // 1. Lancer le téléchargement automatique
        this.documentService.downloadDocument(res.id).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `document_${res.id}.${format}`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            // 2. Aller vers la page de félicitations
            this.isGenerating = false;
            this.router.navigate(['/generation-result', res.id]);
          },
          error: (err) => {
            console.error("Erreur de téléchargement, mais on avance quand même", err);
            this.isGenerating = false;
            this.router.navigate(['/generation-result', res.id]);
          }
        });
      },
      error: (err) => {
        this.isGenerating = false;
        alert("Erreur lors de la création du document.");
      }
    });
  }

  cancelForm(): void {
    this.router.navigate(['/templates']);
  }
}