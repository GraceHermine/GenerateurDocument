from rest_framework import serializers
from.models import *


class CategorieTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        models = CategorieTemplate
        fields = '__all__'


class TemplateDocumentSerializer(serializers.ModelSerializer):

    class Meta:
        models = TemplateDocument
        fields = '__all__'


class FormulaireSerializer(serializers.ModelSerializer):
    template = TemplateDocumentSerializer(read_only = True)
    ftemplate_id = serializers
    class Meta:
        models = Formulaire
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):

    formulaire = FormulaireSerializer(read_only = True)
    formulaire_id = serializers.PrimaryKeyRelatedField(queryset = Formulaire.objects.all(), write_only = True)

    class Meta:
        models = Question
        fields = '__all__'


class TypeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        models = TypeDocument
        fields = '__all__'


class DocumentGenereSerializer(serializers.ModelSerializer):

    template = TypeDocumentSerializer(read_only =True)
    template_id = serializers.PrimaryKeyRelatedField(queryset = TemplateDocument.objects.all(), write_only = True)

    class Meta:
        models = DocumentGenere
        fields = '__all__'


class ReponseQuestionSerializer(serializers.ModelSerializer):
    document = DocumentGenereSerializer(read_only = True)
    document_id = serializers.PrimaryKeyRelatedField(queryset = DocumentGenere.objects.all(), write_only = True)
    question = QuestionSerializer(read_only = True)
    question_id = serializers.PrimaryKeyRelatedField(queryset= Question.objects.all(), write_only = True)
    class Meta:
        models = ReponseQuestion
        fields = '__all__'







