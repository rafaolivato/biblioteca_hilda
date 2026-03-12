import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const AdicionarLivro = () => {
  const [isbn, setIsbn] = useState('');
  const [livro, setLivro] = useState<any>(null);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const buscarNoGoogle = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/livros/buscar-isbn/${isbn}`);
      setLivro(res.data);
      setMensagem({ tipo: 'success', texto: 'Livro encontrado!' });
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'ISBN não encontrado.' });
    }
  };

  const salvarNoBanco = async () => {
    try {
      // Rota que você criará no backend para dar o prisma.livro.create
      await axios.post('http://localhost:3001/livros', livro);
      setMensagem({ tipo: 'success', texto: 'Livro cadastrado com sucesso!' });
      setLivro(null);
      setIsbn('');
    } catch (err) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao salvar no banco.' });
    }
  };

  return (
    <Card className="shadow p-4 mb-4">
      <h5>Cadastrar Novo Livro</h5>
      <Row className="align-items-end mb-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label>Digite o ISBN (só números)</Form.Label>
            <Form.Control 
              value={isbn} 
              onChange={(e) => setIsbn(e.target.value)} 
              placeholder="Ex: 9788535902778"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Button variant="dark" onClick={buscarNoGoogle} className="w-100">
            Buscar Dados
          </Button>
        </Col>
      </Row>

      {livro && (
        <Card className="bg-light p-3 border-0">
          <Row>
            <Col xs={3}>
              <img src={livro.capaUrl} alt="Capa" className="img-fluid rounded shadow-sm" />
            </Col>
            <Col xs={9}>
              <h6>{livro.titulo}</h6>
              <p className="text-muted small">Autor: {livro.autor}</p>
              <Button variant="success" size="sm" onClick={salvarNoBanco}>
                Confirmar Cadastro
              </Button>
            </Col>
          </Row>
        </Card>
      )}
      {mensagem.texto && <Alert variant={mensagem.tipo} className="mt-3">{mensagem.texto}</Alert>}
    </Card>
  );
};

export default AdicionarLivro;