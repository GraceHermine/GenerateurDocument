from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
from django.db import models

import os
import tempfile
from docx import Document
from docx2pdf import convert
import platform

from .models import (
    CategorieTemplate, TemplateDocument, Formulaire,
    Question, TypeDocument, DocumentGenere, ReponseQuestion
)
from .serializers import (
    CategorieTemplateSerializer, TemplateDocumentListSerializer,
    TemplateDocumentDetailSerializer, FormulaireSerializer,
    QuestionSerializer, TypeDocumentSerializer,
    DocumentGenereListSerializer, DocumentGenereDetailSerializer,
    DocumentGenereCreateSerializer, ReponseQuestionSerializer
)


class CategorieTemplateViewSet(viewsets.GenericViewSet,
                               viewsets.mixins.ListModelMixin,
                               viewsets.mixins.RetrieveModelMixin,
                               viewsets.mixins.CreateModelMixin):

    queryset = CategorieTemplate.objects.all()
    serializer_class = CategorieTemplateSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'id']
    ordering = ['nom']

    @action(detail=True, methods=['get'])
    def templates(self, request, pk=None):
        """Récupération de tous les templates d'une catégorie"""
        categorie = self.get_object()
        templates = categorie.templates.filter(status=True)
        serializer = TemplateDocumentListSerializer(templates, many=True)
        return Response(serializer.data)


