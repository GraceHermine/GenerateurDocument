from django.shortcuts import render
from .serializers import *
from .models import *
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

# Create your views here.
# on fait quoi oh ?
# Modeste !
# Je t'appelle non
# Tu ne réponds pas ?
# Avant de faire l'api, on doit 

class CategorieTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CategorieTemplate.objects.all()
    serializer_class = CategorieTemplateSerializer


class TemplateDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TemplateDocumentSerializer

    def get_queryset(self):
        queryset = TemplateDocument.objects.filter(status=True)
        categorie_id = self.request.query_params.get('categorie')
        if categorie_id:
            queryset = queryset.filter(categorie_id=categorie_id)
        return queryset


class FormulaireViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FormulaireSerializer

    def get_queryset(self):
        queryset = Formulaire.objects.all()
        template_id = self.request.query_params.get('template')
        if template_id:
            queryset = queryset.filter(template_id=template_id)
        return queryset


class DocumentGenereViewSet(viewsets.ModelViewSet):
    queryset = DocumentGenere.objects.all()
    serializer_class = DocumentGenereSerializer

    def create(self, request, *args, **kwargs):
        template_id = request.data.get('template_id')
        format_doc = request.data.get('format', 'docx')
        reponses = request.data.get('reponses', {})

        document = DocumentGenere.objects.create(
            template_id=template_id,
            format=format_doc,
            status='pending'
        )

        for question_id, valeur in reponses.items():
            ReponseQuestion.objects.create(
                document=document,
                question_id=question_id,
                valeur=valeur
            )

        # 👉 Plus tard : Celery
        # generate_document.delay(document.id)

        return Response(
            {
                "document_id": document.id,
                "status": document.status
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        document = self.get_object()
        return Response({
            "status": document.status
        })
