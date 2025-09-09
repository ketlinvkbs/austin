from rest_framework import viewsets, filters, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from .models import Cliente, Endereco, Telefone, ClienteTelefone
from .serializers import UserDetailSerializer, ClienteSerializer, UserSerializer, EnderecoSerializer, ClienteTelefoneSerializer, ClienteTelefoneCreateSerializer
from django.shortcuts import render

# Create your views here.

class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    #Define as classes de backend para processar filtros
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
    # define os campos permitidos para o djangofilterbackend
    filterset_fields = ['status']

    # Define os campos permitidos para o searchfilter
    search_fields = ['nome', 'email', 'observacoes']
    @action(detail=True, methods=['post'])
    
    def get_queryset(self):
        user = self.request.user
        return Cliente.objects.filter(proprietario=user).order_by('nome')

    def change_status(self, request, pk=None):
        cliente =self.get_object()
        status_order = ['ATIVO', 'INATIVO', 'ARQUIVADO']
            
        try: 
            current_index = status_order.index(cliente.status)
            next_index = (current_index + 1) % len(status_order)
            cliente.status = status_order[next_index]
            cliente.save()
            serializer = self.get_serializer(cliente)
            return Response(serializer.data)
        except (ValueError, IndexError):
            return Response({'error': 'Status inválido'}, status=400)
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class EnderecoViewSet(viewsets.ModelViewSet):
    queryset = Endereco.objects.all()
    serializer_class = EnderecoSerializer

class ClienteTelefoneViewSet(viewsets.ModelViewSet):

    queryset = ClienteTelefone.objects.all()
    serializer_class = ClienteTelefoneCreateSerializer

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

def index(request):
    return render(request, 'index.html')

def app(request):
    return render(request, 'app.html')

