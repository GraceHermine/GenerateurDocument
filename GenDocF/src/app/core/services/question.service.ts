import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Question, PaginatedResponse } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'documents/questions';

  getQuestions(page: number = 1, formulaireId?: number): Observable<PaginatedResponse<Question>> {
    let url = `${this.endpoint}?page=${page}`;
    if (formulaireId) {
      url += `&formulaire=${formulaireId}`;
    }
    return this.apiService.get<PaginatedResponse<Question>>(url);
  }

  getQuestion(id: number): Observable<Question> {
    return this.apiService.get<Question>(`${this.endpoint}/${id}`);
  }

  createQuestion(question: Partial<Question>): Observable<Question> {
    return this.apiService.post<Question>(this.endpoint, question);
  }

  updateQuestion(id: number, question: Partial<Question>): Observable<Question> {
    return this.apiService.put<Question>(`${this.endpoint}/${id}`, question);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getQuestionsByFormulaire(formulaireId: number): Observable<Question[]> {
    return this.apiService.get<Question[]>(`${this.endpoint}?formulaire=${formulaireId}`);
  }

  reorderQuestions(formulaireId: number, questionIds: number[]): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/reorder`, {
      formulaire: formulaireId,
      questions: questionIds
    });
  }
}