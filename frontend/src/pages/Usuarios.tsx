import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Row, Col, Card, Alert, Spinner, Modal } from 'react-bootstrap';
import axios from 'axios';

interface Usuario {
  id: string;
  nome: string;
  email?: string;
  ra: string;
  createdAt?: string;
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ra, setRa] = useState('');
  
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  
  // Modal de exclusão
  const [showModal, setShowModal] = useState(false);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<Usuario | null>(null);

  // Buscar alunos
  const fetchUsuarios = async () => {
    setCarregando(true);
    try {
      const res = await axios.get('http://localhost:3001/usuarios/alunos');
      setUsuarios(res.data);
    } catch (error) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao carregar alunos.' });
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { 
    fetchUsuarios(); 
  }, []);

  // Cadastrar novo aluno
  const cadastrarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica (apenas nome e RA)
    if (!nome || !ra) {
      setMensagem({ tipo: 'danger', texto: 'Nome e RA são obrigatórios!' });
      return;
    }

    setCarregando(true);
    
    try {
      await axios.post('http://localhost:3001/usuarios', { 
        nome, 
        email: email || undefined, // Se email estiver vazio, não envia
        ra, 
        senha: '123456', // Senha padrão
        role: 'USER' 
      });
      
      setMensagem({ tipo: 'success', texto: 'Aluno cadastrado com sucesso!' });
      setNome(''); 
      setEmail('');
      setRa('');
      fetchUsuarios();
      
      setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
      
    } catch (err: any) {
      const erro = err.response?.data?.error || 'Erro ao cadastrar aluno.';
      setMensagem({ tipo: 'danger', texto: erro });
    } finally {
      setCarregando(false);
    }
  };

  // Função para excluir aluno
  const excluirAluno = async () => {
    if (!usuarioParaExcluir) return;
    
    setCarregando(true);
    
    try {
      await axios.delete(`http://localhost:3001/usuarios/${usuarioParaExcluir.id}`);
      setMensagem({ tipo: 'success', texto: 'Aluno excluído com sucesso!' });
      fetchUsuarios();
      setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
    } catch (err: any) {
      const erro = err.response?.data?.error || 'Erro ao excluir aluno.';
      setMensagem({ tipo: 'danger', texto: erro });
    } finally {
      setCarregando(false);
      setShowModal(false);
      setUsuarioParaExcluir(null);
    }
  };

  return (
    <Container className="mt-4">
      {/* Card de Cadastro */}
      <Card className="p-4 mb-4 shadow-sm border-0">
        <h4 className="mb-4">📝 Cadastrar Novo Aluno</h4>
        
        {mensagem.texto && (
          <Alert variant={mensagem.tipo} dismissible onClose={() => setMensagem({ tipo: '', texto: '' })}>
            {mensagem.texto}
          </Alert>
        )}
        
        <Form onSubmit={cadastrarAluno}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Nome Completo *</Form.Label>
                <Form.Control 
                  placeholder="Digite o nome completo" 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  required 
                  disabled={carregando}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>RA *</Form.Label>
                <Form.Control 
                  placeholder="Nº de matrícula" 
                  value={ra} 
                  onChange={e => setRa(e.target.value)} 
                  required 
                  disabled={carregando}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>E-mail (opcional)</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  disabled={carregando}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                type="submit" 
                variant="success" 
                className="w-100 mb-3"
                disabled={carregando}
              >
                {carregando ? <Spinner size="sm" /> : 'Cadastrar'}
              </Button>
            </Col>
          </Row>
          <Form.Text className="text-muted">
            * Campos obrigatórios | Senha padrão: 123456
          </Form.Text>
        </Form>
      </Card>

      {/* Lista de Alunos */}
      <Card className="p-4 shadow-sm border-0">
        <h4 className="mb-4">📋 Lista de Alunos ({usuarios.length})</h4>
        
        {carregando && !usuarios.length ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>RA</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th style={{ width: '100px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((u: Usuario) => (
                  <tr key={u.id}>
                    <td><strong>{u.ra}</strong></td>
                    <td>{u.nome}</td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => {
                          setUsuarioParaExcluir(u);
                          setShowModal(true);
                        }}
                        disabled={carregando}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-3">
                    Nenhum aluno cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioParaExcluir && (
            <p>
              Tem certeza que deseja excluir o aluno <strong>{usuarioParaExcluir.nome}</strong> 
              (RA: <strong>{usuarioParaExcluir.ra}</strong>)?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={excluirAluno}
            disabled={carregando}
          >
            {carregando ? 'Excluindo...' : 'Sim, excluir'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Usuarios;