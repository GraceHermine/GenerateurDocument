import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateService } from '../../../core/services/template.service';
import { FormulaireService } from '../../../core/services/formulaire.service';
import { DocumentGenereService } from '../../../core/services/document-genere.service';
import { Question } from '../../../core/models/document.model'; // Import ajouté

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
  questions: Question[] = []; // Typage strict
  formulaireId: number | null = null;
  
  responses: any = {};
  progress = 0;
  isStepPreview = false;
  today = new Date();
  showFormatModal = false;
  isGenerating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private formulaireService: FormulaireService,
    private documentService: DocumentGenereService,
    private cdr: ChangeDetectorRef // Injection CDR
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
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => console.error('Erreur template:', err)
    });
  }

  loadFormData(): void {
    console.log('[DEBUG] Loading forms for templateId:', this.templateId);
    this.formulaireService.getFormulairesByTemplate(this.templateId).subscribe({
      next: (response: any) => {
        const formulaires = response.results || response;
        
        if (formulaires && formulaires.length > 0) {
          const form = formulaires.find((f: any) => f.template === this.templateId) || formulaires[0];

          this.formulaireId = form.id;
          this.questions = form.questions || [];
          console.log('[DEBUG] Questions loaded:', this.questions.length);
          
          this.updateProgress();
          this.cdr.detectChanges(); // Force update
        }
      },
      error: (err) => {
        console.error('[DEBUG] API Error:', err);
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
    const requiredQuestions = this.questions.filter(q => q.obligatoire);
    const answeredCount = requiredQuestions.filter(q => this.responses[q.id] && this.responses[q.id] !== '').length;
    // Permettre de continuer si au moins 1 réponse est fournie
    return answeredCount > 0;
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
      reponses: Object.keys(this.responses).map(id => {
        let valeur = this.responses[id];
        const question = this.questions.find(q => q.id === Number(id));

        // Si c'est une date et qu'elle est remplie, on la reformate
        if (question?.type_champ === 'date' && valeur) {
          const d = new Date(valeur);
          if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear(); // Ou d.getFullYear().toString().substr(-2) pour AA
            valeur = `${day}/${month}/${year}`;
          }
        }

        return {
          question: Number(id),
          valeur: String(valeur)
        };
      })
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
            this.router.navigate(['/user/generation-result', res.id]);
          },
          error: (err) => {
            console.error("Erreur de téléchargement, mais on avance quand même", err);
            this.isGenerating = false;
            this.router.navigate(['/user/generation-result', res.id]);
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
    this.router.navigate(['/user/templates-list']);
  }
}