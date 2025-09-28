
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, EnderecoViewSet, ClienteTelefoneViewSet


router = DefaultRouter()

router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'enderecos', EnderecoViewSet, basename='endereco')
router.register(r'cliente-telefones', ClienteTelefoneViewSet, basename='cliente-telefone')


urlpatterns = [
    path('', include(router.urls)),
]