"""
Serializers pour l'API Documents.
Gère la sérialisation des modèles DocumentGenere et TemplateDocument.
"""

from rest_framework import serializers
from .models import (
    CategorieTemplate, TemplateDocument, Formulaire,
    Question, TypeDocument, DocumentGenere, ReponseQuestion
)


class CategorieTemplateSerializer(serializers.ModelSerializer):
    """Serializer pour les catégories de templates"""
    templates_count = serializers.SerializerMethodField()

    class Meta:
        model = CategorieTemplate
        fields = ['id', 'nom', 'description', 'icone', 'image', 'templates_count']
        read_only_fields = ['id']

    def get_templates_count(self, obj):
        return obj.templates.filter(status=True).count()


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer pour les questions du formulaire"""

    options = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='valeur', # Le nom du champ dans l'image 8
        source='choix'
    )

    class Meta:
        model = Question
        fields = ['id', 'label', 'variable', 'type_champ', 'obligatoire', 'options']
        read_only_fields = ['id']


class FormulaireSerializer(serializers.ModelSerializer):
    """Serializer pour les formulaires avec leurs questions"""
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Formulaire
        fields = ['id', 'titre', 'date_add', 'questions']
        read_only_fields = ['id', 'date_add']


class TemplateDocumentListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des templates (vue simplifiée)"""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)

    class Meta:
        model = TemplateDocument
        fields = ['id', 'nom', 'categorie', 'categorie_nom', 'date_add', 'status']
        read_only_fields = ['id', 'date_add']


class TemplateDocumentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un template avec upload de fichier"""

    class Meta:
        model = TemplateDocument
        fields = ['id', 'nom', 'categorie', 'fichier', 'status']
        read_only_fields = ['id']

    def validate_fichier(self, value):
        """Vérifie que le fichier est un format accepté"""
        if value:
            ext = value.name.split('.')[-1].lower()
            if ext not in ['txt', 'md', 'html', 'docx', 'doc']:
                raise serializers.ValidationError(
                    "Format non supporté. Utilisez .txt, .md, .html ou .docx"
                )
        return value


class TemplateDocumentDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un template avec ses formulaires"""
    categorie_details = CategorieTemplateSerializer(source='categorie', read_only=True)
    formulaires = FormulaireSerializer(many=True, read_only=True)

    class Meta:
        model = TemplateDocument
        fields = [
            'id', 'nom', 'fichier', 'categorie', 'categorie_details',
            'formulaires', 'date_add', 'status'
        ]
        read_only_fields = ['id', 'date_add']


class ReponseQuestionSerializer(serializers.ModelSerializer):
    """Serializer pour les réponses aux questions"""
    question_label = serializers.CharField(source='question.label', read_only=True)
    question_variable = serializers.CharField(source='question.variable', read_only=True)

    class Meta:
        model = ReponseQuestion
        fields = ['id', 'question', 'question_label', 'question_variable', 'valeur', 'date_add']
        read_only_fields = ['id', 'date_add', 'question_label', 'question_variable']


class DocumentGenereListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des documents générés"""
    template_nom = serializers.CharField(source='template.nom', read_only=True)

    class Meta:
        model = DocumentGenere
        fields = [
            'id', 'template', 'template_nom', 'format',
            'status', 'date_generation', 'fichier'
        ]
        read_only_fields = ['id', 'date_generation']


class DocumentGenereDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un document généré avec ses réponses"""
    reponses = ReponseQuestionSerializer(many=True, read_only=True)
    template_details = TemplateDocumentListSerializer(source='template', read_only=True)

    class Meta:
        model = DocumentGenere
        fields = [
            'id', 'template', 'template_details', 'format',
            'fichier', 'status', 'date_generation', 'reponses'
        ]
        read_only_fields = ['id', 'date_generation', 'fichier', 'status']


class DocumentGenereCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un document avec ses réponses"""
    reponses = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        help_text="Liste des réponses: [{'question': 1, 'valeur': 'xxx'}, ...]"
    )

    class Meta:
        model = DocumentGenere
        fields = ['template', 'format', 'reponses']

    def validate_reponses(self, value):
        """Vérification que toutes les questions obligatoires ont une réponse"""
        if not value:
            raise serializers.ValidationError("Au moins une réponse est requise")

        for reponse in value:
            if 'question' not in reponse or 'valeur' not in reponse:
                raise serializers.ValidationError(
                    "Chaque réponse doit contenir 'question' et 'valeur'"
                )
        return value

    def validate(self, data):
        """Validation globale incluant les questions obligatoires"""
        template = data.get('template')
        reponses = data.get('reponses', [])

        formulaires = template.formulaires.all()
        if not formulaires.exists():
            raise serializers.ValidationError(
                "Ce template n'a pas de formulaire associé"
            )

        # On récupère les IDs des questions répondues
        # On gère le cas où 'question' est un ID (int) ou un dict (si nested)
        reponse_ids = []
        for r in reponses:
             # Si c'est juste l'ID qui arrive
            reponse_ids.append(r['question'])

        for formulaire in formulaires:
            questions_obligatoires = formulaire.questions.filter(obligatoire=True)
            
            for question in questions_obligatoires:
                if question.id not in reponse_ids:
                    raise serializers.ValidationError(
                        f"La question '{question.label}' est obligatoire"
                    )

        return data

    def create(self, validated_data):
        """Créer le document et ses réponses"""
        reponses_data = validated_data.pop('reponses')

        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        if user and user.is_authenticated:
            validated_data['user'] = user

        document = DocumentGenere.objects.create(
            template=validated_data['template'],
            format=validated_data['format'],
            status='pending',
            user=validated_data.get('user')
        )

        for reponse_data in reponses_data:
            ReponseQuestion.objects.create(
                document=document,
                question_id=reponse_data['question'],
                valeur=reponse_data['valeur']
            )

        return document


class TypeDocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les types de documents"""

    class Meta:
        model = TypeDocument
        fields = ['id', 'nom', 'extension', 'status']
        read_only_fields = ['id']