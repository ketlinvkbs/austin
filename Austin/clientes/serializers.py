from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Cliente, Endereco, Telefone, ClienteTelefone

class EnderecoSerializer(serializers.ModelSerializer):
    cliente_id = serializers.IntegerField(write_only=True, required=False)
    class Meta:
        model = Endereco
        fields = '__all__'
        
    def create(self, validated_data):
        cliente_id = validated_data.pop('cliente_id')
        try:
            cliente = Cliente.objects.get(id=cliente_id)

        except Cliente.DoesNotExist:
            raise serializers.ValidationError("Cliente não encontrado. ")
        
        endereco = Endereco.objects.create(**validated_data)
        cliente.enderecos.add(endereco)
        
        return endereco
    
    def update(self, instance, validated_data):
        
        validated_data.pop('cliente_id', None)
        return super().update(instance, validated_data)
        
class TelefoneSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Telefone
        fields = '__all__'
    
class ClienteTelefoneSerializer(serializers.ModelSerializer):
    telefone = TelefoneSerializer()
    
    class Meta:
        model = ClienteTelefone
        fields = ['id', 'telefone', 'tipo']

class ClienteTelefoneCreateSerializer(serializers.ModelSerializer):
    numero = serializers.CharField(source='telefone.numero')
    
    class Meta:
        model = ClienteTelefone
        fields = ['cliente', 'numero', 'tipo']
        
    def create(self, validated_data):
        telefone_data = validated_data.pop('telefone')
        numero = telefone_data['numero']
        telefone_obj, created = Telefone.objects.get_or_create(numero=numero)
        cliente_telefone = ClienteTelefone.objects.create(telefone=telefone_obj, **validated_data)
        return cliente_telefone
    
    def update(self, instance, validated_data):
        # 1. Atualiza o tipo da relação com o novo valor, se ele foi enviado.
        validated_data.pop('cliente', None)  # Remove cliente para evitar conflito
        instance.tipo = validated_data.get('tipo', instance.tipo)

        # 2. Verifica se um novo número de telefone foi enviado.
        telefone_data = validated_data.get('telefone')
        if telefone_data:
            numero = telefone_data.get('numero')
            if numero:
                # Encontra ou cria o novo objeto Telefone.
                telefone_obj, created = Telefone.objects.get_or_create(numero=numero)
                # Associa a relação a este novo objeto de telefone.
                instance.telefone = telefone_obj

        # 3. Guarda todas as alterações feitas na instância da relação.
        instance.save()
        
        # 4. Retorna a instância atualizada.
        return instance
    
class ClienteSerializer(serializers.ModelSerializer):
    
    enderecos = EnderecoSerializer(many=True, required=False)
    telefones = ClienteTelefoneSerializer(source='clientetelefone_set', many=True, required=False)
    
    class Meta:
        model = Cliente
        fields = [
            'id',
            'nome',
            'email',
            'observacoes',
            'data_criacao',
            'data_atualizacao',
            'status',
            'enderecos',
            'telefones',
        ]
    def create(self, validated_data):
        user = self.context['request'].user
        enderecos_data = validated_data.pop('enderecos', [])
        telefones_data = validated_data.pop('clientetelefone_set', [])
        cliente = Cliente.objects.create(proprietario=user, **validated_data)
        for endereco_data in enderecos_data:
            endereco = Endereco.objects.create(**endereco_data)
            cliente.enderecos.add(endereco)
            
        for telefone_info in telefones_data:
            telefone_data = telefone_info['telefone']
            tipo = telefone_info['tipo']
            telefone, created = Telefone.objects.get_or_create(**telefone_data)
            ClienteTelefone.objects.create(cliente=cliente, telefone=telefone, tipo=tipo)
        return cliente
    
    def update(self, instance, validated_data):
        instance.nome = validated_data.get('nome', instance.nome)
        instance.email = validated_data.get('email', instance.email)
        instance.observacoes = validated_data.get('observacoes', instance.observacoes)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        
        enderecos_data = validated_data.get('enderecos', [])
        telefones_data = validated_data.get('clientetelefone_set', [])
        
        if enderecos_data:
            instance.enderecos.clear( )# Limpa os endereços existentes
            for endereco_data in enderecos_data:
                endereco = Endereco.objects.create(**endereco_data)
                instance.enderecos.add(endereco)
                
        if telefones_data:
            instance.telefones.clear()  # Limpa os telefones existentes
            for telefone_info in telefones_data:
                telefone_data = telefone_info['telefone']
                tipo = telefone_info['tipo']
                telefone, created = Telefone.objects.get_or_create(**telefone_data)
                ClienteTelefone.objects.create(cliente=instance, telefone=telefone, tipo=tipo)
        return instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['password', 'email', 'username', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class UserDetailSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']