class TemplateDocumentViewSet(viewsets.GenericViewSet,
                              viewsets.mixins.ListModelMixin,
                              viewsets.mixins.RetrieveModelMixin,
                              viewsets.mixins.CreateModelMixin):

    queryset = TemplateDocument.objects.select_related('categorie').prefetch_related(
        'formulaires__questions'
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie', 'status']
    search_fields = ['nom']
    ordering_fields = ['nom', 'date_add']
    ordering = ['-date_add']

    def get_serializer_class(self):
        """Utilisation des différents serializers selon l'action"""
        if self.action == 'retrieve':
            return TemplateDocumentDetailSerializer
        return TemplateDocumentListSerializer

    @action(detail=True, methods=['get'])
    def formulaires(self, request, pk=None):
        """Récupération de tous les formulaires d'un template"""
        template = self.get_object()
        formulaires = template.formulaires.all()
        serializer = FormulaireSerializer(formulaires, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def actifs(self, request):
        """Récupération des templates actifs"""
        templates = self.queryset.filter(status=True)
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)


class FormulaireViewSet(viewsets.GenericViewSet,
                        viewsets.mixins.ListModelMixin,
                        viewsets.mixins.RetrieveModelMixin,
                        viewsets.mixins.CreateModelMixin):

    queryset = Formulaire.objects.select_related('template').prefetch_related('questions')
    serializer_class = FormulaireSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['template']
    search_fields = ['titre']
    ordering_fields = ['titre', 'date_add']
    ordering = ['-date_add']


class QuestionViewSet(viewsets.GenericViewSet,
                      viewsets.mixins.ListModelMixin,
                      viewsets.mixins.RetrieveModelMixin,
                      viewsets.mixins.CreateModelMixin):

    queryset = Question.objects.select_related('formulaire')
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['formulaire', 'type_champ', 'obligatoire']
    ordering_fields = ['id']
    ordering = ['id']


class TypeDocumentViewSet(viewsets.GenericViewSet,
                          viewsets.mixins.ListModelMixin,
                          viewsets.mixins.RetrieveModelMixin,
                          viewsets.mixins.CreateModelMixin):

    queryset = TypeDocument.objects.all()
    serializer_class = TypeDocumentSerializer
    filter_backends = [filters.OrderingFilter]
    filterset_fields = ['status']
    ordering = ['nom']


class DocumentGenereViewSet(viewsets.GenericViewSet,
                            viewsets.mixins.ListModelMixin,
                            viewsets.mixins.RetrieveModelMixin,
                            viewsets.mixins.CreateModelMixin):

    queryset = DocumentGenere.objects.select_related('template').prefetch_related(
        'reponses__question'
    )
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['template', 'format', 'status']
    ordering_fields = ['date_generation']
    ordering = ['-date_generation']

    def get_serializer_class(self):
        """Utilisation des différents serializers selon l'action"""
        if self.action == 'create':
            return DocumentGenereCreateSerializer
        elif self.action == 'retrieve':
            return DocumentGenereDetailSerializer
        return DocumentGenereListSerializer

    def _generer_document_pdf(self, document):

        try:
            template_path = document.template.fichier.path

            doc = Document(template_path)

            reponses = ReponseQuestion.objects.filter(document=document).select_related('question')

            replacements = {
                f"{{{reponse.question.variable}}}": reponse.valeur
                for reponse in reponses
            }

            for paragraph in doc.paragraphs:
                for variable, valeur in replacements.items():
                    if variable in paragraph.text:
                        for run in paragraph.runs:
                            if variable in run.text:
                                run.text = run.text.replace(variable, valeur)

            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        for paragraph in cell.paragraphs:
                            for variable, valeur in replacements.items():
                                if variable in paragraph.text:
                                    for run in paragraph.runs:
                                        if variable in run.text:
                                            run.text = run.text.replace(variable, valeur)

            temp_docx = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
            temp_docx_path = temp_docx.name
            temp_docx.close()

            doc.save(temp_docx_path)

            temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_pdf_path = temp_pdf.name
            temp_pdf.close()

            try:
                convert(temp_docx_path, temp_pdf_path)
            except Exception as e:
                if platform.system() in ['Linux', 'Darwin']:
                    import subprocess
                    subprocess.run([
                        'libreoffice',
                        '--headless',
                        '--convert-to',
                        'pdf',
                        '--outdir',
                        os.path.dirname(temp_pdf_path),
                        temp_docx_path
                    ], check=True)

                    generated_pdf = temp_docx_path.replace('.docx', '.pdf')
                    if os.path.exists(generated_pdf):
                        os.rename(generated_pdf, temp_pdf_path)
                else:
                    raise e

            with open(temp_pdf_path, 'rb') as pdf_file:
                pdf_content = pdf_file.read()

            filename = f"document_{document.id}_{document.template.nom.replace(' ', '_')}.pdf"
            document.fichier.save(filename, ContentFile(pdf_content), save=False)
            document.status = 'done'
            document.save()

            try:
                os.unlink(temp_docx_path)
                os.unlink(temp_pdf_path)
            except:
                pass

            return True

        except Exception as e:
            document.status = 'error'
            document.save()
            print(f"Erreur lors de la génération du PDF: {str(e)}")
            return False

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = serializer.save()

        if document.format == DocumentGenere.PDF:
            document.status = 'processing'
            document.save()

            success = self._generer_document_pdf(document)

            if not success:
                detail_serializer = DocumentGenereDetailSerializer(document)
                return Response(
                    {
                        'error': 'Erreur lors de la génération du document',
                        'document': detail_serializer.data
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            document.status = 'done'
            document.save()

        detail_serializer = DocumentGenereDetailSerializer(document)
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def reponses(self, request, pk=None):
        """Récupération des réponses d'un document"""
        document = self.get_object()
        reponses = document.reponses.all()
        serializer = ReponseQuestionSerializer(reponses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def par_statut(self, request):

        status_param = request.query_params.get('status', None)
        if status_param:
            documents = self.queryset.filter(status=status_param)
        else:
            documents = self.queryset.all()

        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Obtenir des statistiques sur les documents générés"""
        from django.db.models import Count, Q

        stats = DocumentGenere.objects.aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='pending')),
            processing=Count('id', filter=Q(status='processing')),
            done=Count('id', filter=Q(status='done')),
            error=Count('id', filter=Q(status='error')),
        )

        return Response(stats)


class ReponseQuestionViewSet(viewsets.GenericViewSet,
                             viewsets.mixins.ListModelMixin,
                             viewsets.mixins.RetrieveModelMixin):

    queryset = ReponseQuestion.objects.select_related('document', 'question')
    serializer_class = ReponseQuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['document', 'question']
    ordering = ['date_add']