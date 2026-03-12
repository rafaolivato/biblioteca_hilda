import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

interface Livro {
  isbn: string;
  titulo: string;
  autor: string;
  capaUrl?: string;
}

const AdicionarLivro = () => {
  const [isbn, setIsbn] = useState('');
  const [livro, setLivro] = useState<Livro | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Estado para edição manual
  const [editando, setEditando] = useState(false);
  const [livroEditado, setLivroEditado] = useState<Livro>({
    isbn: '',
    titulo: '',
    autor: '',
    capaUrl: ''
  });

  // Buscar livro por ISBN
  const buscarNoGoogle = async () => {
    if (!isbn.trim()) {
      setMensagem({ tipo: 'warning', texto: 'Digite um ISBN' });
      return;
    }

    setCarregando(true);
    setMensagem({ tipo: '', texto: '' });
    
    try {
      const res = await axios.get(`http://localhost:3001/livros/buscar-isbn/${isbn}`);
      setLivro(res.data);
      setLivroEditado(res.data); // Preenche edição com dados encontrados
      setEditando(false);
      setMensagem({ tipo: 'success', texto: 'Livro encontrado!' });
    } catch (err) {
      setMensagem({ 
        tipo: 'warning', 
        texto: 'ISBN não encontrado. Preencha os dados manualmente.' 
      });
      // Prepara para cadastro manual
      setLivroEditado({
        isbn: isbn.replace(/\D/g, ''),
        titulo: '',
        autor: '',
        capaUrl: ''
      });
      setEditando(true);
      setLivro(null);
    } finally {
      setCarregando(false);
    }
  };

  // Salvar livro no banco
  const salvarNoBanco = async () => {
    // Validação básica
    if (!livroEditado.titulo || !livroEditado.autor) {
      setMensagem({ tipo: 'danger', texto: 'Título e autor são obrigatórios' });
      return;
    }

    setCarregando(true);
    
    try {
      const livroParaSalvar = editando ? livroEditado : livro;
      
      const response = await axios.post('http://localhost:3001/livros', livroParaSalvar);
      
      // Mostra mensagem apropriada
      if (response.data.isNovo) {
        setMensagem({ tipo: 'success', texto: '✅ Livro cadastrado com sucesso!' });
      } else {
        setMensagem({ tipo: 'info', texto: response.data.mensagem });
      }
      
      // Limpa o formulário
      setLivro(null);
      setLivroEditado({ isbn: '', titulo: '', autor: '', capaUrl: '' });
      setIsbn('');
      setEditando(false);
      
    } catch (err: any) {
      if (err.response?.status === 409) {
        setMensagem({ tipo: 'warning', texto: 'ISBN já cadastrado!' });
      } else {
        setMensagem({ tipo: 'danger', texto: err.response?.data?.error || 'Erro ao salvar.' });
      }
    } finally {
      setCarregando(false);
    }
  };

  // Atualizar campos do formulário manual
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLivroEditado(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="shadow p-4">
      <h4 className="mb-4">📚 Adicionar Livro ao Acervo</h4>
      
      {/* Busca por ISBN */}
      <Row className="mb-4">
        <Col md={8}>
          <Form.Group>
            <Form.Label>Buscar por ISBN</Form.Label>
            <Form.Control 
              value={isbn} 
              onChange={(e) => setIsbn(e.target.value)} 
              placeholder="Digite o ISBN (ex: 9788535902778)"
              disabled={carregando}
            />
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button 
            variant="dark" 
            onClick={buscarNoGoogle} 
            className="w-100"
            disabled={carregando}
          >
            {carregando ? <Spinner size="sm" /> : 'Buscar'}
          </Button>
        </Col>
      </Row>

      {/* Mensagens */}
      {mensagem.texto && (
        <Alert variant={mensagem.tipo} onClose={() => setMensagem({ tipo: '', texto: '' })} dismissible>
          {mensagem.texto}
        </Alert>
      )}

      {/* Formulário do Livro (aparece quando tem dados) */}
      {(livro || editando) && (
        <Card className="bg-light p-4 border-0">
          <h5 className="mb-3">
            {editando ? '✏️ Cadastro Manual' : '📖 Dados do Livro'}
          </h5>
          
          <Row>
            {/* Capa (se existir) */}
            {(livro?.capaUrl || livroEditado?.capaUrl) && !editando && (
              <Col md={3} className="mb-3">
                <img 
                  src={livro?.capaUrl || livroEditado?.capaUrl} 
                  alt="Capa" 
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: '150px' }}
                />
              </Col>
            )}
            
            {/* Formulário */}
            <Col md={livro?.capaUrl && !editando ? 9 : 12}>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>ISBN</Form.Label>
                  <Form.Control
                    type="text"
                    name="isbn"
                    value={livroEditado.isbn}
                    onChange={handleInputChange}
                    disabled={!editando}
                    readOnly={!editando}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo"
                    value={livroEditado.titulo}
                    onChange={handleInputChange}
                    disabled={!editando}
                    readOnly={!editando}
                    placeholder="Digite o título"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Autor</Form.Label>
                  <Form.Control
                    type="text"
                    name="autor"
                    value={livroEditado.autor}
                    onChange={handleInputChange}
                    disabled={!editando}
                    readOnly={!editando}
                    placeholder="Digite o autor"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>URL da Capa (opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="capaUrl"
                    value={livroEditado.capaUrl || ''}
                    onChange={handleInputChange}
                    disabled={!editando}
                    readOnly={!editando}
                    placeholder="https://..."
                  />
                </Form.Group>

                {/* Botões */}
                <div className="d-flex gap-2">
                  {!editando && livro && (
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setEditando(true)}
                      size="sm"
                    >
                      ✏️ Editar
                    </Button>
                  )}
                  
                  <Button 
                    variant="success" 
                    onClick={salvarNoBanco}
                    disabled={carregando}
                  >
                    {carregando ? 'Salvando...' : '📥 Adicionar ao Acervo'}
                  </Button>

                  {editando && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setEditando(false);
                        setLivro(null);
                        setLivroEditado({ isbn: '', titulo: '', autor: '', capaUrl: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Form>
            </Col>
          </Row>
        </Card>
      )}
    </Card>
  );
};

export default AdicionarLivro;