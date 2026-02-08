// dynamic-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateService } from '../../../core/services/template.service';
import { FormulaireService } from '../../../core/services/formulaire.service';
import { QuestionService } from '../../../core/services/question.service';
import { DocumentGenereService } from '../../../core/services/document-genere.service';
import { ReponseService } from '../../../core/services/reponse.service';
import { DocumentGenere } from '../../../core/models/document.model';

@Component({
  selector: 'app-dynamic-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss'
})
export class DynamicForm implements OnInit {
  templateId: number;
  template: any = null;
  questions: any[] = [];
  formulaireId: number | null = null;
  
  // Réponses utilisateur
  responses: any = {};
  
  // Progression
  progress = 0;
  
  // Options pour les types de questions
  questionTypes = {
    'text': 'Texte',
    'number': 'Nombre',
    'date': 'Date',
    'choice': 'Choix unique',
    'multiple_choice': 'Choix multiple'
  };

  // Variables pour le formulaire
  documentTitle = '';
  outputFormat = 'pdf';
  includeWatermark = false;
  sendEmail = false;
  saveAsTemplate = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private formulaireService: FormulaireService,
    private questionService: QuestionService,
    private documentService: DocumentGenereService,
    private reponseService: ReponseService
  ) {
    this.templateId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadTemplate();
    this.loadFormData();
    // Initialiser le titre du document
    this.documentTitle = `Document ${new Date().toLocaleDateString()}`;
  }

  loadTemplate(): void {
    this.templateService.getTemplate(this.templateId)
      .subscribe({
        next: (template) => {
          this.template = template;
          // Mettre à jour le titre avec le nom du template
          if (template.titre) {
            this.documentTitle = template.titre;
          }
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
  }

  loadFormData(): void {
    this.formulaireService.getFormulairesByTemplate(this.templateId)
      .subscribe({
        next: (formulaires) => {
          if (formulaires.length > 0) {
            this.formulaireId = formulaires[0].id;
            this.loadQuestions(formulaires[0].id);
          }
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
  }

  loadQuestions(formulaireId: number): void {
    this.questionService.getQuestionsByFormulaire(formulaireId)
      .subscribe({
        next: (questions) => {
          // Trier par ordre
          this.questions = questions.sort((a, b) => a.ordre - b.ordre);
          this.updateProgress();
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
  }

  updateProgress(): void {
    if (this.questions.length === 0) {
      this.progress = 0;
      return;
    }
    
    const answered = this.questions.filter(q => {
      const response = this.responses[q.id];
      return response !== undefined && response !== null && response !== '';
    }).length;
    
    this.progress = Math.round((answered / this.questions.length) * 100);
  }

  onResponseChange(questionId: number): void {
    this.updateProgress();
  }

  generateDocument(): void {
    if (!this.isFormValid()) {
      alert('Veuillez remplir toutes les questions obligatoires');
      return;
    }

    // 1. Créer le document
    const newDocument: Partial<DocumentGenere> = {
      template: this.templateId,
      titre: this.documentTitle || `Document ${this.template?.titre || 'Généré'}`,
      statut: 'brouillon',
      contenu_final: '',
      // Ne pas inclure formulaire s'il est null
      ...(this.formulaireId && { formulaire: this.formulaireId })
    };

    this.documentService.createDocument(newDocument)
      .subscribe({
        next: (document) => {
          // 2. Enregistrer les réponses
          const reponsesArray = Object.keys(this.responses)
            .filter(questionId => this.responses[questionId]) // Filtrer les réponses vides
            .map(questionId => ({
              document_genere: document.id,
              question: Number(questionId),
              reponse: this.responses[questionId]
            }));

          if (reponsesArray.length > 0) {
            this.reponseService.createMultipleReponses(reponsesArray)
              .subscribe({
                next: () => {
                  // 3. Finaliser le document
                  this.documentService.finaliserDocument(document.id)
                    .subscribe({
                      next: (finalizedDoc) => {
                        // 4. Rediriger vers le résultat
                        this.router.navigate(['/generation-result', finalizedDoc.id]);
                      },
                      error: (error) => {
                        console.error('Erreur lors de la finalisation:', error);
                        alert('Erreur lors de la finalisation du document');
                      }
                    });
                },
                error: (error) => {
                  console.error('Erreur lors de l\'enregistrement des réponses:', error);
                  alert('Erreur lors de l\'enregistrement des réponses');
                }
              });
          } else {
            // Aucune réponse, finaliser quand même
            this.documentService.finaliserDocument(document.id)
              .subscribe({
                next: (finalizedDoc) => {
                  this.router.navigate(['/generation-result', finalizedDoc.id]);
                },
                error: (error) => {
                  console.error('Erreur:', error);
                  alert('Erreur lors de la finalisation');
                }
              });
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création du document:', error);
          alert('Erreur lors de la création du document');
        }
      });
  }

  saveAsDraft(): void {
    const newDocument: Partial<DocumentGenere> = {
      template: this.templateId,
      titre: this.documentTitle || 'Brouillon',
      statut: 'brouillon',
      contenu_final: '',
      ...(this.formulaireId && { formulaire: this.formulaireId })
    };

    this.documentService.createDocument(newDocument)
      .subscribe({
        next: (document) => {
          if (Object.keys(this.responses).length > 0) {
            const reponsesArray = Object.keys(this.responses)
              .filter(questionId => this.responses[questionId])
              .map(questionId => ({
                document_genere: document.id,
                question: Number(questionId),
                reponse: this.responses[questionId]
              }));

            this.reponseService.createMultipleReponses(reponsesArray)
              .subscribe({
                next: () => {
                  alert('Document enregistré comme brouillon');
                  this.router.navigate(['/documents']);
                },
                error: (error) => {
                  console.error('Erreur:', error);
                  alert('Document créé mais erreur lors de l\'enregistrement des réponses');
                }
              });
          } else {
            alert('Document enregistré comme brouillon');
            this.router.navigate(['/documents']);
          }
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la création du brouillon');
        }
      });
  }

  cancelForm(): void {
    if (confirm('Annuler ce formulaire ? Les données seront perdues.')) {
      this.router.navigate(['/templates']);
    }
  }

  // Méthodes utilitaires
  getQuestionTypeLabel(type: string): string {
    return this.questionTypes[type as keyof typeof this.questionTypes] || type;
  }

  isFormValid(): boolean {
    // Vérifier si toutes les questions obligatoires sont remplies
    const requiredQuestions = this.questions.filter(q => q.obligatoire);
    return requiredQuestions.every(q => {
      const response = this.responses[q.id];
      return response !== undefined && response !== null && response !== '';
    });
  }

  getAnsweredCount(): number {
    return this.questions.filter(q => {
      const response = this.responses[q.id];
      return response !== undefined && response !== null && response !== '';
    }).length;
  }

  isOptionSelected(questionId: number, option: string): boolean {
    const response = this.responses[questionId];
    if (!response || typeof response !== 'string') return false;
    
    // Pour les choix multiples, on peut stocker les options séparées par des virgules
    return response.split(',').includes(option);
  }

  // dynamic-form.component.ts - Section corrigée
  toggleMultipleChoice(questionId: number, option: string): void {
    const currentResponse = this.responses[questionId] || '';
    const options = currentResponse ? currentResponse.split(',') : [];
    
    if (options.includes(option)) {
      // Retirer l'option
      const newOptions = options.filter((o: string) => o !== option);
      this.responses[questionId] = newOptions.join(',');
    } else {
      // Ajouter l'option
      options.push(option);
      this.responses[questionId] = options.join(',');
    }
    
    this.onResponseChange(questionId);
  }

  // Méthode pour générer le contenu final (si nécessaire)
  generateContent(): string {
    let content = `<h1>${this.documentTitle}</h1>`;
    content += `<p>Document généré le ${new Date().toLocaleDateString()}</p>`;
    content += '<hr>';
    
    this.questions.forEach((question, index) => {
      const response = this.responses[question.id];
      if (response) {
        content += `<h3>${question.texte}</h3>`;
        content += `<p><strong>Réponse:</strong> ${response}</p>`;
      }
    });
    
    return content;
  }
}