# apps/documents/tasks.py
from celery import shared_task
from services.doc_generator import DocumentEngine
from apps.documents.models import Document

@shared_task
def generate_document_async(doc_id):
    doc = Document.objects.get(id=doc_id)
    doc.statut = 'PROCESSING'
    doc.save()
    
    try:
        engine = DocumentEngine(doc.template.fichier.path)
        # ... logique de génération ...
        doc.statut = 'COMPLETED'
    except Exception as e:
        doc.statut = 'FAILED'
        doc.error_log = str(e)
    
    doc.save()