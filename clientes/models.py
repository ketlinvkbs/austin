from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Endereco(models.Model):
    logadouro = models.CharField(max_length=100, help_text="Ex: Rua, Avenida, Travessa")
    numero = models.CharField(max_length=10)
    complemento = models.CharField(max_length=50, blank=True, null=True)
    bairro = models.CharField(max_length=50)
    cidade = models.CharField(max_length=50)
    estado = models.CharField(max_length=2)
    cep = models.CharField(max_length=9, blank=True, null=True)
    pais = models.CharField(max_length=50, default='Brasil')
    
    def __str__ (self):
        return f"{self.logadouro}, {self.numero} - {self.cidade}/{self.estado}"
    
class Telefone(models.Model):
    numero = models.CharField(max_length=15, help_text="Ex: (99) 99999-9999",unique=True) 
    
    def __str__(self):
        return self.numero
    
class Cliente(models.Model):
    # dados clientes
    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    nome_empresa = models.CharField(max_length=255, blank=True, null=True)
    cnpj = models.CharField(max_length=18, blank=True, null=True)
    tipo_empresa = models.CharField(max_length=100, blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    proprietario = models.ForeignKey(User, on_delete=models.CASCADE)

    # Status cliente
    STATUS_CHOICES = [
        ('ATIVO','Ativo'),
        ('INATIVO','Inativo'),
        ('ARQUIVADO','Arquivado'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ATIVO')
    
    # enderço
    enderecos = models.ManyToManyField(Endereco, blank=True)
    # telefones
    telefones = models.ManyToManyField(Telefone, through='ClienteTelefone', blank=True)
    
    def __str__(self):
        return self.nome
    
class ClienteTelefone(models.Model):
    TIPO_CHOICES = [
        ('RESIDENCIAL', 'Residencial'),
        ('COMERCIAL', 'Comercial'),
        ('CELULAR', 'Celular'),

        ('OUTRO', 'Outro'),]
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    telefone = models.ForeignKey(Telefone, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='CELULAR')
    
    class Meta:
        unique_together = ('cliente', 'telefone')
        
    def __str__(self):
        return f"{self.cliente.nome} - {self.telefone.numero} ({self.tipo})"
    