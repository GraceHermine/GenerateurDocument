# Ce code est pur Python, il ne sait pas ce qu'est une requête HTTP
from docxtpl import DocxTemplate

class DocumentEngine:
    def __init__(self, template_path):
        self.template = DocxTemplate(template_path)

    def render(self, context_data):
        # Logique complexe de nettoyage des données ici
        self.template.render(context_data)
        return self.template

    def convert_to_pdf(self, docx_path):
        # Appel à Gotenberg ou subprocess ici
        pass